const axios = require('axios');
const { pool } = require('../config/database');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Case = require('../models/Case');

/**
 * SMS Service
 * Handles SMS sending/receiving via Africa's Talking API
 */
class SMSService {
  /**
   * Send SMS via Africa's Talking (Two-way with Shortcode)
   */
  static async sendSMS(phone, message) {
    try {
      // Use shortcode for two-way SMS
      const from = process.env.AT_SMS_SHORTCODE || null;
      
      console.log(`[SMS] Sending SMS via Africa's Talking`);
      console.log(`[SMS] To: ${phone}`);
      console.log(`[SMS] From: ${from || 'default'}`);
      console.log(`[SMS] Username: ${process.env.AT_USERNAME}`);
      
      const params = new URLSearchParams({
        username: process.env.AT_USERNAME,
        to: phone,
        message: message
      });

      // Add shortcode if available (for two-way SMS)
      if (from) {
        params.append('from', from);
      }

      // For sandbox, use sandbox endpoint
      const apiUrl = process.env.AT_USERNAME === 'sandbox'
        ? 'https://api.sandbox.africastalking.com/version1/messaging'
        : 'https://api.africastalking.com/version1/messaging';
      
      console.log(`[SMS] API URL: ${apiUrl}`);
      
      const response = await axios.post(
        apiUrl,
        params.toString(),
        {
          headers: {
            'apiKey': process.env.AT_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          }
        }
      );

      console.log('[SMS] ✅ SMS sent successfully!');
      console.log('[SMS] Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('[SMS] ❌ SMS sending failed:', error.message);
      if (error.response) {
        console.error('[SMS] API Error Response:', error.response.data);
      }
      
      // Queue for retry
      await this.queueSMS(phone, message);
      throw error;
    }
  }

  /**
   * Queue SMS for later sending
   */
  static async queueSMS(phone, message) {
    await pool.query(
      'INSERT INTO sms_queue (phone, message) VALUES (?, ?)',
      [phone, message]
    );
  }

  /**
   * Process SMS queue (called by cron job)
   */
  static async processQueue() {
    const [pending] = await pool.query(
      `SELECT * FROM sms_queue 
       WHERE status = 'pending' AND attempts < 3 
       ORDER BY created_at ASC 
       LIMIT 10`
    );

    for (const sms of pending) {
      try {
        await this.sendSMS(sms.phone, sms.message);
        
        await pool.query(
          'UPDATE sms_queue SET status = ?, sent_at = NOW() WHERE id = ?',
          ['sent', sms.id]
        );
      } catch (error) {
        await pool.query(
          'UPDATE sms_queue SET attempts = attempts + 1 WHERE id = ?',
          [sms.id]
        );
      }
    }
  }

  /**
   * Handle incoming SMS
   */
  static async handleIncomingSMS(from, text, date) {
    const phone = from;
    const message = text.trim().toLowerCase();

    // Get or create user
    let user = await User.findByPhone(phone);
    if (!user) {
      user = await User.create(phone);
      
      // Send welcome message
      await this.sendWelcomeSMS(phone, user.language);
      return;
    }

    // Parse command
    if (message.startsWith('consult') || message.startsWith('ushauri')) {
      await this.handleConsultationRequest(user, text);
    } else if (message.startsWith('doctors') || message.startsWith('madaktari')) {
      await this.sendDoctorList(user);
    } else if (message.startsWith('select') || message.startsWith('chagua')) {
      await this.handleDoctorSelection(user, text);
    } else if (message.startsWith('history') || message.startsWith('historia')) {
      await this.sendHistory(user);
    } else if (message.startsWith('help') || message.startsWith('msaada')) {
      await this.sendHelpMessage(user);
    } else {
      await this.sendHelpMessage(user);
    }
  }

  /**
   * Send welcome SMS
   */
  static async sendWelcomeSMS(phone, lang = 'en') {
    const messages = {
      en: `Welcome to SmartHealth! 🏥

You have a 1-day FREE trial.

Commands:
- CONSULT [symptoms] - Start consultation
- DOCTORS - View available doctors
- HISTORY - View past consultations
- HELP - Show this message

Or dial ${process.env.AT_USSD_CODE} for USSD menu`,
      sw: `Karibu SmartHealth! 🏥

Una kipindi cha bure cha siku 1.

Amri:
- USHAURI [dalili] - Anza ushauri
- MADAKTARI - Tazama madaktari
- HISTORIA - Tazama ushauri uliopita
- MSAADA - Onyesha ujumbe huu

Au piga ${process.env.AT_USSD_CODE} kwa menyu ya USSD`
    };

    await this.sendSMS(phone, messages[lang] || messages.en);
  }

  /**
   * Handle consultation request via SMS
   */
  static async handleConsultationRequest(user, text) {
    const symptoms = text.replace(/^(consult|ushauri)\s*/i, '').trim();
    
    if (symptoms.length < 10) {
      const msg = user.language === 'sw'
        ? 'Tafadhali eleza dalili zako kwa undani zaidi. Mfano: USHAURI nina homa na kichwa kinaniuma'
        : 'Please describe your symptoms in more detail. Example: CONSULT I have fever and headache';
      
      await this.sendSMS(user.phone, msg);
      return;
    }

    // Check trial status
    const isInTrial = await User.isInTrial(user.id);
    
    if (isInTrial) {
      // Create trial case
      const caseData = await Case.create(user.id, symptoms, 'trial', 0);
      await Case.autoAssign(caseData.id);
      await User.incrementConsultationCount(user.id);
      
      const msg = user.language === 'sw'
        ? `Asante! Daktari atakujibu hivi karibuni. Nambari ya kesi: ${caseData.id}`
        : `Thank you! A doctor will respond shortly. Case #${caseData.id}`;
      
      await this.sendSMS(user.phone, msg);
    } else {
      // Send doctor list for paid consultation
      await this.sendDoctorList(user, symptoms);
    }
  }

  /**
   * Send doctor list
   */
  static async sendDoctorList(user, symptoms = null) {
    const doctors = await Doctor.getAvailable();
    
    if (doctors.length === 0) {
      const msg = user.language === 'sw'
        ? 'Hakuna madaktari wanaopatikana sasa. Jaribu tena baadaye.'
        : 'No doctors available. Please try again later.';
      
      await this.sendSMS(user.phone, msg);
      return;
    }

    let message = user.language === 'sw'
      ? 'Madaktari wanaopatikana:\n\n'
      : 'Available Doctors:\n\n';
    
    doctors.forEach((doc, index) => {
      message += `${index + 1}. ${doc.name}\n   ${doc.specialization}\n   KES ${doc.fee}\n\n`;
    });

    message += user.language === 'sw'
      ? 'Jibu: SELECT [nambari] [dalili]\nMfano: SELECT 1 nina homa'
      : 'Reply: SELECT [number] [symptoms]\nExample: SELECT 1 I have fever';

    await this.sendSMS(user.phone, message);
  }

  /**
   * Handle doctor selection
   */
  static async handleDoctorSelection(user, text) {
    const match = text.match(/^(select|chagua)\s+(\d+)\s+(.+)$/i);
    
    if (!match) {
      const msg = user.language === 'sw'
        ? 'Muundo si sahihi. Tumia: SELECT [nambari] [dalili]'
        : 'Invalid format. Use: SELECT [number] [symptoms]';
      
      await this.sendSMS(user.phone, msg);
      return;
    }

    const doctorIndex = parseInt(match[2]) - 1;
    const symptoms = match[3].trim();
    
    const doctors = await Doctor.getAvailable();
    
    if (doctorIndex < 0 || doctorIndex >= doctors.length) {
      const msg = user.language === 'sw'
        ? 'Nambari ya daktari si sahihi'
        : 'Invalid doctor number';
      
      await this.sendSMS(user.phone, msg);
      return;
    }

    const selectedDoctor = doctors[doctorIndex];
    
    // Check for offers and create case (simplified - in production, handle payment first)
    const caseData = await Case.create(user.id, symptoms, 'paid', 0);
    await Case.assignToDoctor(caseData.id, selectedDoctor.id);
    await User.incrementConsultationCount(user.id);
    
    const msg = user.language === 'sw'
      ? `Malipo ya KES ${selectedDoctor.fee} yanahitajika. Daktari ${selectedDoctor.name} atakujibu baada ya malipo. Kesi #${caseData.id}`
      : `Payment of KES ${selectedDoctor.fee} required. Dr. ${selectedDoctor.name} will respond after payment. Case #${caseData.id}`;
    
    await this.sendSMS(user.phone, msg);
  }

  /**
   * Send consultation history
   */
  static async sendHistory(user) {
    const history = await User.getConsultationHistory(user.id, 5);
    
    if (history.length === 0) {
      const msg = user.language === 'sw'
        ? 'Huna historia ya ushauri bado'
        : 'No consultation history yet';
      
      await this.sendSMS(user.phone, msg);
      return;
    }

    let message = user.language === 'sw'
      ? 'Historia yako ya hivi karibuni:\n\n'
      : 'Your recent history:\n\n';
    
    history.forEach((item, index) => {
      message += `${index + 1}. ${item.doctor_name || 'Pending'}\n   Status: ${item.status}\n   ${item.created_at}\n\n`;
    });

    await this.sendSMS(user.phone, message);
  }

  /**
   * Send help message
   */
  static async sendHelpMessage(user) {
    const messages = {
      en: `SmartHealth Commands:

CONSULT [symptoms] - Start consultation
DOCTORS - View available doctors
SELECT [number] [symptoms] - Choose doctor
HISTORY - View past consultations
HELP - Show this message

Or dial ${process.env.AT_USSD_CODE}`,
      sw: `Amri za SmartHealth:

USHAURI [dalili] - Anza ushauri
MADAKTARI - Tazama madaktari
CHAGUA [nambari] [dalili] - Chagua daktari
HISTORIA - Tazama ushauri uliopita
MSAADA - Onyesha ujumbe huu

Au piga ${process.env.AT_USSD_CODE}`
    };

    await this.sendSMS(user.phone, messages[user.language] || messages.en);
  }

  /**
   * Send doctor response to patient
   */
  static async sendDoctorResponse(caseId) {
    console.log(`[SMS] Preparing to send doctor response for case #${caseId}`);
    
    const caseData = await Case.findById(caseId);
    
    if (!caseData || !caseData.response) {
      console.log(`[SMS] Case #${caseId} not found or has no response`);
      return;
    }

    console.log(`[SMS] Case found - Doctor: ${caseData.doctor_name}, User ID: ${caseData.user_id}`);
    
    const user = await User.findById(caseData.user_id);
    
    if (!user) {
      console.log(`[SMS] User #${caseData.user_id} not found`);
      return;
    }
    
    console.log(`[SMS] User found - Phone: ${user.phone}, Language: ${user.language}`);
    
    const message = user.language === 'sw'
      ? `Jibu kutoka kwa ${caseData.doctor_name}:\n\n${caseData.response}\n\nKesi #${caseId}`
      : `Response from ${caseData.doctor_name}:\n\n${caseData.response}\n\nCase #${caseId}`;
    
    console.log(`[SMS] Sending SMS to ${user.phone}`);
    console.log(`[SMS] Message: ${message.substring(0, 100)}...`);
    
    const result = await this.sendSMS(user.phone, message);
    
    console.log(`[SMS] SMS sent successfully!`);
    console.log(`[SMS] Africa's Talking Response:`, result);
    
    return result;
  }
}

module.exports = SMSService;
