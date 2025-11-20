const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Case = require('../models/Case');
const Offer = require('../models/Offer');
const PaymentService = require('./payment.service');
const SMSService = require('./sms.service');
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
    try {
      // Check if user exists
      let user = await User.findByPhone(phoneNumber);
      
      // Parse user input
      const inputs = text ? text.split('*') : [];
      
      // Log without exposing sensitive data
      console.log(`[USSD] Session: ${sessionId}, Phone: ${phoneNumber}, InputCount: ${inputs.length}`);
      
      // NEW USER FLOW - Registration required
      if (!user) {
        return this.handleRegistration(sessionId, phoneNumber, inputs);
      }
      
      // EXISTING USER FLOW - Login required
      const session = await this.getSession(sessionId);
      console.log(`[USSD] Session data:`, session ? { authenticated: session.authenticated, step: session.step } : 'null');
      
      // Check if user has pending payment
      if (session && session.data && session.data.paymentPending) {
        return this.handlePaymentVerification(user, session.data, lang, sessionId);
      }
      
      // Check if user is authenticated in this session
      if (!session || !session.authenticated) {
        return this.handleLogin(sessionId, user, inputs);
      }
      
      // User is authenticated - show main menu
      const language = user.language || 'en';
      
      if (inputs.length === 0 || text === '') {
        return this.mainMenu(language, user);
      }
      
      // Check if first input is a PIN (4 digits) - skip it if so
      let menuInputs = inputs;
      if (inputs.length > 1 && /^\d{4}$/.test(inputs[0])) {
        // First input is a PIN, use inputs starting from index 1
        menuInputs = inputs.slice(1);
        console.log(`[USSD] Skipping PIN, using menu inputs from index 1, menuInputs:`, menuInputs);
      } else {
        console.log(`[USSD] Using original inputs as menuInputs:`, menuInputs);
      }
      
      // Route to appropriate menu
      console.log(`[USSD] Routing to option: ${menuInputs[0]}`);
      
      // Update session to maintain authentication (preserve existing data)
      const existingSession = await this.getSessionData(sessionId) || {};
      await this.updateSessionData(sessionId, { 
        ...existingSession,
        authenticated: true,
        userId: user.id,
        step: 'menu_navigation'
      });
      
      if (menuInputs[0] === '1') {
        // Pass inputs without the menu option number
        return this.handleTrialFlow(user, menuInputs.slice(1), language, sessionId);
      } else if (menuInputs[0] === '2') {
        // Pass inputs without the menu option number
        return this.handlePaidFlow(user, menuInputs.slice(1), language, sessionId);
      } else if (menuInputs[0] === '3') {
        // Pass inputs without the menu option number
        return this.handleHistory(user, menuInputs.slice(1), language);
      } else if (menuInputs[0] === '4') {
        // Pass inputs without the menu option number
        return this.handleLanguageChange(user, menuInputs.slice(1));
      } else if (menuInputs[0] === '5') {
        return this.handleLogout(sessionId, language);
      } else {
        console.log(`[USSD] Invalid option: ${menuInputs[0]}`);
        return this.invalidOption(language);
      }
    } catch (error) {
      console.error('[USSD] Error in handleUSSD:', error);
      throw error;
    }
  }

  /**
   * Handle new user registration
   */
  static async handleRegistration(sessionId, phoneNumber, inputs) {
    // Step 1: Welcome and ask for name
    if (inputs.length === 0) {
      await this.saveSession(sessionId, null, phoneNumber, 'registration_name', {});
      return `CON SmartHealth
Welcome!
You are a new user.
Get 3 FREE consultations!
Please enter your full name:`;
    }
    
    // Step 2: Ask for password
    if (inputs.length === 1) {
      const name = inputs[0].trim();
      
      if (name.length < 3) {
        return `END Name Too Short

Name must be at least 3 characters.

Please dial again:
${process.env.AT_USSD_CODE || '*384*34153#'}

Thank you!`;
      }
      
      await this.saveSession(sessionId, null, phoneNumber, 'registration_password', { name });
      return `CON Hello ${name}!
Create a 4-digit PIN:
(This will protect your medical records)
Example: 1234`;
    }
    
    // Step 3: Confirm password and create account
    if (inputs.length >= 2) {
      const name = inputs[0].trim();
      const password = inputs[1].trim();
      
      if (!/^\d{4}$/.test(password)) {
        return `END Invalid PIN

PIN must be exactly 4 digits.
Example: 1234

Please dial again:
${process.env.AT_USSD_CODE || '*384*34153#'}

Thank you!`;
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
      
      // Send welcome SMS
      try {
        const welcomeMessage = user.language === 'sw'
          ? `Karibu SmartHealth, ${name}!

Umesajiliwa kikamilifu.
Una ushauri 3 wa BURE!

Piga: ${process.env.AT_USSD_CODE || '*384*34153#'}

Asante!`
          : `Welcome to SmartHealth, ${name}!

Registration successful.
You have 3 FREE consultations!

Dial: ${process.env.AT_USSD_CODE || '*384*34153#'}

Thank you!`;
        
        await SMSService.sendSMS(phoneNumber, welcomeMessage);
        console.log(`[USSD] Welcome SMS sent to ${phoneNumber}`);
      } catch (smsError) {
        console.error('[USSD] Failed to send welcome SMS:', smsError.message);
        // Continue even if SMS fails
      }
      
      return `END Registration Successful!

Name: ${name}
Phone: ${phoneNumber}
Trial: 3 FREE consultations

Dial to start:
${process.env.AT_USSD_CODE || '*384*34153#'}

Welcome to SmartHealth!`;
    }
  }

  /**
   * Handle payment verification after M-Pesa payment
   */
  static async handlePaymentVerification(user, sessionData, lang, sessionId) {
    try {
      // Check payment status
      const transaction = await PaymentService.checkPaymentStatus(sessionData.transactionId);
      
      if (transaction.status === 'completed') {
        // Payment successful - ask for symptoms
        return lang === 'sw'
          ? `CON Malipo Yamekamilika!

Sasa andika dalili zako kwa undani:
(Angalau sentensi 2)

Mfano: Nina maumivu ya tumbo na kuhara kwa siku 3`
          : `CON Payment Completed!

Now describe your symptoms in detail:
(At least 2 sentences)

Example: I have stomach pain and diarrhea for 3 days`;
      } else if (transaction.status === 'pending') {
        // Payment still pending
        return lang === 'sw'
          ? `END Malipo Bado Yanasubiri

Tafadhali lipa kwanza kupitia SMS.
Kisha piga tena:
${process.env.AT_USSD_CODE || '*384*34153#'}

Kesi: #${sessionData.caseId}
Asante!`
          : `END Payment Still Pending

Please complete payment via SMS.
Then dial again:
${process.env.AT_USSD_CODE || '*384*34153#'}

Case: #${sessionData.caseId}
Thank you!`;
      } else {
        // Payment failed
        await this.clearSession(sessionId);
        return lang === 'sw'
          ? `END Malipo Yameshindwa

Tafadhali jaribu tena.

Piga:
${process.env.AT_USSD_CODE || '*384*34153#'}

Asante!`
          : `END Payment Failed

Please try again.

Dial:
${process.env.AT_USSD_CODE || '*384*34153#'}

Thank you!`;
      }
    } catch (error) {
      console.error('[USSD] Payment verification error:', error);
      return lang === 'sw'
        ? `END Kosa la Kuthibitisha Malipo

Tafadhali jaribu tena baadaye.

Asante!`
        : `END Payment Verification Error

Please try again later.

Thank you!`;
    }
  }

  /**
   * Handle user login
   */
  static async handleLogin(sessionId, user, inputs) {
    // Step 1: Ask for PIN
    if (inputs.length === 0) {
      await this.saveSession(sessionId, user.id, user.phone, 'login_password', {});
      return `CON SmartHealth
Welcome back ${user.name || 'User'}
Enter your 4-digit PIN:`;
    }
    
    // Step 2: Verify PIN and handle menu selection
    if (inputs.length >= 1) {
      const password = inputs[0].trim();
      
      // Verify password
      const isValid = await User.verifyPassword(user.id, password);
      
      if (!isValid) {
        return `END Incorrect PIN

The PIN you entered is wrong.

Please dial again:
${process.env.AT_USSD_CODE || '*384*34153#'}

Forgot PIN? Contact support.
Thank you!`;
      }
      
      // Mark session as authenticated
      await this.saveSession(sessionId, user.id, user.phone, 'authenticated', { 
        authenticated: true,
        userId: user.id 
      });
      
      const language = user.language || 'en';
      
      // If user just entered PIN (no menu selection yet)
      if (inputs.length === 1) {
        console.log(`[USSD] Login successful, showing main menu`);
        return this.mainMenu(language, user);
      }
      
      // If user selected a menu option after PIN (inputs.length >= 2)
      const menuOption = inputs[1];
      console.log(`[USSD] Login successful, menu option selected: ${menuOption}`);
      
      // Keep session authenticated for subsequent requests
      await this.saveSession(sessionId, user.id, user.phone, 'menu_selected', { 
        authenticated: true,
        userId: user.id,
        menuOption: menuOption
      });
      
      if (menuOption === '1') {
        return this.handleTrialFlow(user, ['1', ...inputs.slice(2)], language, sessionId);
      } else if (menuOption === '2') {
        return this.handlePaidFlow(user, ['2', ...inputs.slice(2)], language, sessionId);
      } else if (menuOption === '3') {
        return this.handleHistory(user, ['3', ...inputs.slice(2)], language);
      } else if (menuOption === '4') {
        return this.handleLanguageChange(user, ['4', ...inputs.slice(2)]);
      } else if (menuOption === '5') {
        return this.handleLogout(sessionId, language);
      } else {
        return this.invalidOption(language);
      }
    }
  }

  /**
   * Main menu (after authentication)
   */
  static mainMenu(lang = 'en', user) {
    const trialRemaining = user.trial_end && new Date(user.trial_end) > new Date() 
      ? Math.max(0, 3 - (user.consultation_count || 0))
      : 0;
    
    const menus = {
      en: `CON SmartHealth
Welcome ${user.name || 'User'}

1. Free Trial${trialRemaining > 0 ? ` (${trialRemaining} left)` : ' (Expired)'}
2. Paid Consultation
3. My History
4. Change Language
5. Logout`,
      sw: `CON SmartHealth
Karibu ${user.name || 'Mtumiaji'}

1. Bure${trialRemaining > 0 ? ` (${trialRemaining} zimebaki)` : ' (Imeisha)'}
2. Malipo
3. Historia
4. Lugha
5. Toka`
    };
    return menus[lang] || menus.en;
  }

  /**
   * Handle trial consultation flow
   */
  static async handleTrialFlow(user, inputs, lang, sessionId) {
    const isInTrial = await User.isInTrial(user.id);
    
    if (inputs.length === 0) {
      if (!isInTrial) {
        return lang === 'sw' 
          ? `END Kipindi cha Bure Kimeisha

Umeshatumia ushauri 3 wa bure.
Tafadhali chagua "Malipo" kutoka menyu kuu.

Asante!`
          : `END Trial Period Ended

You've used all 3 free consultations.
Please choose "Paid Consultation" from main menu.

Thank you!`;
      }
      
      const remaining = Math.max(0, 3 - (user.consultation_count || 0));
      
      return lang === 'sw'
        ? `CON Ushauri wa Bure (${remaining} zimebaki)
Andika dalili zako kwa undani:
(Angalau sentensi 2)
Mfano: Nina maumivu ya kichwa na homa kwa siku 2`
        : `CON Free Trial Consultation (${remaining} remaining)
Describe your symptoms in detail:
(At least 2 sentences)
Example: I have severe headache and fever for 2 days`;
    }

    if (inputs.length === 1) {
      const symptoms = inputs[0].trim();
      
      if (symptoms.length < 20) {
        return lang === 'sw'
          ? `END Maelezo Mafupi Sana

Tafadhali eleza dalili zako kwa undani zaidi.
Angalau sentensi 2 au maneno 20.

Jaribu tena!`
          : `END Description Too Short

Please provide more detailed symptoms.
At least 2 sentences or 20 words.

Try again!`;
      }

      // Create case
      const caseData = await Case.create(user.id, symptoms, 'trial', 0);
      
      // Auto-assign to available doctor
      await Case.autoAssign(caseData.id);
      
      // Increment consultation count
      await User.incrementConsultationCount(user.id);
      
      // Check for offers
      await Offer.checkAndCreateOffers(user.id, user.consultation_count + 1);

      // Send confirmation SMS
      try {
        const confirmMessage = lang === 'sw'
          ? `Asante! Ushauri wako umepokelewa.

Kesi: #${caseData.id}
Daktari atakujibu kupitia SMS ndani ya dakika 5-30.

SmartHealth`
          : `Thank you! Your consultation has been received.

Case: #${caseData.id}
A doctor will respond via SMS within 5-30 minutes.

SmartHealth`;
        
        await SMSService.sendSMS(user.phone, confirmMessage);
        console.log(`[USSD] Confirmation SMS sent to ${user.phone} for case #${caseData.id}`);
      } catch (smsError) {
        console.error('[USSD] Failed to send confirmation SMS:', smsError.message);
      }
      
      return lang === 'sw'
        ? `END Imepokelewa!

Daktari atakujibu kupitia SMS.

Kesi: #${caseData.id}
Muda: Dakika 5-30
Jibu: SMS

Asante kutumia SmartHealth!`
        : `END Received!

A doctor will respond via SMS.

Case: #${caseData.id}
Time: 5-30 minutes
Reply: SMS

Thank you for using SmartHealth!`;
    }
  }

  /**
   * Handle paid consultation flow with PAYMENT FIRST
   */
  static async handlePaidFlow(user, inputs, lang, sessionId) {
    // Step 1: Show available doctors (first time selecting paid consultation)
    if (inputs.length === 0) {
      const doctors = await Doctor.getAvailable();
      
      if (doctors.length === 0) {
        return lang === 'sw'
          ? `END Hakuna Madaktari

Samahani, hakuna madaktari wanaopatikana sasa.

Tafadhali jaribu tena baadaye.

Asante!`
          : `END No Doctors Available

Sorry, no doctors are available right now.

Please try again later.

Thank you!`;
      }

      let menu = lang === 'sw' 
        ? 'Chagua Daktari\n'
        : 'Select Doctor\n';
      
      doctors.forEach((doc, index) => {
        menu += `${index + 1}. Dr. ${doc.name}\n`;
        menu += `${doc.specialization} - KES ${doc.fee}\n`;
      });

      // Store doctors in session (preserve authentication)
      const currentSession = await this.getSessionData(sessionId) || {};
      await this.updateSessionData(sessionId, { 
        ...currentSession,
        authenticated: true,
        doctors, 
        step: 'doctor_selected' 
      });
      
      return 'CON ' + menu;
    }

    // Step 2: PAYMENT - Show payment options (after selecting doctor)
    if (inputs.length === 1) {
      const doctorIndex = parseInt(inputs[0]) - 1;
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

      // Store selected doctor and amount (preserve authentication)
      await this.updateSessionData(sessionId, { 
        ...sessionData,
        authenticated: true,
        selectedDoctor,
        finalAmount,
        discount,
        offer,
        step: 'payment'
      });

      if (finalAmount === 0) {
        return lang === 'sw'
          ? `CON HONGERA! Ushauri wa BURE!
Daktari: ${selectedDoctor.name}
Bei ya kawaida: KES ${selectedDoctor.fee}
Punguzo: -KES ${discount}
Bei yako: KES 0
1. Endelea
2. Rudi`
          : `CON CONGRATULATIONS! FREE Consultation!
Doctor: ${selectedDoctor.name}
Regular price: KES ${selectedDoctor.fee}
Discount: -KES ${discount}
Your price: KES 0
1. Continue
2. Back`;
      }

      return lang === 'sw'
        ? `CON MALIPO YANAHITAJIKA
Daktari: ${selectedDoctor.name}
Bei: KES ${selectedDoctor.fee}${discount > 0 ? `\nPunguzo: -KES ${discount}` : ''}
Jumla: KES ${finalAmount}
Chagua njia ya malipo:
1. Malipo ya Simu
2. Salio (KES ${user.balance})
3. Rudi`
        : `CON PAYMENT REQUIRED
Doctor: ${selectedDoctor.name}
Fee: KES ${selectedDoctor.fee}${discount > 0 ? `\nDiscount: -KES ${discount}` : ''}
Total: KES ${finalAmount}
Select payment method:
1. Mobile Payment
2. Balance (KES ${user.balance})
3. Back`;
    }

    // Step 3: Process payment
    if (inputs.length === 2) {
      const paymentMethod = inputs[1];
      const sessionData = await this.getSessionData(sessionId);
      
      if (!sessionData || !sessionData.selectedDoctor) {
        return this.invalidOption(lang);
      }

      const { selectedDoctor, finalAmount, offer } = sessionData;

      // Handle free consultation
      if (finalAmount === 0 && paymentMethod === '1') {
        // Apply the free offer
        if (offer) {
          await Offer.apply(offer.id);
        }
        
        await this.updateSessionData(sessionId, { 
          ...sessionData,
          authenticated: true,
          paymentConfirmed: true,
          paymentMethod: 'free_offer',
          step: 'symptoms'
        });
        
        return lang === 'sw'
          ? 'CON Andika dalili zako:\n(Angalau sentensi 2)'
          : 'CON Enter your symptoms:\n(At least 2 sentences)';
      }

      // Payment method: Mobile Payment (Zenopay - supports all networks)
      if (paymentMethod === '1') {
        try {
          console.log(`[USSD] Initiating payment for user ${user.id}, amount: ${finalAmount}`);
          
          // Create a temporary case to link with payment
          const tempCase = await Case.create(user.id, 'Payment pending', 'paid', 0);
          await Case.assignToDoctor(tempCase.id, selectedDoctor.id);
          
          console.log(`[USSD] Created case #${tempCase.id}, initiating Zenopay payment...`);
          
          // Initiate Zenopay payment
          const paymentResult = await PaymentService.initiatePayment(
            user.id, 
            finalAmount, 
            tempCase.id
          );
          
          console.log(`[USSD] Payment initiated successfully, transaction ID: ${paymentResult.transactionId}`);
          
          // Store payment info in session for later verification
          await this.updateSessionData(sessionId, {
            ...sessionData,
            authenticated: true,
            paymentPending: true,
            transactionId: paymentResult.transactionId,
            caseId: tempCase.id,
            step: 'payment_pending'
          });
          
          return lang === 'sw'
            ? `END Ombi la Malipo Limetumwa!

Kiasi: KES ${finalAmount}
Nambari: ${user.phone}

Utapokea SMS ya malipo.
Lipa kisha piga tena:
${process.env.AT_USSD_CODE || '*384*34153#'}

Kesi: #${tempCase.id}
Asante!`
            : `END Payment Request Sent!

Amount: KES ${finalAmount}
Number: ${user.phone}

You will receive payment SMS.
Pay then dial again:
${process.env.AT_USSD_CODE || '*384*34153#'}

Case: #${tempCase.id}
Thank you!`;
        } catch (error) {
          console.error('[USSD] Payment initiation error:', error.message);
          console.error('[USSD] Error stack:', error.stack);
          return lang === 'sw'
            ? `END Kosa la Malipo

Samahani, malipo hayawezi kuanza sasa.
Tafadhali jaribu tena baadaye.

Asante!`
            : `END Payment Error

Sorry, payment cannot be initiated now.
Please try again later.

Thank you!`;
        }
      }

      // Payment method: Balance
      if (paymentMethod === '2') {
        if (user.balance < finalAmount) {
          const shortage = finalAmount - user.balance;
          return lang === 'sw'
            ? `END Salio Haitoshi!

Salio lako: KES ${user.balance}
Unahitaji: KES ${finalAmount}
Upungufu: KES ${shortage}

Tafadhali:
1. Tumia Malipo ya Simu, au
2. Ongeza salio kwanza

Asante!`
            : `END Insufficient Balance!

Your balance: KES ${user.balance}
Required: KES ${finalAmount}
Short by: KES ${shortage}

Please:
1. Use Mobile Payment, or
2. Top up your balance first

Thank you!`;
        }

        // Deduct from balance
        await User.updateBalance(user.id, -finalAmount);
        
        // Apply offer if exists
        if (offer) {
          await Offer.apply(offer.id);
        }

        await this.updateSessionData(sessionId, { 
          ...sessionData,
          authenticated: true,
          paymentConfirmed: true,
          paymentMethod: 'balance',
          step: 'symptoms'
        });
        
        return lang === 'sw'
          ? `CON Malipo Yamefanikiwa!

Kiasi: KES ${finalAmount}
Salio mpya: KES ${user.balance - finalAmount}

Sasa andika dalili zako kwa undani:
(Angalau sentensi 2)

Mfano: Nina maumivu ya tumbo na kuhara kwa siku 3`
          : `CON Payment Successful!

Amount: KES ${finalAmount}
New balance: KES ${user.balance - finalAmount}

Now describe your symptoms in detail:
(At least 2 sentences)

Example: I have stomach pain and diarrhea for 3 days`;
      }

      // Back option
      if (paymentMethod === '3') {
        return this.handlePaidFlow(user, [inputs[0]], lang, sessionId);
      }

      return this.invalidOption(lang);
    }

    // Step 4: Get symptoms (after payment confirmed)
    if (inputs.length === 3) {
      const symptoms = inputs[2].trim();
      const sessionData = await this.getSessionData(sessionId);
      
      if (!sessionData || !sessionData.paymentConfirmed) {
        return lang === 'sw'
          ? `END Malipo Hayajathibitishwa

Tafadhali anza upya na lipa kwanza.

Piga tena:
${process.env.AT_USSD_CODE || '*384*34153#'}

Asante!`
          : `END Payment Not Confirmed

Please start again and pay first.

Dial again:
${process.env.AT_USSD_CODE || '*384*34153#'}

Thank you!`;
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

      // Send confirmation SMS
      try {
        const confirmMessage = lang === 'sw'
          ? `Malipo yamekamilika! Ushauri wako umepokelewa.

Daktari: ${selectedDoctor.name}
Kiasi: KES ${finalAmount}
Kesi: #${caseData.id}

Daktari atakujibu kupitia SMS ndani ya dakika 5-30.

SmartHealth`
          : `Payment completed! Your consultation has been received.

Doctor: ${selectedDoctor.name}
Amount: KES ${finalAmount}
Case: #${caseData.id}

Doctor will respond via SMS within 5-30 minutes.

SmartHealth`;
        
        await SMSService.sendSMS(user.phone, confirmMessage);
        console.log(`[USSD] Confirmation SMS sent to ${user.phone} for case #${caseData.id}`);
      } catch (smsError) {
        console.error('[USSD] Failed to send confirmation SMS:', smsError.message);
      }
      
      return lang === 'sw'
        ? `END Malipo Yamekamilika!

Daktari: ${selectedDoctor.name}
Kiasi: KES ${finalAmount}
Kesi: #${caseData.id}

Muda: Dakika 5-30
Jibu: SMS

Asante kutumia SmartHealth!`
        : `END Payment Completed!

Doctor: ${selectedDoctor.name}
Amount: KES ${finalAmount}
Case: #${caseData.id}

Time: 5-30 minutes
Reply: SMS

Thank you for using SmartHealth!`;
    }
  }

  /**
   * Handle consultation history
   */
  static async handleHistory(user, inputs, lang) {
    const history = await User.getConsultationHistory(user.id, 5);
    
    if (history.length === 0) {
      return lang === 'sw'
        ? `END Historia ya Ushauri

Huna historia ya ushauri bado.

Anza ushauri wako wa kwanza leo!`
        : `END Consultation History

No consultation history yet.

Start your first consultation today!`;
    }

    let message = lang === 'sw' 
      ? 'Historia Yako (5 za hivi karibuni)\n'
      : 'Your History (Last 5)\n';
    
    history.forEach((item, index) => {
      const date = new Date(item.created_at).toLocaleDateString();
      message += `${index + 1}. ${date}\n`;
      message += `Dr: ${item.doctor_name || 'Pending'} - ${item.status}\n`;
    });

    message += lang === 'sw' 
      ? 'Asante kutumia SmartHealth!'
      : 'Thank you for using SmartHealth!';

    return 'END ' + message;
  }

  /**
   * Handle language change
   */
  static async handleLanguageChange(user, inputs) {
    if (inputs.length === 0) {
      return `CON Select Language / Chagua Lugha
1. English
2. Kiswahili`;
    }

    if (inputs.length === 1) {
      const newLang = inputs[0] === '1' ? 'en' : 'sw';
      await User.update(user.id, { language: newLang });
      
      return newLang === 'sw'
        ? `END Lugha Imebadilishwa!

Lugha mpya: Kiswahili

Piga tena kuendelea:
${process.env.AT_USSD_CODE || '*384*34153#'}

Asante!`
        : `END Language Changed!

New language: English

Dial again to continue:
${process.env.AT_USSD_CODE || '*384*34153#'}

Thank you!`;
    }
  }

  /**
   * Handle logout
   */
  static async handleLogout(sessionId, lang) {
    await this.clearSession(sessionId);
    
    return lang === 'sw'
      ? `END Umetoka Kikamilifu

Kwa usalama wako, session imefungwa.

Piga tena kuingia:
${process.env.AT_USSD_CODE || '*384*34153#'}

Asante!`
      : `END Logged Out Successfully

For your security, session closed.

Dial again to login:
${process.env.AT_USSD_CODE || '*384*34153#'}

Thank you!`;
  }

  /**
   * Invalid option response
   */
  static invalidOption(lang) {
    return lang === 'sw'
      ? `END Chaguo Si Sahihi

Tafadhali chagua nambari sahihi.

Piga tena:
${process.env.AT_USSD_CODE || '*384*34153#'}

Asante!`
      : `END Invalid Option

Please select a valid number.

Dial again:
${process.env.AT_USSD_CODE || '*384*34153#'}

Thank you!`;
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
