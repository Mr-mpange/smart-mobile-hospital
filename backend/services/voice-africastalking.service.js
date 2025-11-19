const axios = require('axios');
const VoiceSession = require('../models/VoiceSession');
const DoctorCallQueue = require('../models/DoctorCallQueue');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Case = require('../models/Case');
const SMSService = require('./sms.service');

/**
 * Africa's Talking Voice Service
 * Handles IVR and voice call functionality using Africa's Talking Voice API
 */
class AfricasTalkingVoiceService {
  /**
   * Handle incoming voice call
   */
  static async handleIncomingCall(sessionId, phoneNumber, isActive) {
    // Get or create user
    let user = await User.findByPhone(phoneNumber);
    if (!user) {
      user = await User.create(phoneNumber);
    }

    // Create voice session
    await VoiceSession.create(user.id, sessionId, sessionId);

    // Build response XML
    let response = '<?xml version="1.0" encoding="UTF-8"?>';
    response += '<Response>';
    
    if (isActive === '1') {
      // Active call - show menu
      response += '<GetDigits timeout="30" finishOnKey="#" callbackUrl="' + 
                  process.env.API_BASE_URL + '/api/voice/menu">';
      response += '<Say voice="man" playBeep="false">';
      response += 'Welcome to SmartHealth. ';
      response += 'Press 1 for free trial consultation. ';
      response += 'Press 2 for paid consultation. ';
      response += 'Press 3 for consultation history.';
      response += '</Say>';
      response += '</GetDigits>';
      response += '<Say>We did not receive your input. Goodbye.</Say>';
    } else {
      response += '<Say>Thank you for calling SmartHealth. Goodbye.</Say>';
    }
    
    response += '</Response>';

    return response;
  }

  /**
   * Handle menu selection
   */
  static async handleMenu(sessionId, dtmfDigits, phoneNumber) {
    const user = await User.findByPhone(phoneNumber);

    // Update session step
    await VoiceSession.updateSession(sessionId, 'menu_selected', { choice: dtmfDigits });

    let response = '<?xml version="1.0" encoding="UTF-8"?>';
    response += '<Response>';

    switch (dtmfDigits) {
      case '1':
        // Trial consultation
        response += await this.handleTrialConsultation(user, sessionId);
        break;
      
      case '2':
        // Paid consultation
        response += await this.handlePaidConsultation(user, sessionId);
        break;
      
      case '3':
        // History
        response += await this.handleHistory(user, sessionId);
        break;
      
      default:
        response += '<Say>Invalid option. Please try again.</Say>';
        response += '<Redirect>' + process.env.API_BASE_URL + '/api/voice/incoming</Redirect>';
    }

    response += '</Response>';
    return response;
  }

  /**
   * Handle trial consultation
   */
  static async handleTrialConsultation(user, sessionId) {
    const isInTrial = await User.isInTrial(user.id);

    if (!isInTrial) {
      return '<Say>Your trial period has ended. Please choose paid consultation.</Say>' +
             '<Redirect>' + process.env.API_BASE_URL + '/api/voice/incoming</Redirect>';
    }

    // Record symptoms
    return '<Record finishOnKey="#" maxLength="60" trimSilence="true" ' +
           'callbackUrl="' + process.env.API_BASE_URL + '/api/voice/process-symptoms">' +
           '<Say>Please describe your symptoms after the beep. Press hash when finished.</Say>' +
           '</Record>';
  }

  /**
   * Handle paid consultation
   */
  static async handlePaidConsultation(user, sessionId) {
    // Get available doctors
    const doctors = await Doctor.getAvailable();

    if (doctors.length === 0) {
      return '<Say>No doctors are currently available. Please try again later.</Say>';
    }

    // Store doctors in session
    await VoiceSession.updateSession(sessionId, 'doctor_selection', { doctors });

    // Build doctor list
    let response = '<GetDigits timeout="30" finishOnKey="#" ' +
                   'callbackUrl="' + process.env.API_BASE_URL + '/api/voice/select-doctor">';
    response += '<Say>Available doctors. ';
    
    doctors.forEach((doc, index) => {
      response += `Press ${index + 1} for Doctor ${doc.name}, ${doc.specialization}, fee ${doc.fee} shillings. `;
    });
    
    response += '</Say>';
    response += '</GetDigits>';
    response += '<Say>We did not receive your selection.</Say>';

    return response;
  }

  /**
   * Handle doctor selection
   */
  static async handleDoctorSelection(sessionId, dtmfDigits, phoneNumber) {
    const user = await User.findByPhone(phoneNumber);
    const sessionData = await VoiceSession.getSessionData(sessionId);

    let response = '<?xml version="1.0" encoding="UTF-8"?>';
    response += '<Response>';

    if (!sessionData || !sessionData.doctors) {
      response += '<Say>Session expired. Please call again.</Say>';
      response += '</Response>';
      return response;
    }

    const doctorIndex = parseInt(dtmfDigits) - 1;
    const selectedDoctor = sessionData.doctors[doctorIndex];

    if (!selectedDoctor) {
      response += '<Say>Invalid selection. Please try again.</Say>';
      response += '<Redirect>' + process.env.API_BASE_URL + '/api/voice/menu</Redirect>';
      response += '</Response>';
      return response;
    }

    // Store selected doctor
    await VoiceSession.updateSession(sessionId, 'doctor_selected', {
      ...sessionData,
      selectedDoctor
    });

    // Record symptoms
    response += '<Record finishOnKey="#" maxLength="60" trimSilence="true" ' +
                'callbackUrl="' + process.env.API_BASE_URL + '/api/voice/process-symptoms">';
    response += '<Say>You selected Doctor ' + selectedDoctor.name + '. ';
    response += 'Please describe your symptoms after the beep. Press hash when finished.</Say>';
    response += '</Record>';
    response += '</Response>';

    return response;
  }

  /**
   * Process symptoms recording
   */
  static async processSymptoms(sessionId, recordingUrl, phoneNumber) {
    const user = await User.findByPhone(phoneNumber);
    const sessionData = await VoiceSession.getSessionData(sessionId);

    // Store recording URL
    await VoiceSession.updateSession(sessionId, 'symptoms_recorded', {
      ...sessionData,
      recordingUrl
    });

    let response = '<?xml version="1.0" encoding="UTF-8"?>';
    response += '<Response>';
    response += '<Say>Thank you. We are connecting you to a doctor. Please wait.</Say>';
    
    // Play hold music
    response += '<Play url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"/>';

    // Create case
    const symptoms = `Voice consultation - Recording: ${recordingUrl}`;
    const consultationType = await User.isInTrial(user.id) ? 'trial' : 'paid';
    const caseData = await Case.create(user.id, symptoms, consultationType, 0);

    // Determine doctor
    let doctorId;
    if (sessionData.selectedDoctor) {
      doctorId = sessionData.selectedDoctor.id;
    } else {
      // Auto-assign
      const assignedCase = await Case.autoAssign(caseData.id);
      doctorId = assignedCase.doctor_id;
    }

    // Create call queue entry
    await DoctorCallQueue.create(doctorId, user.id, caseData.id, sessionId);

    // Notify doctor
    await this.notifyDoctor(doctorId, user, caseData);

    // Redirect to wait endpoint
    response += '<Redirect>' + process.env.API_BASE_URL + '/api/voice/wait-for-doctor</Redirect>';
    response += '</Response>';

    return response;
  }

  /**
   * Wait for doctor to accept
   */
  static async waitForDoctor(sessionId) {
    let response = '<?xml version="1.0" encoding="UTF-8"?>';
    response += '<Response>';
    
    // Check if doctor accepted
    const callRequest = await DoctorCallQueue.findByCallSid(sessionId);

    if (!callRequest) {
      response += '<Say>Unable to process your request. Please try again.</Say>';
      response += '</Response>';
      return response;
    }

    if (callRequest.status === 'accepted') {
      // Bridge to doctor
      response += '<Say>Connecting you to the doctor now.</Say>';
      response += '<Dial phoneNumbers="' + callRequest.doctor_phone + '" ' +
                  'record="true" sequential="true" ' +
                  'callbackUrl="' + process.env.API_BASE_URL + '/api/voice/call-completed">';
      response += '</Dial>';
    } else if (callRequest.status === 'rejected') {
      response += '<Say>The doctor is currently unavailable. We will send you an SMS with alternative options.</Say>';
    } else {
      // Still pending, keep waiting
      response += '<Say>Please continue to hold. A doctor will be with you shortly.</Say>';
      response += '<Play url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"/>';
      response += '<Redirect>' + process.env.API_BASE_URL + '/api/voice/wait-for-doctor</Redirect>';
    }

    response += '</Response>';
    return response;
  }

  /**
   * Handle call completion
   */
  static async handleCallCompleted(sessionId, durationInSeconds, phoneNumber) {
    const callRequest = await DoctorCallQueue.findByCallSid(sessionId);

    if (callRequest) {
      // Update call queue
      await DoctorCallQueue.complete(callRequest.id, durationInSeconds);

      // Update case
      await Case.updateStatus(callRequest.case_id, 'completed');

      // Update voice session
      await VoiceSession.completeSession(sessionId, durationInSeconds);

      // Increment consultation count
      await User.incrementConsultationCount(callRequest.user_id);

      // Send follow-up SMS
      const user = await User.findById(callRequest.user_id);
      await SMSService.sendSMS(
        user.phone,
        `Thank you for using SmartHealth. Your consultation with ${callRequest.doctor_name} has been completed. Case #${callRequest.case_id}`
      );
    }

    let response = '<?xml version="1.0" encoding="UTF-8"?>';
    response += '<Response>';
    response += '<Say>Thank you for using SmartHealth. Goodbye.</Say>';
    response += '</Response>';

    return response;
  }

  /**
   * Handle consultation history
   */
  static async handleHistory(user, sessionId) {
    const history = await User.getConsultationHistory(user.id, 3);

    let response = '';
    
    if (history.length === 0) {
      response += '<Say>You have no consultation history yet.</Say>';
    } else {
      response += '<Say>Your recent consultations. ';
      history.forEach((item, index) => {
        response += `${index + 1}. ${item.doctor_name || 'Pending'}, status ${item.status}. `;
      });
      response += '</Say>';
    }

    response += '<Say>Thank you for calling SmartHealth. Goodbye.</Say>';

    return response;
  }

  /**
   * Notify doctor of incoming call request
   */
  static async notifyDoctor(doctorId, user, caseData) {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) return;

    // Send SMS notification
    const message = `New voice consultation request from ${user.name || user.phone}. Case #${caseData.id}. Login to dashboard to accept or reject.`;
    
    await SMSService.sendSMS(doctor.phone, message);
  }

  /**
   * Make outbound call to doctor
   */
  static async callDoctor(doctorPhone, callRequestId) {
    try {
      const response = await axios.post(
        'https://voice.africastalking.com/call',
        {
          username: process.env.AT_USERNAME,
          to: doctorPhone,
          from: process.env.AT_VOICE_PHONE_NUMBER,
          callbackUrl: `${process.env.API_BASE_URL}/api/voice/doctor-call?requestId=${callRequestId}`
        },
        {
          headers: {
            'apiKey': process.env.AT_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to call doctor:', error.message);
      throw error;
    }
  }

  /**
   * Handle doctor call webhook
   */
  static async handleDoctorCall(requestId, isActive) {
    const callRequest = await DoctorCallQueue.findById(requestId);

    let response = '<?xml version="1.0" encoding="UTF-8"?>';
    response += '<Response>';

    if (!callRequest) {
      response += '<Say>Invalid request.</Say>';
      response += '</Response>';
      return response;
    }

    if (isActive === '1') {
      response += '<GetDigits timeout="30" finishOnKey="#" ' +
                  'callbackUrl="' + process.env.API_BASE_URL + '/api/voice/doctor-response?requestId=' + requestId + '">';
      response += '<Say>You have a consultation request from ' + callRequest.user_name + '. ';
      response += 'Press 1 to accept. Press 2 to reject.</Say>';
      response += '</GetDigits>';
      response += '<Say>We did not receive your response.</Say>';
    }

    response += '</Response>';
    return response;
  }

  /**
   * Handle doctor response to call request
   */
  static async handleDoctorResponse(requestId, dtmfDigits, doctorPhone) {
    const callRequest = await DoctorCallQueue.findById(requestId);

    let response = '<?xml version="1.0" encoding="UTF-8"?>';
    response += '<Response>';

    if (dtmfDigits === '1') {
      // Accept
      await DoctorCallQueue.accept(requestId, doctorPhone);
      response += '<Say>Request accepted. The patient will be connected to you shortly.</Say>';
    } else {
      // Reject
      await DoctorCallQueue.reject(requestId, 'Doctor declined');
      response += '<Say>Request rejected. Thank you.</Say>';
    }

    response += '</Response>';
    return response;
  }
}

module.exports = AfricasTalkingVoiceService;
