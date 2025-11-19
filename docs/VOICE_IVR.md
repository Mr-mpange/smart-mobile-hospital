# Voice/IVR System Documentation

Complete guide for the voice consultation feature with live doctor call bridging.

## Overview

The SmartHealth voice system allows patients to call in and consult with doctors via phone. The system uses IVR (Interactive Voice Response) for menu navigation and bridges calls between patients and doctors for live consultations.

## Architecture

```
Patient Call → IVR Menu → Doctor Selection → Symptoms Recording
                                ↓
                    Create Call Request in Queue
                                ↓
                    Notify Doctor (Dashboard/SMS)
                                ↓
                    Doctor Accepts/Rejects
                                ↓
                    Bridge Call (Patient ↔ Doctor)
                                ↓
                    Call Completion & Follow-up
```

## Technology Stack

### Primary: Twilio Voice API
- Industry-standard voice platform
- Excellent call quality
- TwiML for call control
- Call recording and transcription
- Global phone number support

### Alternative: Africa's Talking Voice API
- Africa-focused platform
- Local phone numbers
- Cost-effective for African markets
- Similar functionality to Twilio

## Call Flow

### 1. Patient Calls System

**Patient dials:** `+1234567890` (your Twilio number)

**System responds:**
```
"Welcome to SmartHealth. 
Press 1 for free trial consultation. 
Press 2 for paid consultation. 
Press 3 for consultation history."
```

### 2. Menu Navigation

#### Option 1: Free Trial
```
Check trial status
  ├─ Active → Record symptoms
  └─ Expired → Redirect to paid option
```

#### Option 2: Paid Consultation
```
List available doctors
  ↓
Patient selects doctor
  ↓
Record symptoms
  ↓
Process payment (if needed)
```

#### Option 3: History
```
Read recent consultations
  ↓
Hang up
```

### 3. Symptoms Recording

```
"Please describe your symptoms after the beep. 
Press pound when finished."

[BEEP]
Patient speaks...
[Press #]

"Thank you. We are connecting you to a doctor. Please wait."
[Hold music plays]
```

### 4. Doctor Notification

**System actions:**
1. Create case in database
2. Add to doctor call queue
3. Send SMS to doctor
4. Show notification in dashboard
5. Optionally call doctor directly

**SMS to doctor:**
```
New voice consultation request from John Doe.
Case #123. Login to dashboard to accept or reject.
```

### 5. Doctor Response

**Option A: Via Dashboard**
- Doctor sees notification
- Clicks "Accept" or "Reject"
- System bridges call if accepted

**Option B: Via Phone Call**
- System calls doctor
- IVR: "You have a consultation request from John Doe. Press 1 to accept. Press 2 to reject."
- Doctor presses 1 or 2
- System bridges call if accepted

### 6. Call Bridging

**When doctor accepts:**
```
Patient hears: "Connecting you to the doctor now."
Doctor hears: "Connecting you to the patient now."

[Calls are bridged - live conversation begins]
```

**During call:**
- Both parties can speak freely
- Call is recorded (optional)
- Duration is tracked
- Quality monitoring

### 7. Call Completion

**When call ends:**
1. Log call duration
2. Update case status to "completed"
3. Process payment (if applicable)
4. Update consultation count
5. Apply loyalty offers
6. Send follow-up SMS

**Follow-up SMS to patient:**
```
Thank you for using SmartHealth. 
Your consultation with Dr. John Kamau has been completed. 
Case #123
```

## API Endpoints

### Voice Webhooks

#### Incoming Call
```
POST /api/voice/incoming
Body: { CallSid, From, To }
Response: TwiML
```

#### Menu Selection
```
POST /api/voice/menu
Body: { CallSid, Digits, From }
Response: TwiML
```

#### Doctor Selection
```
POST /api/voice/select-doctor
Body: { CallSid, Digits, From }
Response: TwiML
```

#### Process Symptoms
```
POST /api/voice/process-symptoms
Body: { CallSid, RecordingUrl, From }
Response: TwiML
```

#### Wait for Doctor
```
POST /api/voice/wait-for-doctor
Body: { CallSid }
Response: TwiML
```

#### Call Completed
```
POST /api/voice/call-completed
Body: { CallSid, CallDuration, CallStatus }
Response: TwiML
```

### Doctor Dashboard APIs

#### Get Call Queue
```
GET /api/doctors/call-queue
Headers: Authorization: Bearer <token>
Response: { success: true, queue: [...] }
```

#### Accept Call Request
```
POST /api/doctors/call-queue/:requestId/accept
Headers: Authorization: Bearer <token>
Response: { success: true, message: "Call request accepted" }
```

#### Reject Call Request
```
POST /api/doctors/call-queue/:requestId/reject
Headers: Authorization: Bearer <token>
Body: { reason: "Currently busy" }
Response: { success: true, message: "Call request rejected" }
```

#### Get Call Statistics
```
GET /api/doctors/call-stats
Headers: Authorization: Bearer <token>
Response: { success: true, stats: {...} }
```

## TwiML Examples

### Welcome Menu
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="/api/voice/menu" method="POST" timeout="10">
    <Say voice="alice" language="en-US">
      Welcome to SmartHealth. 
      Press 1 for free trial consultation. 
      Press 2 for paid consultation. 
      Press 3 for consultation history.
    </Say>
  </Gather>
  <Redirect>/api/voice/incoming</Redirect>
</Response>
```

### Record Symptoms
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Please describe your symptoms after the beep. Press pound when finished.</Say>
  <Record 
    action="/api/voice/process-symptoms" 
    method="POST" 
    maxLength="60" 
    finishOnKey="#"
    transcribe="true"
    transcribeCallback="/api/voice/transcription"
  />
</Response>
```

### Hold Music
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you. We are connecting you to a doctor. Please wait.</Say>
  <Play loop="10">
    http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3
  </Play>
  <Redirect>/api/voice/wait-for-doctor</Redirect>
</Response>
```

### Bridge Call
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Connecting you to the doctor now.</Say>
  <Dial 
    action="/api/voice/call-completed" 
    method="POST" 
    timeout="30"
    callerId="+1234567890"
  >
    <Number 
      statusCallbackEvent="answered completed"
      statusCallback="/api/voice/call-status"
      statusCallbackMethod="POST"
    >
      +254712345001
    </Number>
  </Dial>
</Response>
```

## Database Schema

### voice_sessions Table
```sql
CREATE TABLE voice_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    session_id VARCHAR(100),
    call_sid VARCHAR(100) UNIQUE,
    step VARCHAR(50),
    temporary_data JSON,
    status ENUM('active', 'completed', 'failed'),
    call_duration INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### doctor_call_queue Table
```sql
CREATE TABLE doctor_call_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT,
    user_id INT,
    case_id INT,
    call_sid VARCHAR(100),
    doctor_phone VARCHAR(20),
    status ENUM('pending', 'accepted', 'rejected', 'completed', 'timeout'),
    rejection_reason VARCHAR(255),
    call_duration INT,
    created_at TIMESTAMP,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    completed_at TIMESTAMP
);
```

## Configuration

### Twilio Setup

1. **Create Twilio Account**
   - Sign up at https://www.twilio.com/
   - Verify your account
   - Get Account SID and Auth Token

2. **Buy Phone Number**
   - Go to Phone Numbers → Buy a Number
   - Choose a number with Voice capability
   - Purchase the number

3. **Configure Webhooks**
   - Go to Phone Numbers → Manage Numbers
   - Select your number
   - Under Voice & Fax:
     - A CALL COMES IN: `https://your-domain.com/api/voice/incoming`
     - Method: HTTP POST
   - Save

4. **Environment Variables**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Africa's Talking Setup

1. **Create Account**
   - Sign up at https://africastalking.com/
   - Verify your account

2. **Get Voice Number**
   - Go to Voice → Get Started
   - Request a voice-enabled number

3. **Configure Callback**
   - Voice Callback URL: `https://your-domain.com/api/voice/incoming`

4. **Environment Variables**
```env
AT_VOICE_USERNAME=your_username
AT_VOICE_API_KEY=your_api_key
```

## Testing

### Local Testing with ngrok

1. **Install ngrok**
```bash
npm install -g ngrok
```

2. **Start your server**
```bash
npm run dev
```

3. **Expose with ngrok**
```bash
ngrok http 5000
```

4. **Update Twilio webhook**
   - Use ngrok URL: `https://abc123.ngrok.io/api/voice/incoming`

5. **Test call**
   - Call your Twilio number
   - Navigate through menus
   - Test all flows

### Test with Twilio Console

1. Go to Twilio Console → Voice → TwiML Bins
2. Create test TwiML
3. Test with Twilio's test call feature

### cURL Testing

```bash
# Test incoming call webhook
curl -X POST http://localhost:5000/api/voice/incoming \
  -d "CallSid=CAtest123" \
  -d "From=+254712345678" \
  -d "To=+1234567890"

# Test menu selection
curl -X POST http://localhost:5000/api/voice/menu \
  -d "CallSid=CAtest123" \
  -d "Digits=1" \
  -d "From=+254712345678"
```

## Features

### Call Recording
```javascript
// Enable in TwiML
<Record 
  action="/api/voice/process-symptoms" 
  recordingStatusCallback="/api/voice/recording-status"
/>
```

### Call Transcription
```javascript
// Enable in TwiML
<Record 
  transcribe="true"
  transcribeCallback="/api/voice/transcription"
/>
```

### Call Analytics
- Track call duration
- Monitor call quality
- Analyze drop rates
- Doctor response times
- Patient satisfaction

### Multi-language Support
```javascript
// English
<Say voice="alice" language="en-US">Welcome</Say>

// Swahili (if available)
<Say voice="alice" language="sw-KE">Karibu</Say>
```

## Error Handling

### Common Issues

1. **Call Drops**
   - Implement retry logic
   - Send SMS fallback
   - Log for analysis

2. **Doctor Unavailable**
   - Timeout after 5 minutes
   - Offer SMS consultation
   - Suggest alternative doctors

3. **Recording Failures**
   - Allow manual symptom entry
   - Use SMS as backup
   - Notify support team

4. **Payment Issues**
   - Hold call until payment
   - Offer callback option
   - Send payment link via SMS

## Best Practices

### Call Quality
- Use high-quality audio files
- Keep messages concise
- Provide clear instructions
- Test on various networks

### User Experience
- Minimize wait times
- Provide progress updates
- Allow easy navigation
- Offer callback options

### Doctor Experience
- Clear notifications
- Easy accept/reject
- Call preparation time
- Post-call documentation

### Security
- Encrypt recordings
- Secure webhooks
- Validate caller ID
- HIPAA compliance (if applicable)

## Monitoring

### Key Metrics
- Total calls received
- Call completion rate
- Average call duration
- Doctor response time
- Patient satisfaction
- Call quality scores

### Alerts
- Failed calls
- Long wait times
- Doctor unavailability
- System errors
- Payment failures

## Cost Optimization

### Twilio Pricing
- Incoming calls: ~$0.0085/min
- Outgoing calls: ~$0.013/min
- Recording: ~$0.0025/min
- Transcription: ~$0.05/min

### Tips
- Use local numbers
- Optimize call duration
- Batch notifications
- Cache frequently used data
- Monitor usage patterns

## Scaling

### High Volume
- Load balancing
- Database optimization
- Caching strategies
- Queue management
- Async processing

### Geographic Distribution
- Regional phone numbers
- Local data centers
- CDN for audio files
- Latency optimization

## Compliance

### Healthcare Regulations
- HIPAA (US)
- GDPR (EU)
- Local regulations
- Data retention policies
- Patient consent

### Call Recording
- Inform patients
- Secure storage
- Access controls
- Retention limits
- Deletion procedures

## Troubleshooting

### Debug Mode
```javascript
// Enable detailed logging
console.log('Call details:', {
  CallSid,
  From,
  To,
  CallStatus,
  Direction
});
```

### Webhook Testing
```bash
# Test with Postman
# Set Content-Type: application/x-www-form-urlencoded
# Add Twilio parameters
```

### Common Errors
- 11200: HTTP retrieval failure
- 11205: HTTP connection failure
- 11210: HTTP bad host name
- 13224: Call already ended
- 13227: Call not found

## Future Enhancements

- Video consultations
- Group calls
- Call scheduling
- Voicemail
- Call forwarding
- Conference calls
- Screen sharing
- AI voice assistant
- Real-time translation
- Sentiment analysis

---

**For more information:**
- Twilio Docs: https://www.twilio.com/docs/voice
- Africa's Talking: https://africastalking.com/voice
- TwiML Reference: https://www.twilio.com/docs/voice/twiml
