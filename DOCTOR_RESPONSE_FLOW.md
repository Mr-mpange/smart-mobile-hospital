# Doctor Response Flow

## How Doctors Respond to Patient Consultations

### Overview
When a patient submits symptoms via USSD or SMS, doctors can respond through the **Admin Dashboard**. The response is automatically sent to the patient via SMS.

---

## Complete Flow

### 1. Patient Submits Consultation
**Via USSD:**
- Patient dials `*384*34153#`
- Selects Free Trial or Paid Consultation
- Enters symptoms
- Case is created and assigned to a doctor

**Via SMS:**
- Patient sends: `CONSULT I have fever and headache`
- Case is created and auto-assigned

### 2. Doctor Receives Notification
**Dashboard View:**
- Doctor logs into admin dashboard at `http://localhost:3000/doctor/login`
- Sees list of pending cases
- Each case shows:
  - Patient phone number
  - Symptoms
  - Consultation type (trial/paid)
  - Timestamp

### 3. Doctor Responds
**API Endpoint:**
```
POST /api/doctors/cases/:caseId/respond
Authorization: Bearer {doctor_token}
Body: {
  "response": "Doctor's medical advice here..."
}
```

**What Happens:**
1. ✅ Response is saved to database
2. ✅ Case status updated to "completed"
3. ✅ SMS automatically sent to patient
4. ✅ Doctor's consultation count incremented

### 4. Patient Receives Response
**SMS Format (English):**
```
Response from Dr. John Kamau:

[Doctor's medical advice]

Case #123
```

**SMS Format (Swahili):**
```
Jibu kutoka kwa Dr. John Kamau:

[Ushauri wa daktari]

Kesi #123
```

---

## Doctor Dashboard Features

### Login
```
URL: http://localhost:3000/doctor/login
Email: doctor@example.com
Password: doctor's password
```

### View Cases
```
GET /api/doctors/cases
Returns: List of assigned cases
```

### Respond to Case
```
POST /api/doctors/cases/:caseId/respond
Body: {
  "response": "Medical advice (min 10 characters)"
}
```

### View Case Details
```
GET /api/doctors/cases/:caseId
Returns: Full case details including patient info
```

---

## SMS Service Integration

### Automatic SMS Sending
When doctor responds, the system:
1. Gets case details from database
2. Gets patient phone number
3. Gets patient language preference
4. Formats message in correct language
5. Sends via Africa's Talking SMS API
6. Uses shortcode `34059` for two-way SMS

### SMS Queue
If SMS fails to send:
- Message is queued in `sms_queue` table
- Cron job retries every 5 minutes
- Max 3 retry attempts

---

## Testing Doctor Response

### 1. Create a Test Case
```bash
# Via USSD simulator
node test-ussd-flow.js

# Or via API
curl -X POST http://localhost:5000/api/cases \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "symptoms": "I have fever and headache",
    "consultationType": "trial"
  }'
```

### 2. Doctor Login
```bash
curl -X POST http://localhost:5000/api/doctors/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "password123"
  }'
```

### 3. Respond to Case
```bash
curl -X POST http://localhost:5000/api/doctors/cases/1/respond \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "response": "Based on your symptoms, I recommend: 1. Rest for 2-3 days. 2. Take paracetamol 500mg every 6 hours. 3. Drink plenty of fluids. If symptoms persist after 3 days, visit a hospital."
  }'
```

### 4. Check SMS Sent
```bash
# Check sms_queue table
SELECT * FROM sms_queue ORDER BY created_at DESC LIMIT 5;

# Check case status
SELECT * FROM cases WHERE id = 1;
```

---

## Database Tables

### Cases Table
```sql
CREATE TABLE cases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  doctor_id INT,
  symptoms TEXT,
  response TEXT,  -- Doctor's response stored here
  status ENUM('pending', 'assigned', 'completed'),
  consultation_type ENUM('trial', 'paid', 'free_offer'),
  priority INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### SMS Queue Table
```sql
CREATE TABLE sms_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20),
  message TEXT,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  attempts INT DEFAULT 0,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Frontend Integration

### Doctor Dashboard Component
```javascript
// View pending cases
const cases = await fetch('/api/doctors/cases');

// Respond to case
const response = await fetch(`/api/doctors/cases/${caseId}/respond`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    response: doctorAdvice
  })
});
```

### Case List UI
```jsx
<div className="case-card">
  <h3>Case #{case.id}</h3>
  <p><strong>Patient:</strong> {case.user_phone}</p>
  <p><strong>Symptoms:</strong> {case.symptoms}</p>
  <p><strong>Type:</strong> {case.consultation_type}</p>
  <textarea 
    placeholder="Enter your medical advice..."
    value={response}
    onChange={(e) => setResponse(e.target.value)}
  />
  <button onClick={handleRespond}>Send Response</button>
</div>
```

---

## Response Guidelines for Doctors

### Good Response Example:
```
Based on your symptoms of fever and headache, I recommend:

1. Rest: Get plenty of sleep for 2-3 days
2. Medication: Take Paracetamol 500mg every 6 hours
3. Hydration: Drink at least 2 liters of water daily
4. Monitor: Check temperature twice daily

If symptoms persist after 3 days or worsen, please visit a hospital immediately.

Stay well!
```

### Minimum Requirements:
- ✅ At least 10 characters
- ✅ Clear medical advice
- ✅ Actionable recommendations
- ✅ Follow-up instructions

---

## Troubleshooting

### SMS Not Sending?
1. Check Africa's Talking credentials in `.env`
2. Check SMS queue: `SELECT * FROM sms_queue WHERE status = 'failed'`
3. Check API logs for errors
4. Verify phone number format (+255...)

### Response Not Saving?
1. Check doctor authentication token
2. Verify case exists and is assigned to doctor
3. Check response length (min 10 characters)
4. Check database connection

### Patient Not Receiving SMS?
1. Verify patient phone number in database
2. Check SMS queue status
3. Check Africa's Talking SMS balance
4. Verify shortcode is active

---

## Summary

**Doctor Response Flow:**
1. Patient submits symptoms → Case created
2. Doctor logs into dashboard → Views cases
3. Doctor writes response → Clicks send
4. System saves response → Updates case status
5. SMS automatically sent → Patient receives advice

**Key Features:**
- ✅ Automatic SMS delivery
- ✅ Two-way SMS support
- ✅ Queue system for reliability
- ✅ Multi-language support
- ✅ Real-time notifications

The system is fully automated - doctors just need to write their medical advice and click send! 🏥
