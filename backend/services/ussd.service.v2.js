const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Case = require('../models/Case');
const Offer = require('../models/Offer');
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Enhanced USSD Service with Registration, Login, and Payment
 */
class USSDServiceV2 {
  /**
   * Main USSD handler
   */
  static async handleUSSD(sessionId, serviceCode, phoneNumber, text) {
    // Check if user exists
    let user = await User.findByPhone(phoneNumber);
    
    // Parse user input
    const inputs = text ? text.split('*') : [];
    
    // NEW USER FLOW - Registration required
    if (!user) {
      return this.handleRegistration(sessionId, phoneNumber, inputs);
    }
    
    // EXISTING USER FLOW - Login required
    const session = await this.getSession(sessionId);
    
    // Check if user is authenticated in this session
    if (!session || !session.authenticated) {
      return this.handleLogin(sessionId, user, inputs);
    }
    
    // User is authenticated - show main menu
    const language = user.language || 'en';
    
    if (inputs.length === 0 || text === '') {
      return this.mainMenu(language, user);
    }
    
    // Route to appropriate menu
    if (inputs[0] === '1') {
      return this.handleTrialFlow(user, inputs, language, sessionId);
    } else if (inputs[0] === '2') {
      return this.handlePaidFlow(user, inputs, language, sessionId);
    } else if (inputs[0] === '3') {
      return this.handleHistory(user, inputs, language);
    } else if (inputs[0] === '4') {
      return this.handleLanguageChange(user, inputs);
    } else if (inputs[0] === '5') {
      return this.handleLogout(sessionId, language);
    } else {
      return this.invalidOption(language);
    }
  }

  /**
   * Handle new user registration
   */
  static async handleRegistration(sessionId, phoneNumber, inputs) {
    // Step 1: Welcome and ask for name
    if (inputs.length === 0) {
      await this.saveSession(sessionId, null, phoneNumber, 'registration_name', {});
      return `CON Welcome to SmartHealth!
You are a new user.

Please enter your full name:`;
    }
    
    // Step 2: Ask for password
    if (inputs.length === 1) {
      const name = inputs[0].trim();
      
      if (name.length < 3) {
        return `END Name must be at least 3 characters.
Please dial again.`;
      }
      
      await this.saveSession(sessionId, null, phoneNumber, 'registration_password', { name });
      return `CON Hello ${name}!

For security, create a 4-digit PIN:
(This will protect your medical records)`;
    }
    
    // Step 3: Confirm password and create account
    if (inputs.length === 2) {
      const name = inputs[0].trim();
      const password = inputs[1].trim();
      
      if (!/^\d{4}$/.test(password)) {
        return `END PIN must be exactly 4 digits.
Please dial again.`;
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await User.createWithPassword(phoneNumber, name, passwordHash);
      
      // Mark session as authenticated
      await this.saveSession(sessionId, user.id, phoneNumber, 'authenticated', { 
        authenticated: true,
        userId: user.id 
      });
      
      return `END Registration successful!

Name: ${name}
Phone: ${phoneNumber}
Trial: 3 FREE consultations

Dial ${process.env.AT_USSD_CODE || '*384*34153#'} again to start!`;
    }
  }

  /**
   * Handle user login
   */
  static async handleLogin(sessionId, user, inputs) {
    // Step 1: Ask for PIN
    if (inputs.length === 0) {
      await this.saveSession(sessionId, user.id, user.phone, 'login_password', {});
      return `CON Welcome back, ${user.name || 'User'}!

Enter your 4-digit PIN:`;
    }
    
    // Step 2: Verify PIN
    if (inputs.length === 1) {
      const password = inputs[0].trim();
      
      // Verify password
      const isValid = await User.verifyPassword(user.id, password);
      
      if (!isValid) {
        return `END Incorrect PIN.

Please dial again and try again.
Forgot PIN? Contact support.`;
      }
      
      // Mark session as authenticated
      await this.saveSession(sessionId, user.id, user.phone, 'authenticated', { 
        authenticated: true,
        userId: user.id 
      });
      
      const language = user.language || 'en';
      return this.mainMenu(language, user);
    }
  }

  /**
   * Main menu (after authentication)
   */
  static mainMenu(lang = 'en', user) {
    const trialInfo = user.trial_end && new Date(user.trial_end) > new Date() 
      ? `(${3 - user.consultation_count} free left)` 
      : '';
    
    const menus = {
      en: `CON SmartHealth - Main Menu

1. Free Trial ${trialInfo}
2. Paid Consultation
3. My History
4. Change Language
5. Logout`,
      sw: `CON SmartHealth - Menyu Kuu

1. Ushauri wa Bure ${trialInfo}
2. Ushauri wa Malipo
3. Historia Yangu
4. Badilisha Lugha
5. Toka`
    };
    return menus[lang] || menus.en;
  }

  /**
   * Handle trial consultation flow
   */
  static async handleTrialFlow(user, inputs, lang, sessionId) {
    const isInTrial = await User.isInTrial(user.id);
    
    if (inputs.length === 1) {
      if (!isInTrial) {
        return lang === 'sw' 
          ? 'END Kipindi chako cha bure kimeisha.\nTafadhali chagua malipo ya ushauri.'
          : 'END Your trial period has ended.\nPlease choose paid consultation.';
      }
      
      return lang === 'sw'
        ? 'CON Andika dalili zako:\n(Angalau sentensi 2)'
        : 'CON Enter your symptoms:\n(At least 2 sentences)';
    }

    if (inputs.length === 2) {
      const symptoms = inputs[1].trim();
      
      if (symptoms.length < 20) {
        return lang === 'sw'
          ? 'END Tafadhali andika dalili zako kwa undani zaidi.\nJaribu tena.'
          : 'END Please provide more detailed symptoms.\nTry again.';
      }

      // Create case
      const caseData = await Case.create(user.id, symptoms, 'trial', 0);
      
      // Auto-assign to available doctor
      await Case.autoAssign(caseData.id);
      
      // Increment consultation count
      await User.incrementConsultationCount(user.id);
      
      // Check for offers
      await Offer.checkAndCreateOffers(user.id, user.consultation_count + 1);

      return lang === 'sw'
        ? `END Asante! Daktari atakujibu hivi karibuni kupitia SMS.\n\nKesi #${caseData.id}\nMuda: Dakika 5-30`
        : `END Thank you! A doctor will respond via SMS shortly.\n\nCase #${caseData.id}\nTime: 5-30 minutes`;
    }
  }

  /**
   * Handle paid consultation flow with PAYMENT FIRST
   */
  static async handlePaidFlow(user, inputs, lang, sessionId) {
    // Step 1: Show available doctors
    if (inputs.length === 1) {
      const doctors = await Doctor.getAvailable();
      
      if (doctors.length === 0) {
        return lang === 'sw'
          ? 'END Hakuna madaktari wanaopatikana sasa.\nJaribu tena baadaye.'
          : 'END No doctors available.\nPlease try again later.';
      }

      let menu = lang === 'sw' 
        ? 'CON Chagua Daktari:\n\n'
        : 'CON Select Doctor:\n\n';
      
      doctors.forEach((doc, index) => {
        menu += `${index + 1}. Dr. ${doc.name}\n   ${doc.specialization}\n   KES ${doc.fee}\n\n`;
      });

      // Store doctors in session
      await this.updateSessionData(sessionId, { doctors, step: 'doctor_selected' });

      return menu;
    }

    // Step 2: PAYMENT - Show payment options
    if (inputs.length === 2) {
      const doctorIndex = parseInt(inputs[1]) - 1;
      const sessionData = await this.getSessionData(sessionId);
      
      if (!sessionData || !sessionData.doctors || !sessionData.doctors[doctorIndex]) {
        return this.invalidOption(lang);
      }

      const selectedDoctor = sessionData.doctors[doctorIndex];
      
      // Check for offers
      const offer = await Offer.getBestOffer(user.id);
      let finalAmount = selectedDoctor.fee;
      let discount = 0;
      
      if (offer) {
        if (offer.offer_type === 'free_consultation') {
          finalAmount = 0;
          discount = selectedDoctor.fee;
        } else if (offer.offer_type === 'discount') {
          discount = selectedDoctor.fee * (offer.discount_percentage / 100);
          finalAmount = selectedDoctor.fee - discount;
        }
      }

      // Store selected doctor and amount
      await this.updateSessionData(sessionId, { 
        ...sessionData,
        selectedDoctor,
        finalAmount,
        discount,
        offer,
        step: 'payment'
      });

      if (finalAmount === 0) {
        return lang === 'sw'
          ? `CON Hongera! Una ushauri wa BURE!\n\nDaktari: ${selectedDoctor.name}\nBei ya kawaida: KES ${selectedDoctor.fee}\nPunguzo: KES ${discount}\nBei yako: KES 0\n\n1. Endelea\n2. Rudi`
          : `CON Congratulations! You have a FREE consultation!\n\nDoctor: ${selectedDoctor.name}\nRegular: KES ${selectedDoctor.fee}\nDiscount: KES ${discount}\nYour price: KES 0\n\n1. Continue\n2. Back`;
      }

      return lang === 'sw'
        ? `CON MALIPO YANAHITAJIKA\n\nDaktari: ${selectedDoctor.name}\nBei: KES ${selectedDoctor.fee}${discount > 0 ? `\nPunguzo: -KES ${discount}` : ''}\nJumla: KES ${finalAmount}\n\nChagua njia ya malipo:\n1. M-Pesa\n2. Salio (KES ${user.balance})\n3. Rudi`
        : `CON PAYMENT REQUIRED\n\nDoctor: ${selectedDoctor.name}\nFee: KES ${selectedDoctor.fee}${discount > 0 ? `\nDiscount: -KES ${discount}` : ''}\nTotal: KES ${finalAmount}\n\nSelect payment method:\n1. M-Pesa\n2. Balance (KES ${user.balance})\n3. Back`;
    }

    // Step 3: Process payment
    if (inputs.length === 3) {
      const paymentMethod = inputs[2];
      const sessionData = await this.getSessionData(sessionId);
      
      if (!sessionData || !sessionData.selectedDoctor) {
        return this.invalidOption(lang);
      }

      const { selectedDoctor, finalAmount, offer } = sessionData;

      // Handle free consultation
      if (finalAmount === 0 && paymentMethod === '1') {
        await this.updateSessionData(sessionId, { 
          ...sessionData,
          paymentConfirmed: true,
          step: 'symptoms'
        });
        
        return lang === 'sw'
          ? 'CON Andika dalili zako:\n(Angalau sentensi 2)'
          : 'CON Enter your symptoms:\n(At least 2 sentences)';
      }

      // Payment method: M-Pesa
      if (paymentMethod === '1') {
        // In production, integrate with Zenopay/M-Pesa here
        // For now, simulate payment request
        
        return lang === 'sw'
          ? `END Ombi la malipo limetumwa!\n\nKiasi: KES ${finalAmount}\nNambari: ${phoneNumber}\n\nUtapokea SMS ya M-Pesa.\nLipa kisha piga tena ${process.env.AT_USSD_CODE || '*384*34153#'}`
          : `END Payment request sent!\n\nAmount: KES ${finalAmount}\nNumber: ${user.phone}\n\nYou will receive M-Pesa SMS.\nPay then dial ${process.env.AT_USSD_CODE || '*384*34153#'} again`;
      }

      // Payment method: Balance
      if (paymentMethod === '2') {
        if (user.balance < finalAmount) {
          return lang === 'sw'
            ? `END Salio haitoshi!\n\nUnahitaji: KES ${finalAmount}\nUna: KES ${user.balance}\nUpungufu: KES ${finalAmount - user.balance}\n\nTafadhali tumia M-Pesa.`
            : `END Insufficient balance!\n\nRequired: KES ${finalAmount}\nYou have: KES ${user.balance}\nShort: KES ${finalAmount - user.balance}\n\nPlease use M-Pesa.`;
        }

        // Deduct from balance
        await User.updateBalance(user.id, -finalAmount);
        
        // Apply offer if exists
        if (offer) {
          await Offer.apply(offer.id);
        }

        await this.updateSessionData(sessionId, { 
          ...sessionData,
          paymentConfirmed: true,
          paymentMethod: 'balance',
          step: 'symptoms'
        });
        
        return lang === 'sw'
          ? `CON Malipo yamefanikiwa!\nKiasi: KES ${finalAmount}\n\nSasa andika dalili zako:\n(Angalau sentensi 2)`
          : `CON Payment successful!\nAmount: KES ${finalAmount}\n\nNow enter your symptoms:\n(At least 2 sentences)`;
      }

      // Back option
      if (paymentMethod === '3') {
        return this.handlePaidFlow(user, [inputs[0]], lang, sessionId);
      }

      return this.invalidOption(lang);
    }

    // Step 4: Get symptoms (after payment confirmed)
    if (inputs.length === 4) {
      const symptoms = inputs[3].trim();
      const sessionData = await this.getSessionData(sessionId);
      
      if (!sessionData || !sessionData.paymentConfirmed) {
        return lang === 'sw'
          ? 'END Malipo hayajathibitishwa.\nTafadhali anza upya.'
          : 'END Payment not confirmed.\nPlease start again.';
      }

      if (symptoms.length < 20) {
        return lang === 'sw'
          ? 'END Tafadhali andika dalili zako kwa undani zaidi.\nJaribu tena.'
          : 'END Please provide more detailed symptoms.\nTry again.';
      }

      const { selectedDoctor, finalAmount, offer } = sessionData;
      
      // Determine consultation type
      let consultationType = 'paid';
      let priority = 0;
      
      if (offer) {
        if (offer.offer_type === 'free_consultation') {
          consultationType = 'free_offer';
        } else if (offer.offer_type === 'priority_queue') {
          priority = 1;
        }
      }

      // Create case
      const caseData = await Case.create(user.id, symptoms, consultationType, priority);
      await Case.assignToDoctor(caseData.id, selectedDoctor.id);
      
      // Create transaction record
      await pool.query(
        `INSERT INTO transactions (user_id, case_id, amount, payment_method, status) 
         VALUES (?, ?, ?, ?, 'completed')`,
        [user.id, caseData.id, finalAmount, sessionData.paymentMethod || 'balance']
      );
      
      // Increment consultation count
      await User.incrementConsultationCount(user.id);
      
      // Check for new offers
      await Offer.checkAndCreateOffers(user.id, user.consultation_count + 1);

      return lang === 'sw'
        ? `END Asante! Malipo yamekamilika.\n\nDaktari: ${selectedDoctor.name}\nKiasi: KES ${finalAmount}\nKesi: #${caseData.id}\n\nUtapokea jibu kupitia SMS ndani ya dakika 5-30.`
        : `END Thank you! Payment completed.\n\nDoctor: ${selectedDoctor.name}\nAmount: KES ${finalAmount}\nCase: #${caseData.id}\n\nYou will receive response via SMS in 5-30 minutes.`;
    }
  }

  /**
   * Handle consultation history
   */
  static async handleHistory(user, inputs, lang) {
    const history = await User.getConsultationHistory(user.id, 5);
    
    if (history.length === 0) {
      return lang === 'sw'
        ? 'END Huna historia ya ushauri bado.'
        : 'END No consultation history yet.';
    }

    let message = lang === 'sw' 
      ? 'END Historia yako ya hivi karibuni:\n\n'
      : 'END Your recent history:\n\n';
    
    history.forEach((item, index) => {
      const date = new Date(item.created_at).toLocaleDateString();
      message += `${index + 1}. ${date}\n   ${item.doctor_name || 'Pending'}\n   ${item.status}\n\n`;
    });

    return message;
  }

  /**
   * Handle language change
   */
  static async handleLanguageChange(user, inputs) {
    if (inputs.length === 1) {
      return 'CON Select Language / Chagua Lugha:\n\n1. English\n2. Kiswahili';
    }

    if (inputs.length === 2) {
      const newLang = inputs[1] === '1' ? 'en' : 'sw';
      await User.update(user.id, { language: newLang });
      
      return newLang === 'sw'
        ? 'END Lugha imebadilishwa kuwa Kiswahili.\n\nPiga tena kuendelea.'
        : 'END Language changed to English.\n\nDial again to continue.';
    }
  }

  /**
   * Handle logout
   */
  static async handleLogout(sessionId, lang) {
    await this.clearSession(sessionId);
    
    return lang === 'sw'
      ? 'END Umetoka kikamilifu.\n\nKwa usalama wako, piga tena kuingia.'
      : 'END Logged out successfully.\n\nFor your security, dial again to login.';
  }

  /**
   * Invalid option response
   */
  static invalidOption(lang) {
    return lang === 'sw'
      ? 'END Chaguo si sahihi.\nTafadhali jaribu tena.'
      : 'END Invalid option.\nPlease try again.';
  }

  /**
   * Save USSD session
   */
  static async saveSession(sessionId, userId, phone, step, data) {
    await pool.query(
      `INSERT INTO ussd_sessions (session_id, user_id, phone, step, temporary_data) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       step = ?, 
       temporary_data = ?,
       updated_at = NOW()`,
      [sessionId, userId, phone, step, JSON.stringify(data), step, JSON.stringify(data)]
    );
  }

  /**
   * Get session
   */
  static async getSession(sessionId) {
    const [rows] = await pool.query(
      `SELECT * FROM ussd_sessions WHERE session_id = ? ORDER BY created_at DESC LIMIT 1`,
      [sessionId]
    );
    
    if (rows.length > 0) {
      const session = rows[0];
      if (session.temporary_data) {
        session.data = JSON.parse(session.temporary_data);
        session.authenticated = session.data.authenticated || false;
      }
      return session;
    }
    
    return null;
  }

  /**
   * Update session temporary data
   */
  static async updateSessionData(sessionId, data) {
    await pool.query(
      `UPDATE ussd_sessions 
       SET temporary_data = ?, updated_at = NOW()
       WHERE session_id = ?`,
      [JSON.stringify(data), sessionId]
    );
  }

  /**
   * Get session temporary data
   */
  static async getSessionData(sessionId) {
    const [rows] = await pool.query(
      `SELECT temporary_data 
       FROM ussd_sessions 
       WHERE session_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [sessionId]
    );
    
    if (rows.length > 0 && rows[0].temporary_data) {
      return JSON.parse(rows[0].temporary_data);
    }
    
    return null;
  }

  /**
   * Clear session
   */
  static async clearSession(sessionId) {
    await pool.query(
      `DELETE FROM ussd_sessions WHERE session_id = ?`,
      [sessionId]
    );
  }
}

module.exports = USSDServiceV2;
