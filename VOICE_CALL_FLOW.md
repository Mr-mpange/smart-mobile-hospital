# Voice Call Feature - Complete Flow

## Overview
Patients can call a dedicated phone number to speak with doctors via Interactive Voice Response (IVR) system. The system uses **Africa's Talking Voice API** or **Twilio**.

---

## Complete Voice Call Flow

### Step 1: Patient Dials Number
Patient calls: **+254XXXXXXXXX** (Your Africa's Talking voice number)

### Step 2: IVR Welcome Menu
```
🔊 "Welcome to SmartHealth.
    Press 1 for free trial consultation.
    Press 2 for paid consultation.
    Press 3 for consultation history."
```

### Step 3A: Free Trial Consultation (Press 1)

**If trial available:**
```
🔊 "Please describe your symptoms after the beep. 
    Press hash when finished."

[BEEP] 🎤 Patient speaks for up to 60 seconds

🔊 "Thank you. We are connecting you to a doctor. 
    Please wait."

[Hold music plays]

🔊 "You are now connected to Doctor [Name]."

📞 LIVE CALL WITH DOCTOR
```

**If trial expired:**
```
🔊 "Your trial period has ended. 
    Please choose paid consultation."

[Returns to main menu]
```

### Step 3B: Paid Consultation (Press 2)

**Doctor Selection:**
```
🔊 "Available doctors.
    Press 1 for Doctor John Kamau, General Practitioner, fee 500 shillings.
    Press 2 for Doctor Mary Wanjiku, Pediatrician, fee 800 shillings.
    Press 3 for Doctor James Omondi, Dermatologist, fee 1000 shillings."

Patient presses: 1

🔊 "You selected Doctor John Kamau.
    Please describe your symptoms after the beep.
    Press hash when finished."

[BEEP] 🎤 Patient speaks

🔊 "Thank you. We are connecting you to Doctor John Kamau.
    Please wait."

[Hold music plays]

🔊 "You are now connected to Doctor John Kamau."

📞 LIVE CALL WITH DOCTOR

[After call ends]

🔊 "Thank you for using SmartHealth.
    You will be charged 500 shillings.
    Payment details will be sent via SMS.
    Goodbye."
```

### Step 3C: History (Press 3)

```
🔊 "Your recent consultations.
    Case 123, Doctor John Kamau, completed on November 15th.
    Case 124, Doctor Mary Wanjiku, completed on November 18th.
    
    Thank you for using SmartHealth. Goodbye."
```

---

## Technical Implementation

### 1. Call Routing
```
Patient calls → Africa's Talking → Your Server
                                   ↓
                            /api/voice/incoming
```

### 2. IVR XML Response
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetDigits timeout="30" finishOnKey="#" 
              callbackUrl="https://yourserver.com/api/voice/menu">
    <Say voice="man" playBeep="false">
      Welcome to SmartHealth. 
      Press 1 for free trial consultation...
    </Say>
  </GetDigits>
  <Say>We did not receive your input. Goodbye.</Say>
</Response>
```

### 3. Recording Symptoms
```xml
<Record finishOnKey="#" maxLength="60" trimSilence="true"
        callbackUrl="https://yourserver.com/api/voice/process-symptoms">
  <Say>Please describe your symptoms after the beep.</Say>
</Record>
```

### 4. Connecting to Doctor
```xml
<Say>We are connecting you to a doctor. Please wait.</Say>
<Play url="https://holdmusic.mp3"/>
<Dial>
  <Number>+254712345678</Number>  <!-- Doctor's phone -->
</Dial>
```

---

## How Doctor Gets Connected

### Option 1: Doctor Call Queue (Automatic)
1. Patient describes symptoms
2. System creates case in database
3. System finds available doctor
4. System calls doctor's phone
5. Doctor answers
6. System bridges patient and doctor
7. They talk live

### Option 2: Doctor Dashboard (Manual)
1. Patient describes symptoms
2. System creates case
3. Doctor sees case in dashboard
4. Doctor clicks "Call Patient"
5. System bridges the call
6. They talk live

---

## Payment Flow

### For Paid Consultations:

**During Call:**
- No payment required upfront
- Patient can talk to doctor first

**After Call:**
- System calculates call duration
- Charges based on pricing:
  - Minutes 1-5: KES 100
  - Minutes 6-10: KES 200
  - Minutes 11+: KES 50/minute

**Payment SMS:**
```
SmartHealth Consultation

Doctor: Dr. John Kamau
Duration: 8 minutes
Amount: KES 200

Pay via Mobile Payment:
[Payment link]

Thank you!
```

---

## Setup Requirements

### 1. Africa's Talking Voice Setup

**Get Voice Number:**
1. Go to https://account.africastalking.com
2. Navigate to Voice → Numbers
3. Purchase a voice number (e.g., +254XXXXXXXXX)
4. Configure callback URL

**Configure Callbacks:**
```
Incoming Call: https://yourserver.com/api/voice/incoming
Menu Selection: https://yourserver.com/api/voice/menu
Doctor Selection: https://yourserver.com/api/voice/select-doctor
Process Symptoms: https://yourserver.com/api/voice/process-symptoms
```

### 2. Environment Variables

Add to `.env`:
```env
# Africa's Talking Voice
AT_VOICE_PHONE_NUMBER=+254XXXXXXXXX
AT_VOICE_USERNAME=your_username
AT_VOICE_API_KEY=your_api_key
VOICE_PROVIDER=africastalking

# Server URL (must be public)
API_BASE_URL=https://yourserver.com
```

### 3. Make Server Public

Your server must be accessible from the internet:

**Option A: Use ngrok (for testing)**
```bash
ngrok http 5000
# Use the ngrok URL as API_BASE_URL
```

**Option B: Deploy to cloud**
- Heroku
- AWS
- DigitalOcean
- Railway

---

## Voice Call Pricing

### Africa's Talking Rates (Kenya):
- **Incoming calls:** ~KES 2/minute
- **Outgoing calls:** ~KES 3/minute
- **Voice number:** ~KES 500/month

### Your Pricing to Patients:
- **Minutes 1-5:** KES 100 (flat)
- **Minutes 6-10:** KES 200 (flat)
- **Minutes 11+:** KES 50/minute

### Example Profit:
- 5-minute call:
  - Cost: KES 10 (2 x 5)
  - Charge: KES 100
  - Profit: KES 90

- 15-minute call:
  - Cost: KES 30 (2 x 15)
  - Charge: KES 450 (200 + 50x5)
  - Profit: KES 420

---

## Database Tables

### voice_sessions
```sql
CREATE TABLE voice_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  session_id VARCHAR(100),
  call_sid VARCHAR(100),
  step VARCHAR(50),
  data JSON,
  created_at TIMESTAMP
);
```

### doctor_call_queue
```sql
CREATE TABLE doctor_call_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id INT,
  doctor_id INT,
  patient_phone VARCHAR(20),
  doctor_phone VARCHAR(20),
  status ENUM('pending', 'calling', 'connected', 'completed'),
  call_duration INT,
  recording_url VARCHAR(255),
  created_at TIMESTAMP
);
```

---

## Testing Voice Calls

### 1. Test with Simulator
Africa's Talking provides a voice simulator:
```
https://account.africastalking.com/apps/sandbox/voice/simulator
```

### 2. Test with Real Phone
1. Call your voice number
2. Follow IVR prompts
3. Check server logs
4. Verify database entries

### 3. Test Doctor Connection
1. Have a test doctor account
2. Make patient call
3. System should call doctor
4. Both should be connected

---

## Advantages of Voice Calls

### For Patients:
✅ Speak naturally (no typing)
✅ Explain complex symptoms
✅ Ask questions in real-time
✅ Hear doctor's voice (builds trust)
✅ Works on any phone (no smartphone needed)

### For Doctors:
✅ Faster diagnosis
✅ Better understanding of symptoms
✅ Can ask follow-up questions
✅ More personal connection
✅ Higher consultation fees

### For Business:
✅ Premium service (higher prices)
✅ Better patient satisfaction
✅ Competitive advantage
✅ Scalable (IVR handles routing)
✅ Recorded consultations (quality control)

---

## Summary

The voice call system provides a **premium consultation experience** where patients can:

1. 📞 **Call a number** (no app needed)
2. 🎤 **Speak their symptoms** (natural language)
3. 👨‍⚕️ **Talk to real doctor** (live conversation)
4. 💰 **Pay after call** (no upfront payment)

This is **more personal** than SMS/USSD and provides **better care** for complex cases!

---

## Next Steps

1. ✅ Purchase Africa's Talking voice number
2. ✅ Configure callback URLs
3. ✅ Make server publicly accessible
4. ✅ Test with simulator
5. ✅ Test with real phone
6. ✅ Train doctors on system
7. ✅ Launch to patients!

The voice feature is **already implemented** in your code - you just need to configure it! 🎉
