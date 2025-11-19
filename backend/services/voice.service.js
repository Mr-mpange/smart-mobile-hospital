const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Case = require('../models/Case');
const VoiceSession = require('../models/VoiceSession');
const DoctorCallQueue = require('../models/DoctorCallQueue');
const SMSService = require('./sms.service');

// Import voice providers
const TwilioVoiceService = require('./voice-twilio.service');
const AfricasTalkingVoiceService = require('./voice-africastalking.service');

/**
 * Voice Service
 * Handles IVR and voice call functionality with live doctor bridging
 * Supports both Twilio and Africa's Talking
 */
class VoiceService {
  /**
   * Get the configured voice provider
   */
  static getProvider() {
    const provider = process.env.VOICE_PROVIDER || 'africastalking';
    return provider.toLowerCase();
  }

  /**
   * Get the voice service implementation
   */
  static getService() {
    const provider = this.getProvider();
    
    if (provider === 'twilio') {
      return TwilioVoiceService;
    } else {
      return AfricasTalkingVoiceService;
    }
  }
  /**
   * Handle incoming voice call
   */
  static async handleIncomingCall(callSid, from, to, isActive) {
    const service = this.getService();
    return service.handleIncomingCall(callSid, from, to, isActive);
    
    // Get or create user
    let user = await User.findByPhone(from);
    if (!user) {
      user = await User.create(from);
    }

    // Create voice session
    await VoiceSession.create(user.id, `voice_${Date.now()}`, callSid);

    // Welcome message
    const gather = twiml.gather({
      numDigits: 1,
      action: '/api/voice/menu',
      method: 'POST',
      timeout: 10
    });

    gather.say(
      'Welcome to SmartHealth. Press 1 for free trial consultation. Press 2 for paid consultation. Press 3 for consultation history.',
      { voice: 'alice', language: 'en-US' }
    );

    // If no input, repeat
    twiml.redirect('/api/voice/incoming');

    return twiml.toString();
  }

  /**
   * Handle menu selection
   */
  static async handleMenu(callSid, digits, from) {
    const twiml = new VoiceResponse();
    const user = await User.findByPhone(from);

    // Update session step
    await VoiceSession.updateSession(callSid, 'menu_selected', { choice: digits });

    switch (digits) {
      case '1':
        // Trial consultation
        return this.handleTrialConsultation(twiml, user, callSid);
      
      case '2':
        // Paid consultation
        return this.handlePaidConsultation(twiml, user, callSid);
      
      case '3':
        // History
        return this.handleHistory(twiml, user, callSid);
      
      default:
        twiml.say('Invalid option. Please try again.');
        twiml.redirect('/api/voice/incoming');
        return twiml.toString();
    }
  }

  /**
   * Handle trial consultation
   */
  static async handleTrialConsultation(twiml, user, callSid) {
    const isInTrial = await User.isInTrial(user.id);

    if (!isInTrial) {
      twiml.say('Your trial period has ended. Please choose paid consultation.');
      twiml.redirect('/api/voice/incoming');
      return twiml.toString();
    }

    // Record symptoms
    twiml.say('Please describe your symptoms after the beep. Press pound when finished.');
    
    twiml.record({
      action: '/api/voice/process-symptoms',
      method: 'POST',
      maxLength: 60,
      finishOnKey: '#',
      transcribe: true,
      transcribeCallback: '/api/voice/transcription'
    });

    return twiml.toString();
  }

  /**
   * Handle paid consultation
   */
  static async handlePaidConsultation(twiml, user, callSid) {
    // Get available doctors
    const doctors = await Doctor.getAvailable();

    if (doctors.length === 0) {
      twiml.say('No doctors are currently available. Please try again later.');
      twiml.hangup();
      return twiml.toString();
    }

    // Store doctors in session
    await VoiceSession.updateSession(callSid, 'doctor_selection', { doctors });

    // Read doctor list
    const gather = twiml.gather({
      numDigits: 1,
      action: '/api/voice/select-doctor',
      method: 'POST',
      timeout: 10
    });

    let message = 'Available doctors. ';
    doctors.forEach((doc, index) => {
      message += `Press ${index + 1} for Doctor ${doc.name}, ${doc.specialization}, fee ${doc.fee} shillings. `;
    });

    gather.say(message, { voice: 'alice', language: 'en-US' });

    twiml.redirect('/api/voice/menu');

    return twiml.toString();
  }

  /**
   * Handle doctor selection
   */
  static async handleDoctorSelection(callSid, digits, from) {
    const twiml = new VoiceResponse();
    const user = await User.findByPhone(from);
    const sessionData = await VoiceSession.getSessionData(callSid);

    if (!sessionData || !sessionData.doctors) {
      twiml.say('Session expired. Please call again.');
      twiml.hangup();
      return twiml.toString();
    }

    const doctorIndex = parseInt(digits) - 1;
    const selectedDoctor = sessionData.doctors[doctorIndex];

    if (!selectedDoctor) {
      twiml.say('Invalid selection. Please try again.');
      twiml.redirect('/api/voice/menu');
      return twiml.toString();
    }

    // Store selected doctor
    await VoiceSession.updateSession(callSid, 'doctor_selected', {
      ...sessionData,
      selectedDoctor
    });

    // Record symptoms
    twiml.say(`You selected Doctor ${selectedDoctor.name}. Please describe your symptoms after the beep. Press pound when finished.`);
    
    twiml.record({
      action: '/api/voice/process-symptoms',
      method: 'POST',
      maxLength: 60,
      finishOnKey: '#',
      transcribe: true,
      transcribeCallback: '/api/voice/transcription'
    });

    return twiml.toString();
  }

  /**
   * Process symptoms recording
   */
  static async processSymptoms(callSid, recordingUrl, from) {
    const twiml = new VoiceResponse();
    const user = await User.findByPhone(from);
    const sessionData = await VoiceSession.getSessionData(callSid);

    // Store recording URL
    await VoiceSession.updateSession(callSid, 'symptoms_recorded', {
      ...sessionData,
      recordingUrl
    });

    twiml.say('Thank you. We are connecting you to a doctor. Please wait.');
    
    // Play hold music
    twiml.play({ loop: 10 }, 'http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3');

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
    await DoctorCallQueue.create(doctorId, user.id, caseData.id, callSid);

    // Notify doctor
    await this.notifyDoctor(doctorId, user, caseData);

    // Wait for doctor acceptance (handled by webhook)
    twiml.redirect('/api/voice/wait-for-doctor');

    return twiml.toString();
  }

  /**
   * Wait for doctor to accept
   */
  static async waitForDoctor(callSid) {
    const twiml = new VoiceResponse();
    
    // Check if doctor accepted
    const callRequest = await DoctorCallQueue.findByCallSid(callSid);

    if (!callRequest) {
      twiml.say('Unable to process your request. Please try again.');
      twiml.hangup();
      return twiml.toString();
    }

    if (callRequest.status === 'accepted') {
      // Bridge to doctor
      return this.bridgeToDoctor(twiml, callRequest);
    } else if (callRequest.status === 'rejected') {
      twiml.say('The doctor is currently unavailable. We will send you an SMS with alternative options.');
      twiml.hangup();
      return twiml.toString();
    } else {
      // Still pending, keep waiting
      twiml.say('Please continue to hold. A doctor will be with you shortly.');
      twiml.play({ loop: 5 }, 'http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3');
      twiml.redirect('/api/voice/wait-for-doctor');
      return twiml.toString();
    }
  }

  /**
   * Bridge call to doctor
   */
  static bridgeToDoctor(twiml, callRequest) {
    twiml.say('Connecting you to the doctor now.');

    const dial = twiml.dial({
      action: '/api/voice/call-completed',
      method: 'POST',
      timeout: 30,
      callerId: process.env.TWILIO_PHONE_NUMBER
    });

    dial.number({
      statusCallbackEvent: 'answered completed',
      statusCallback: '/api/voice/call-status',
      statusCallbackMethod: 'POST'
    }, callRequest.doctor_phone);

    return twiml.toString();
  }

  /**
   * Handle call completion
   */
  static async handleCallCompleted(callSid, callDuration, callStatus) {
    const callRequest = await DoctorCallQueue.findByCallSid(callSid);

    if (callRequest) {
      // Update call queue
      await DoctorCallQueue.complete(callRequest.id, callDuration);

      // Update case
      await Case.updateStatus(callRequest.case_id, 'completed');

      // Update voice session
      await VoiceSession.completeSession(callSid, callDuration);

      // Increment consultation count
      await User.incrementConsultationCount(callRequest.user_id);

      // Send follow-up SMS
      const user = await User.findById(callRequest.user_id);
      await SMSService.sendSMS(
        user.phone,
        `Thank you for using SmartHealth. Your consultation with ${callRequest.doctor_name} has been completed. Case #${callRequest.case_id}`
      );
    }

    const twiml = new VoiceResponse();
    twiml.say('Thank you for using SmartHealth. Goodbye.');
    twiml.hangup();

    return twiml.toString();
  }

  /**
   * Handle consultation history
   */
  static async handleHistory(twiml, user, callSid) {
    const history = await User.getConsultationHistory(user.id, 3);

    if (history.length === 0) {
      twiml.say('You have no consultation history yet.');
    } else {
      let message = 'Your recent consultations. ';
      history.forEach((item, index) => {
        message += `${index + 1}. ${item.doctor_name || 'Pending'}, status ${item.status}. `;
      });
      twiml.say(message);
    }

    twiml.say('Thank you for calling SmartHealth. Goodbye.');
    twiml.hangup();

    return twiml.toString();
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

    // In production, also send push notification to dashboard
  }

  /**
   * Handle transcription callback
   */
  static async handleTranscription(callSid, transcriptionText) {
    const sessionData = await VoiceSession.getSessionData(callSid);
    
    if (sessionData) {
      await VoiceSession.updateSession(callSid, sessionData.step, {
        ...sessionData,
        transcription: transcriptionText
      });
    }
  }

  /**
   * Make outbound call to doctor
   */
  static async callDoctor(doctorPhone, callRequestId) {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    try {
      const call = await client.calls.create({
        url: `${process.env.API_BASE_URL}/api/voice/doctor-call?requestId=${callRequestId}`,
        to: doctorPhone,
        from: process.env.TWILIO_PHONE_NUMBER,
        statusCallback: `${process.env.API_BASE_URL}/api/voice/doctor-call-status`,
        statusCallbackMethod: 'POST'
      });

      return call.sid;
    } catch (error) {
      console.error('Failed to call doctor:', error);
      throw error;
    }
  }

  /**
   * Handle doctor call webhook
   */
  static async handleDoctorCall(requestId) {
    const twiml = new VoiceResponse();
    const callRequest = await DoctorCallQueue.findById(requestId);

    if (!callRequest) {
      twiml.say('Invalid request.');
      twiml.hangup();
      return twiml.toString();
    }

    const gather = twiml.gather({
      numDigits: 1,
      action: `/api/voice/doctor-response?requestId=${requestId}`,
      method: 'POST',
      timeout: 10
    });

    gather.say(
      `You have a consultation request from ${callRequest.user_name}. Press 1 to accept. Press 2 to reject.`,
      { voice: 'alice', language: 'en-US' }
    );

    return twiml.toString();
  }

  /**
   * Handle doctor response to call request
   */
  static async handleDoctorResponse(requestId, digits, doctorPhone) {
    const twiml = new VoiceResponse();
    const callRequest = await DoctorCallQueue.findById(requestId);

    if (digits === '1') {
      // Accept
      await DoctorCallQueue.accept(requestId, doctorPhone);
      twiml.say('Request accepted. Connecting you to the patient now.');
      
      // The patient's call will be bridged via the wait-for-doctor endpoint
      
      twiml.hangup();
    } else {
      // Reject
      await DoctorCallQueue.reject(requestId, 'Doctor declined');
      twiml.say('Request rejected. Thank you.');
      twiml.hangup();
    }

    return twiml.toString();
  }
}

module.exports = VoiceService;
