# Payment Webhook - Auto Service Activation

## Overview
When a patient completes payment via Zenopay, the webhook automatically:
1. ✅ Verifies payment signature
2. ✅ Updates transaction status
3. ✅ Activates the service (case)
4. ✅ Sends SMS confirmation to patient
5. ✅ Notifies doctor

---

## Webhook Flow

### Step 1: Patient Makes Payment
```
Patient selects Mobile Payment
→ Zenopay sends push notification
→ Patient completes payment on phone
```

### Step 2: Zenopay Calls Webhook
```
POST https://yourserver.com/api/payments/callback

Body:
{
  "transaction_id": 123,
  "status": "success",
  "payment_id": "ZP_12345",
  "signature": "abc123..."
}
```

### Step 3: System Processes Webhook
```
1. Verify signature ✓
2. Get transaction from database ✓
3. Update status to "completed" ✓
4. Update user balance ✓
5. Activate case (status: assigned) ✓
6. Send SMS to patient ✓
```

### Step 4: Patient Receives SMS
```
Payment completed! Your service is now active.

Case: #123
Amount: TZS 500

Doctor will respond shortly.

SmartHealth
```

### Step 5: Doctor Sees Active Case
Doctor dashboard shows the case as "assigned" and ready to respond.

---

## Webhook Endpoint

### URL
```
POST /api/payments/callback
```

### Request Format
```json
{
  "transaction_id": 123,
  "status": "success",
  "payment_id": "ZP_12345",
  "signature": "abc123def456...",
  "amount": 500,
  "phone": "+254712345678",
  "timestamp": "2025-11-20T14:30:00Z"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Payment processed successfully"
}
```

---

## Security

### Signature Verification
```javascript
// System verifies Zenopay signature
const expectedSignature = generateSignature(data);
if (signature !== expectedSignature) {
  throw new Error('Invalid signature');
}
```

### What Gets Verified:
- ✅ Signature matches
- ✅ Transaction exists
- ✅ Transaction not already processed
- ✅ Amount matches
- ✅ User exists

---

## Automatic Service Activation

### What Happens After Payment:

**1. Transaction Updated**
```sql
UPDATE transactions 
SET status = 'completed', updated_at = NOW() 
WHERE id = 123;
```

**2. User Balance Updated**
```sql
UPDATE users 
SET balance = balance + 500 
WHERE id = 5;
```

**3. Case Activated**
```sql
UPDATE cases 
SET status = 'assigned', updated_at = NOW() 
WHERE id = 123;
```

**4. SMS Sent**
```
Payment completed! Your service is now active.
Case: #123
Amount: TZS 500
Doctor will respond shortly.
```

---

## Testing the Webhook

### Method 1: Test Endpoint (Development)
```bash
# Manually complete payment
curl -X POST http://localhost:5000/api/payments/test-complete/123
```

### Method 2: Simulate Zenopay Callback
```bash
curl -X POST http://localhost:5000/api/payments/callback \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": 123,
    "status": "success",
    "payment_id": "TEST_12345",
    "signature": "test_signature"
  }'
```

### Method 3: Use Zenopay Sandbox
1. Make real payment in sandbox
2. Zenopay calls your webhook
3. Check logs for webhook processing

---

## Webhook Configuration

### In Zenopay Dashboard:
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourserver.com/api/payments/callback`
3. Select events: `payment.success`, `payment.failed`
4. Save configuration

### In Your .env:
```env
ZENOPAY_CALLBACK_URL=https://yourserver.com/api/payments/callback
ZENOPAY_SECRET=your_secret_key
```

### Make Server Public:
Your server must be accessible from internet for webhooks to work.

**Option A: ngrok (testing)**
```bash
ngrok http 5000
# Use: https://abc123.ngrok.io/api/payments/callback
```

**Option B: Deploy (production)**
- Heroku: https://yourapp.herokuapp.com/api/payments/callback
- AWS: https://yourserver.com/api/payments/callback
- DigitalOcean: https://yourserver.com/api/payments/callback

---

## Webhook Logs

### Console Output:
```
[Payment Webhook] Received callback from Zenopay
[Payment Webhook] Data: {
  "transaction_id": 123,
  "status": "success",
  "payment_id": "ZP_12345"
}
[Payment] Payment completed for transaction #123
[Payment] User: 5, Amount: 500
[Payment] Activating service for case #123
[Payment] Activation SMS sent to +254712345678
[Payment Webhook] Processing result: { success: true }
```

### Database Changes:
```sql
-- Before webhook
SELECT * FROM transactions WHERE id = 123;
-- status: 'pending'

-- After webhook
SELECT * FROM transactions WHERE id = 123;
-- status: 'completed'

SELECT * FROM cases WHERE id = 123;
-- status: 'assigned' (was 'pending')
```

---

## Error Handling

### Invalid Signature
```json
{
  "error": "Invalid signature"
}
```

### Transaction Not Found
```json
{
  "error": "Transaction not found"
}
```

### Already Processed
```json
{
  "success": true,
  "message": "Transaction already processed"
}
```

---

## Webhook Retry Logic

### Zenopay Retry Policy:
- Retry 1: After 1 minute
- Retry 2: After 5 minutes
- Retry 3: After 15 minutes
- Retry 4: After 1 hour
- Retry 5: After 6 hours

### Your Response:
- **200 OK**: Payment processed successfully
- **400 Bad Request**: Invalid data
- **500 Error**: Zenopay will retry

---

## Complete Flow Example

### 1. Patient Initiates Payment
```
USSD: Select Mobile Payment
System: Creates transaction #123 (status: pending)
System: Calls Zenopay API
Zenopay: Sends push to +254712345678
```

### 2. Patient Completes Payment
```
Patient: Enters PIN on phone
Zenopay: Processes payment
Zenopay: Calls webhook
```

### 3. Webhook Processes
```
POST /api/payments/callback
{
  "transaction_id": 123,
  "status": "success"
}

System:
- Verifies signature ✓
- Updates transaction ✓
- Activates case ✓
- Sends SMS ✓
```

### 4. Patient Continues
```
Patient: Dials USSD again
System: Checks payment status
System: "Payment completed! Enter your symptoms:"
Patient: Enters symptoms
System: Assigns to doctor
```

---

## Benefits

### For Patients:
✅ Instant service activation
✅ SMS confirmation
✅ No manual approval needed
✅ Seamless experience

### For Doctors:
✅ Only see paid cases
✅ No payment collection hassle
✅ Focus on medical care

### For Business:
✅ Automated payment processing
✅ No manual intervention
✅ Reduced fraud
✅ Better cash flow
✅ Scalable system

---

## Summary

The payment webhook **automatically activates the service** after successful payment:

1. 💰 Patient pays via mobile money
2. 🔔 Zenopay calls webhook
3. ✅ System verifies and processes
4. 🚀 Service activated instantly
5. 📱 Patient receives SMS
6. 👨‍⚕️ Doctor sees active case

**No manual intervention required!** The entire flow is automated. 🎉

---

## Troubleshooting

### Webhook Not Called?
- Check Zenopay webhook configuration
- Verify server is publicly accessible
- Check firewall settings
- Test with ngrok

### Payment Not Activating?
- Check webhook logs
- Verify signature is correct
- Check transaction exists
- Verify case_id is linked

### SMS Not Sent?
- Check Africa's Talking credentials
- Verify phone number format
- Check SMS queue table
- Check API balance

---

## Next Steps

1. ✅ Configure Zenopay webhook URL
2. ✅ Make server publicly accessible
3. ✅ Test with sandbox payment
4. ✅ Monitor webhook logs
5. ✅ Deploy to production

The webhook is **ready to use** - just configure the URL in Zenopay! 🚀
