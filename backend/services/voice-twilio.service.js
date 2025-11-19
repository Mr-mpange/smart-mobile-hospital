const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Case = require('../models/Case');
const VoiceSession = require('../models/VoiceSession');
const DoctorCallQueue = require('../models/DoctorCallQueue');
const SMSService = require('./sms.service');

/**
 * Twilio Voice Service
 * Original Twilio implementation
 */
class TwilioVoiceService {
  /**
   * Handle incoming voice call
   */
  static async handleIncomingCall(callSid, from, to) {
    const twiml = new VoiceResponse();
    
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

  // ... rest of Twilio methods (keeping original implementation)
  // Copy all methods from the original voice.service.js
}

module.exports = TwilioVoiceService;
