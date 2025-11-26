const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Case = require('../models/Case');
const Offer = require('../models/Offer');
const { pool } = require('../config/database');

/**
 * USSD Service
 * Handles USSD session management and menu navigation
 */
class USSDService {
  /**
   * Main USSD handler
   */
  static async handleUSSD(sessionId, serviceCode, phoneNumber, text) {
    const language = await this.getUserLanguage(phoneNumber);
    
    // Get or create user
    let user = await User.findByPhone(phoneNumber);
    if (!user) {
      user = await User.create(phoneNumber, null, language);
    }

    // Save/update session
    await this.saveSession(sessionId, user.id, phoneNumber, text);

    // Parse user input
    const inputs = text ? text.split('*') : [];
    const level = inputs.length;

    // Route to appropriate menu
    if (text === '') {
      return this.mainMenu(language);
    } else if (inputs[0] === '1') {
      return this.handleTrialFlow(user, inputs, language);
    } else if (inputs[0] === '2') {
      return this.handlePaidFlow(user, inputs, language);
    } else if (inputs[0] === '3') {
      return this.handleHistory(user, inputs, language);
    } else if (inputs[0] === '4') {
      return this.handleLanguageChange(user, inputs);
    } else {
      return this.invalidOption(language);
    }
  }

  /**
   * Main menu
   */
  static mainMenu(lang = 'en') {
    const menus = {
      en: `CON Welcome to SmartHealth
1. Free Trial Consultation
2. Pay-per-Consultation
3. Consultation History
4. Change Language`,
      sw: `CON Karibu SmartHealth
1. Ushauri wa Bure
2. Ushauri wa Malipo
3. Historia ya Ushauri
4. Badilisha Lugha`
    };
    return menus[lang] || menus.en;
  }

  /**
   * Handle trial consultation flow
   */
  static async handleTrialFlow(user, inputs, lang) {
    const isInTrial = await User.isInTrial(user.id);
    
    if (inputs.length === 1) {
      if (!isInTrial) {
        return this.response(
          lang === 'sw' 
            ? 'END Kipindi chako cha bure kimeisha. Tafadhali chagua malipo ya ushauri.'
            : 'END Your trial period has ended. Please choose paid consultation.',
          false
        );
      }
      
      return this.response(
        lang === 'sw'
          ? 'CON Andika dalili zako:'
          : 'CON Enter your symptoms:',
        true
      );
    }

    if (inputs.length === 2) {
      const symptoms = inputs[1];
      
      if (!symptoms || symptoms.trim().length < 10) {
        return this.response(
          lang === 'sw'
            ? 'END Tafadhali andika dalili zako kwa undani zaidi.'
            : 'END Please provide more detailed symptoms.',
          false
        );
      }

      // Create case
      const caseData = await Case.create(user.id, symptoms, 'trial', 0);
      
      // Auto-assign to available doctor
      await Case.autoAssign(caseData.id);
      
      // Increment consultation count
      await User.incrementConsultationCount(user.id);
      
      // Check for offers
      await Offer.checkAndCreateOffers(user.id, user.consultation_count + 1);

      return this.response(
        lang === 'sw'
          ? `END Asante! Daktari atakujibu hivi karibuni kupitia SMS. Nambari ya kesi: ${caseData.id}`
          : `END Thank you! A doctor will respond via SMS shortly. Case #${caseData.id}`,
        false
      );
    }
  }

  /**
   * Handle paid consultation flow
   */
  static async handlePaidFlow(user, inputs, lang) {
    // Step 1: Show available doctors
    if (inputs.length === 1) {
      const doctors = await Doctor.getAvailable();
      
      if (doctors.length === 0) {
        return this.response(
          lang === 'sw'
            ? 'END Hakuna madaktari wanaopatikana sasa. Jaribu tena baadaye.'
            : 'END No doctors available. Please try again later.',
          false
        );
      }

      let menu = lang === 'sw' 
        ? 'CON Chagua Daktari:\n'
        : 'CON Select Doctor:\n';
      
      doctors.forEach((doc, index) => {
        menu += `${index + 1}. ${doc.name} - ${doc.specialization} (TZS ${doc.fee})\n`;
      });

      // Store doctors in session for later reference
      await this.updateSessionData(inputs[0], user.id, { doctors });

      return this.response(menu, true);
    }

    // Step 2: Get symptoms
    if (inputs.length === 2) {
      const doctorIndex = parseInt(inputs[1]) - 1;
      const sessionData = await this.getSessionData(user.id);
      
      if (!sessionData || !sessionData.doctors || !sessionData.doctors[doctorIndex]) {
        return this.invalidOption(lang);
      }

      return this.response(
        lang === 'sw'
          ? 'CON Andika dalili zako:'
          : 'CON Enter your symptoms:',
        true
      );
    }

    // Step 3: Process payment and create case
    if (inputs.length === 3) {
      const doctorIndex = parseInt(inputs[1]) - 1;
      const symptoms = inputs[2];
      const sessionData = await this.getSessionData(user.id);
      
      if (!sessionData || !sessionData.doctors || !sessionData.doctors[doctorIndex]) {
        return this.invalidOption(lang);
      }

      const selectedDoctor = sessionData.doctors[doctorIndex];

      // Check for active offers
      const offer = await Offer.getBestOffer(user.id);
      let finalAmount = selectedDoctor.fee;
      let consultationType = 'paid';
      let priority = 0;

      if (offer) {
        if (offer.offer_type === 'free_consultation') {
          finalAmount = 0;
          consultationType = 'free_offer';
          await Offer.apply(offer.id);
        } else if (offer.offer_type === 'discount') {
          finalAmount = selectedDoctor.fee * (1 - offer.discount_percentage / 100);
          await Offer.apply(offer.id);
        } else if (offer.offer_type === 'priority_queue') {
          priority = 1;
        }
      }

      // Check balance or initiate payment
      if (finalAmount > 0) {
        const hasFunds = await User.hasSufficientBalance(user.id, finalAmount);
        
        if (!hasFunds) {
          // In production, integrate with Zenopay here
          return this.response(
            lang === 'sw'
              ? `END Tafadhali lipa TZS ${finalAmount} kupitia Zenopay. Utapokea SMS ya malipo.`
              : `END Please pay TZS ${finalAmount} via Zenopay. You will receive payment SMS.`,
            false
          );
        }

        // Deduct from balance
        await User.updateBalance(user.id, -finalAmount);
      }

      // Create case
      const caseData = await Case.create(user.id, symptoms, consultationType, priority);
      await Case.assignToDoctor(caseData.id, selectedDoctor.id);
      
      // Increment consultation count
      await User.incrementConsultationCount(user.id);
      
      // Check for new offers
      await Offer.checkAndCreateOffers(user.id, user.consultation_count + 1);

      return this.response(
        lang === 'sw'
          ? `END Asante! Daktari ${selectedDoctor.name} atakujibu hivi karibuni. Kesi #${caseData.id}`
          : `END Thank you! Dr. ${selectedDoctor.name} will respond shortly. Case #${caseData.id}`,
        false
      );
    }
  }

  /**
   * Handle consultation history
   */
  static async handleHistory(user, inputs, lang) {
    const history = await User.getConsultationHistory(user.id, 5);
    
    if (history.length === 0) {
      return this.response(
        lang === 'sw'
          ? 'END Huna historia ya ushauri bado.'
          : 'END No consultation history yet.',
        false
      );
    }

    let message = lang === 'sw' 
      ? 'END Historia yako ya hivi karibuni:\n'
      : 'END Your recent history:\n';
    
    history.forEach((item, index) => {
      message += `${index + 1}. ${item.doctor_name || 'Pending'} - ${item.status}\n`;
    });

    return this.response(message, false);
  }

  /**
   * Handle language change
   */
  static async handleLanguageChange(user, inputs) {
    if (inputs.length === 1) {
      return this.response('CON Select Language / Chagua Lugha:\n1. English\n2. Kiswahili', true);
    }

    if (inputs.length === 2) {
      const newLang = inputs[1] === '1' ? 'en' : 'sw';
      await User.update(user.id, { language: newLang });
      
      return this.response(
        newLang === 'sw'
          ? 'END Lugha imebadilishwa kuwa Kiswahili'
          : 'END Language changed to English',
        false
      );
    }
  }

  /**
   * Invalid option response
   */
  static invalidOption(lang) {
    return this.response(
      lang === 'sw'
        ? 'END Chaguo si sahihi. Jaribu tena.'
        : 'END Invalid option. Please try again.',
      false
    );
  }

  /**
   * Format USSD response
   */
  static response(message, continues) {
    return continues ? message : message;
  }

  /**
   * Save USSD session
   */
  static async saveSession(sessionId, userId, phone, step) {
    await pool.query(
      `INSERT INTO ussd_sessions (session_id, user_id, phone, step) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE step = ?, updated_at = NOW()`,
      [sessionId, userId, phone, step, step]
    );
  }

  /**
   * Update session temporary data
   */
  static async updateSessionData(sessionId, userId, data) {
    await pool.query(
      `UPDATE ussd_sessions 
       SET temporary_data = ? 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [JSON.stringify(data), userId]
    );
  }

  /**
   * Get session temporary data
   */
  static async getSessionData(userId) {
    const [rows] = await pool.query(
      `SELECT temporary_data 
       FROM ussd_sessions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );
    
    if (rows.length > 0 && rows[0].temporary_data) {
      return JSON.parse(rows[0].temporary_data);
    }
    
    return null;
  }

  /**
   * Get user language preference
   */
  static async getUserLanguage(phone) {
    const user = await User.findByPhone(phone);
    return user ? user.language : 'en';
  }
}

module.exports = USSDService;
