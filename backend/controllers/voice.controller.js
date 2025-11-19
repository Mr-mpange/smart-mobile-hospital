const VoiceService = require('../services/voice.service');

/**
 * Voice Controller
 * Handles voice call webhooks from Twilio/Africa's Talking
 */
class VoiceController {
  /**
   * Handle incoming call
   * POST /api/voice/incoming
   * Supports both Twilio and Africa's Talking
   */
  static async handleIncoming(req, res) {
    try {
      // Twilio parameters
      const { CallSid, From, To } = req.body;
      
      // Africa's Talking parameters
      const { sessionId, phoneNumber, isActive } = req.body;

      // Determine which provider
      const callId = CallSid || sessionId;
      const phone = From || phoneNumber;
      const active = isActive;

      const response = await VoiceService.handleIncomingCall(callId, phone, To, active);

      res.type('text/xml');
      res.send(response);

    } catch (error) {
      console.error('Voice incoming error:', error);
      res.type('text/xml');
      res.send('<Response><Say>Service temporarily unavailable.</Say></Response>');
    }
  }

  /**
   * Handle menu selection
   * POST /api/voice/menu
   */
  static async handleMenu(req, res) {
    try {
      const { CallSid, Digits, From } = req.body;

      const twiml = await VoiceService.handleMenu(CallSid, Digits, From);

      res.type('text/xml');
      res.send(twiml);

    } catch (error) {
      console.error('Voice menu error:', error);
      res.type('text/xml');
      res.send('<Response><Say>An error occurred.</Say><Hangup/></Response>');
    }
  }

  /**
   * Handle doctor selection
   * POST /api/voice/select-doctor
   */
  static async handleDoctorSelection(req, res) {
    try {
      const { CallSid, Digits, From } = req.body;

      const twiml = await VoiceService.handleDoctorSelection(CallSid, Digits, From);

      res.type('text/xml');
      res.send(twiml);

    } catch (error) {
      console.error('Doctor selection error:', error);
      res.type('text/xml');
      res.send('<Response><Say>An error occurred.</Say><Hangup/></Response>');
    }
  }

  /**
   * Process symptoms recording
   * POST /api/voice/process-symptoms
   */
  static async processSymptoms(req, res) {
    try {
      const { CallSid, RecordingUrl, From } = req.body;

      const twiml = await VoiceService.processSymptoms(CallSid, RecordingUrl, From);

      res.type('text/xml');
      res.send(twiml);

    } catch (error) {
      console.error('Process symptoms error:', error);
      res.type('text/xml');
      res.send('<Response><Say>An error occurred.</Say><Hangup/></Response>');
    }
  }

  /**
   * Wait for doctor acceptance
   * POST /api/voice/wait-for-doctor
   */
  static async waitForDoctor(req, res) {
    try {
      const { CallSid } = req.body;

      const twiml = await VoiceService.waitForDoctor(CallSid);

      res.type('text/xml');
      res.send(twiml);

    } catch (error) {
      console.error('Wait for doctor error:', error);
      res.type('text/xml');
      res.send('<Response><Say>An error occurred.</Say><Hangup/></Response>');
    }
  }

  /**
   * Handle call completion
   * POST /api/voice/call-completed
   */
  static async handleCallCompleted(req, res) {
    try {
      const { CallSid, CallDuration, CallStatus } = req.body;

      const twiml = await VoiceService.handleCallCompleted(CallSid, CallDuration, CallStatus);

      res.type('text/xml');
      res.send(twiml);

    } catch (error) {
      console.error('Call completed error:', error);
      res.type('text/xml');
      res.send('<Response><Hangup/></Response>');
    }
  }

  /**
   * Handle call status updates
   * POST /api/voice/call-status
   */
  static async handleCallStatus(req, res) {
    try {
      const { CallSid, CallStatus, CallDuration } = req.body;

      console.log('Call status update:', { CallSid, CallStatus, CallDuration });

      res.status(200).send('OK');

    } catch (error) {
      console.error('Call status error:', error);
      res.status(500).send('Error');
    }
  }

  /**
   * Handle transcription callback
   * POST /api/voice/transcription
   */
  static async handleTranscription(req, res) {
    try {
      const { CallSid, TranscriptionText } = req.body;

      await VoiceService.handleTranscription(CallSid, TranscriptionText);

      res.status(200).send('OK');

    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).send('Error');
    }
  }

  /**
   * Handle doctor call webhook
   * POST /api/voice/doctor-call
   */
  static async handleDoctorCall(req, res) {
    try {
      const { requestId } = req.query;

      const twiml = await VoiceService.handleDoctorCall(requestId);

      res.type('text/xml');
      res.send(twiml);

    } catch (error) {
      console.error('Doctor call error:', error);
      res.type('text/xml');
      res.send('<Response><Say>An error occurred.</Say><Hangup/></Response>');
    }
  }

  /**
   * Handle doctor response
   * POST /api/voice/doctor-response
   */
  static async handleDoctorResponse(req, res) {
    try {
      const { requestId } = req.query;
      const { Digits, From } = req.body;

      const twiml = await VoiceService.handleDoctorResponse(requestId, Digits, From);

      res.type('text/xml');
      res.send(twiml);

    } catch (error) {
      console.error('Doctor response error:', error);
      res.type('text/xml');
      res.send('<Response><Say>An error occurred.</Say><Hangup/></Response>');
    }
  }

  /**
   * Handle doctor call status
   * POST /api/voice/doctor-call-status
   */
  static async handleDoctorCallStatus(req, res) {
    try {
      const { CallSid, CallStatus } = req.body;

      console.log('Doctor call status:', { CallSid, CallStatus });

      res.status(200).send('OK');

    } catch (error) {
      console.error('Doctor call status error:', error);
      res.status(500).send('Error');
    }
  }
}

module.exports = VoiceController;
