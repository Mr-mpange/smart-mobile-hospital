# Doctor-Patient Chat Feature

## Overview
After completing payment, patients receive a **unique chat code** to communicate directly with their assigned doctor via SMS. This provides a better experience than USSD for follow-up questions.

---

## How It Works

### 1. Patient Completes Payment
After paying for consultation, patient receives SMS:

```
Payment completed! Your consultation has been received.

Doctor: Dr. John Kamau
Amount: TZS 500
Case: #123

Doctor will respond via SMS within 5-30 minutes.

TO CHAT WITH DOCTOR:
Send SMS: CHAT123 [your message]
To: 34059

Example: CHAT123 What food can I eat?

SmartHealth
```

### 2. Patient Sends Chat Message
Patient sends SMS to shortcode `34059`:
```
CHAT123 Can I take paracetamol with antibiotics?
```

### 3. System Processes Message
- ✅ Validates chat code (CHAT123 = Case #123)
- ✅ Verifies patient owns this case
- ✅ Checks if case is paid (free trials can't chat)
- ✅ Saves message to database
- ✅ Sends confirmation to patient
- ✅ Notifies doctor

### 4. Patient Receives Confirmation
```
Your message has been received. Dr. John Kamau will respond shortly.
```

### 5. Doctor Responds
Doctor sees chat messages in dashboard and responds.

---

## Security Features

### ✅ Only Paid Consultations
Free trial users cannot use chat feature:
```
Chat is not available for free consultations. 
Please pay for a consultation to chat with a doctor.
```

### ✅ Case Ownership Verification
Users can only chat on their own cases:
```
You don't have permission to chat on this case.
```

### ✅ Valid Case Check
Invalid chat codes are rejected:
```
Case #999 not found. Please check the case number.
```

---

## Database Structure

### case_messages Table
```sql
CREATE TABLE case_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_id INT NOT NULL,
  sender_type ENUM('patient', 'doctor'),
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id)
);
```

**Example Data:**
| id | case_id | sender_type | sender_id | message | created_at |
|----|---------|-------------|-----------|---------|------------|
| 1 | 123 | patient | 5 | Can I eat spicy food? | 2025-11-20 14:30 |
| 2 | 123 | doctor | 2 | Avoid spicy food for 3 days | 2025-11-20 14:35 |
| 3 | 123 | patient | 5 | Thank you doctor! | 2025-11-20 14:36 |

---

## SMS Format

### Chat Code Format
- **Pattern:** `CHAT[CaseID]`
- **Examples:** 
  - Case #1 → `CHAT1`
  - Case #123 → `CHAT123`
  - Case #9999 → `CHAT9999`

### Message Format
```
CHAT[CaseID] [message]
```

**Valid Examples:**
- `CHAT123 What food can I eat?`
- `CHAT456 Can I exercise?`
- `CHAT789 Thank you doctor`

**Invalid Examples:**
- `CHAT 123 message` ❌ (space after CHAT)
- `chat123 message` ❌ (lowercase - will work but not recommended)
- `123 message` ❌ (missing CHAT prefix)

---

## Implementation Details

### SMS Handler
Located in: `backend/services/sms.service.js`

```javascript
// Detect chat message
const chatMatch = message.match(/^CHAT(\d+)\s+(.+)$/i);
if (chatMatch) {
  const caseId = chatMatch[1];
  const chatMessage = chatMatch[2];
  await this.handleChatMessage(user, caseId, chatMessage);
  return;
}
```

### Chat Message Handler
```javascript
static async handleChatMessage(user, caseId, message) {
  // 1. Validate case exists
  // 2. Verify user owns case
  // 3. Check if case is paid
  // 4. Save message to database
  // 5. Send confirmation
  // 6. Notify doctor
}
```

---

## Testing

### Test Chat Feature

1. **Complete a paid consultation:**
   ```bash
   # Via USSD
   Dial *384*34153#
   → Login
   → Select "Paid Consultation"
   → Select doctor
   → Pay
   → Enter symptoms
   ```

2. **Check SMS for chat code:**
   ```
   You'll receive: "TO CHAT WITH DOCTOR: Send SMS: CHAT12 [your message]"
   ```

3. **Send chat message:**
   ```
   Send SMS to 34059:
   CHAT12 Can I take medicine with food?
   ```

4. **Verify in database:**
   ```sql
   SELECT * FROM case_messages WHERE case_id = 12;
   ```

---

## Benefits

### For Patients:
✅ Direct communication with doctor
✅ Ask follow-up questions
✅ Get clarifications
✅ Better than USSD for conversations
✅ SMS-based (works on any phone)

### For Doctors:
✅ Better patient engagement
✅ Provide better care
✅ Answer follow-up questions
✅ Build patient relationships
✅ Reduce repeat consultations

### For Business:
✅ Higher patient satisfaction
✅ Better retention
✅ Premium feature for paid users
✅ Competitive advantage
✅ Increased consultation value

---

## Future Enhancements

### Phase 2:
- [ ] Doctor SMS notifications for new chat messages
- [ ] Doctor can reply via SMS (not just dashboard)
- [ ] Chat history in patient SMS
- [ ] Chat expiry (e.g., 7 days after consultation)
- [ ] Chat analytics (response time, message count)

### Phase 3:
- [ ] WhatsApp integration
- [ ] Voice messages
- [ ] Image sharing (for rashes, wounds, etc.)
- [ ] Video consultation scheduling
- [ ] AI-powered chat suggestions

---

## Summary

The chat feature provides a **secure, paid-only** communication channel between patients and doctors via SMS. It's:

- ✅ **Simple** - Just send SMS with chat code
- ✅ **Secure** - Only paid patients can chat
- ✅ **Convenient** - Works on any phone
- ✅ **Effective** - Better than USSD for conversations

This is a **great idea** and adds significant value to your telemedicine platform! 🎉
