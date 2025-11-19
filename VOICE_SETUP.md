# 📞 Voice/IVR Setup Guide

Complete guide to setting up voice consultations in SmartHealth.

## Prerequisites

- SmartHealth system installed and running
- Twilio account (or Africa's Talking)
- Public domain or ngrok for webhooks
- SSL certificate (for production)

## Step 1: Install Dependencies

```bash
# Install Twilio SDK
npm install twilio

# Restart server
npm run dev
```

## Step 2: Create Twilio Account

### Sign Up

1. Go to https://www.twilio.com/try-twilio
2. Sign up for free account
3. Verify your email and phone
4. Complete account setup

### Get Credentials

1. Go to Twilio Console Dashboard
2. Find your **Account SID** and **Auth Token**
3. Copy these credentials

### Buy Phone Number

1. Go to **Phone Numbers** → **Buy a Number**
2. Select country (e.g., United States, Kenya)
3. Choose a number with **Voice** capability
4. Purchase the number ($1-2/month)

## Step 3: Configure Environment

### Update .env File

```env
# Add these lines to your .env file

# Twilio Voice API (Optional - if using Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Your public URL (for webhooks)
API_BASE_URL=https://your-domain.com
```

### Example Configuration

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
API_BASE_URL=https://smarthealth.example.com
```

## Step 4: Update Database

### Run Migration

```bash
# This adds voice_sessions and doctor_call_queue tables
npm run db:setup
```

### Verify Tables

```bash
mysql -u root -p
USE smarthealth;
SHOW TABLES;

# Should see:
# - voice_sessions
# - doctor_call_queue
```

## Step 5: Configure Webhooks

### For Local Development (ngrok)

1. **Install ngrok:**
```bash
npm install -g ngrok
```

2. **Start your server:**
```bash
npm run dev
```

3. **In another terminal, start ngrok:**
```bash
ngrok http 5000
```

4. **Copy the HTTPS URL:**
```
Forwarding: https://abc123.ngrok.io -> http://localhost:5000
```

5. **Update .env:**
```env
API_BASE_URL=https://abc123.ngrok.io
```

### For Production

Use your actual domain:
```env
API_BASE_URL=https://smarthealth.example.com
```

## Step 6: Configure Twilio Webhooks

### Set Voice Webhook

1. Go to Twilio Console
2. Navigate to **Phone Numbers** → **Manage** → **Active Numbers**
3. Click on your phone number
4. Scroll to **Voice & Fax** section
5. Under **A CALL COMES IN:**
   - Select: **Webhook**
   - URL: `https://your-domain.com/api/voice/incoming`
   - Method: **HTTP POST**
6. Click **Save**

### Example Configuration

```
A CALL COMES IN:
  Webhook: https://smarthealth.example.com/api/voice/incoming
  HTTP POST
```

## Step 7: Test the System

### Test 1: Make a Test Call

1. Call your Twilio number from your phone
2. You should hear: "Welcome to SmartHealth..."
3. Press 1, 2, or 3 to navigate menus
4. Follow the prompts

### Test 2: Test with cURL

```bash
# Test incoming call webhook
curl -X POST http://localhost:5000/api/voice/incoming \
  -d "CallSid=CAtest123" \
  -d "From=+254712345678" \
  -d "To=+1234567890"

# Should return TwiML XML
```

### Test 3: Test Doctor Dashboard

1. Login to doctor dashboard
2. Make a test call
3. Navigate to consultation request
4. Check if call appears in queue
5. Click "Accept Call"
6. Verify call bridges

## Step 8: Verify Integration

### Check Logs

```bash
# Backend logs should show:
✅ Voice webhook received
✅ User created/found
✅ Voice session created
✅ TwiML generated
```

### Check Database

```sql
-- Check voice sessions
SELECT * FROM voice_sessions ORDER BY created_at DESC LIMIT 5;

-- Check call queue
SELECT * FROM doctor_call_queue ORDER BY created_at DESC LIMIT 5;
```

### Check Twilio Console

1. Go to **Monitor** → **Logs** → **Calls**
2. Find your test call
3. Check status and duration
4. Review any errors

## Step 9: Production Deployment

### SSL Certificate

Voice webhooks require HTTPS. Get SSL certificate:

**Option 1: Let's Encrypt (Free)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d smarthealth.example.com
```

**Option 2: Cloudflare (Free)**
- Add domain to Cloudflare
- Enable SSL/TLS
- Use Cloudflare nameservers

### Update Twilio Webhooks

1. Update webhook URL to production domain
2. Test with real phone call
3. Monitor for errors

### Enable Call Recording (Optional)

In `backend/services/voice.service.js`, update:

```javascript
twiml.record({
  action: '/api/voice/process-symptoms',
  method: 'POST',
  maxLength: 60,
  finishOnKey: '#',
  transcribe: true,
  transcribeCallback: '/api/voice/transcription',
  recordingStatusCallback: '/api/voice/recording-status' // Add this
});
```

## Step 10: Monitor and Optimize

### Set Up Monitoring

1. **Twilio Alerts:**
   - Go to **Monitor** → **Alerts**
   - Enable alerts for errors
   - Set up email notifications

2. **Application Logs:**
```bash
# View logs
pm2 logs smarthealth-api

# Or with Docker
docker logs smarthealth-backend
```

3. **Database Monitoring:**
```sql
-- Monitor call volume
SELECT DATE(created_at) as date, COUNT(*) as calls
FROM voice_sessions
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Monitor doctor response times
SELECT doctor_id, 
       AVG(TIMESTAMPDIFF(SECOND, created_at, accepted_at)) as avg_response_time
FROM doctor_call_queue
WHERE status = 'accepted'
GROUP BY doctor_id;
```

### Cost Monitoring

1. Go to Twilio Console → **Usage**
2. Set up usage alerts
3. Monitor daily/monthly costs
4. Optimize call duration

## Troubleshooting

### Issue 1: Webhook Not Receiving Calls

**Symptoms:** Call connects but no IVR

**Solutions:**
```bash
# Check if server is running
curl http://localhost:5000/health

# Check ngrok is running
curl https://your-ngrok-url.ngrok.io/health

# Verify webhook URL in Twilio console
# Check Twilio debugger for errors
```

### Issue 2: TwiML Errors

**Symptoms:** "We're sorry, an application error has occurred"

**Solutions:**
```bash
# Check backend logs
pm2 logs smarthealth-api

# Test endpoint directly
curl -X POST http://localhost:5000/api/voice/incoming \
  -d "CallSid=test" -d "From=+1234567890" -d "To=+1234567890"

# Verify TwiML syntax
```

### Issue 3: Call Not Bridging

**Symptoms:** Patient hears hold music but never connects

**Solutions:**
```sql
-- Check call queue status
SELECT * FROM doctor_call_queue WHERE status = 'pending';

-- Check doctor status
SELECT id, name, status FROM doctors;

-- Verify doctor phone number
SELECT phone FROM doctors WHERE id = 1;
```

### Issue 4: Database Errors

**Symptoms:** 500 errors in logs

**Solutions:**
```bash
# Verify tables exist
mysql -u root -p smarthealth -e "SHOW TABLES;"

# Run migration again
npm run db:setup

# Check database connection
mysql -u root -p -e "SELECT 1;"
```

## Advanced Configuration

### Custom Hold Music

```javascript
// In voice.service.js
twiml.play({ loop: 10 }, 'https://your-domain.com/audio/hold-music.mp3');
```

### Multi-language Support

```javascript
// Detect user language
const language = user.language === 'sw' ? 'sw-KE' : 'en-US';

gather.say(
  'Welcome to SmartHealth',
  { voice: 'alice', language: language }
);
```

### Call Recording Storage

```javascript
// Save recording URL to database
await pool.query(
  'UPDATE cases SET recording_url = ? WHERE id = ?',
  [recordingUrl, caseId]
);
```

### Voicemail System

```javascript
// Add voicemail option
twiml.say('All doctors are busy. Press 1 to leave a voicemail.');
twiml.record({
  action: '/api/voice/voicemail',
  maxLength: 120
});
```

## Performance Optimization

### Reduce Latency

1. **Use CDN for audio files**
2. **Cache doctor list**
3. **Optimize database queries**
4. **Use connection pooling**

### Scale for High Volume

1. **Load balancing**
```nginx
upstream backend {
    server backend1:5000;
    server backend2:5000;
}
```

2. **Database replication**
3. **Redis for session storage**
4. **Queue system for notifications**

## Security Best Practices

### Validate Twilio Requests

```javascript
const twilio = require('twilio');

// Verify webhook signature
const validateRequest = (req, res, next) => {
  const signature = req.headers['x-twilio-signature'];
  const url = `${process.env.API_BASE_URL}${req.originalUrl}`;
  
  const valid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    signature,
    url,
    req.body
  );
  
  if (!valid) {
    return res.status(403).send('Forbidden');
  }
  
  next();
};
```

### Encrypt Recordings

```javascript
// Use AWS S3 with encryption
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ encryption: 'AES256' });
```

### Access Controls

```javascript
// Restrict recording access
router.get('/recordings/:id', authenticateDoctor, async (req, res) => {
  // Verify doctor has access to this case
  const case = await Case.findById(req.params.id);
  if (case.doctor_id !== req.doctor.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Return recording
});
```

## Cost Optimization

### Tips to Reduce Costs

1. **Optimize call duration**
   - Clear, concise IVR prompts
   - Efficient menu navigation
   - Quick doctor response

2. **Use local numbers**
   - Cheaper than toll-free
   - Better for specific regions

3. **Selective recording**
   - Only record when needed
   - Delete old recordings

4. **Batch notifications**
   - Group SMS notifications
   - Use webhooks efficiently

5. **Monitor usage**
   - Set up cost alerts
   - Review usage reports
   - Identify optimization opportunities

## Compliance

### HIPAA Compliance (US)

1. **Sign Twilio BAA**
2. **Enable encryption**
3. **Implement access controls**
4. **Audit logging**
5. **Data retention policies**

### GDPR Compliance (EU)

1. **User consent**
2. **Data minimization**
3. **Right to deletion**
4. **Data portability**
5. **Privacy policy**

## Support Resources

### Twilio Resources
- Documentation: https://www.twilio.com/docs/voice
- Support: https://support.twilio.com/
- Community: https://www.twilio.com/community
- Status: https://status.twilio.com/

### SmartHealth Resources
- Voice Documentation: `docs/VOICE_IVR.md`
- API Documentation: `docs/API.md`
- Testing Guide: `docs/TESTING.md`

## Quick Reference

### Important URLs

```
Incoming Call: /api/voice/incoming
Menu Selection: /api/voice/menu
Doctor Selection: /api/voice/select-doctor
Process Symptoms: /api/voice/process-symptoms
Wait for Doctor: /api/voice/wait-for-doctor
Call Completed: /api/voice/call-completed
```

### Test Commands

```bash
# Test incoming call
curl -X POST http://localhost:5000/api/voice/incoming \
  -d "CallSid=CAtest" -d "From=+1234567890" -d "To=+1234567890"

# Check call queue
curl http://localhost:5000/api/doctors/call-queue \
  -H "Authorization: Bearer YOUR_TOKEN"

# Accept call
curl -X POST http://localhost:5000/api/doctors/call-queue/1/accept \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Queries

```sql
-- Active voice sessions
SELECT * FROM voice_sessions WHERE status = 'active';

-- Pending calls
SELECT * FROM doctor_call_queue WHERE status = 'pending';

-- Call statistics
SELECT 
  COUNT(*) as total_calls,
  AVG(call_duration) as avg_duration,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
FROM doctor_call_queue;
```

## Checklist

### Pre-Launch

- [ ] Twilio account created
- [ ] Phone number purchased
- [ ] Environment variables configured
- [ ] Database tables created
- [ ] Webhooks configured
- [ ] SSL certificate installed
- [ ] Test calls successful
- [ ] Doctor dashboard tested
- [ ] Call bridging verified
- [ ] Monitoring setup
- [ ] Cost alerts configured
- [ ] Documentation reviewed

### Post-Launch

- [ ] Monitor call volume
- [ ] Track success rate
- [ ] Review doctor response times
- [ ] Analyze call quality
- [ ] Optimize costs
- [ ] Gather user feedback
- [ ] Update documentation
- [ ] Train support team

---

**Setup Time:** 30-60 minutes
**Difficulty:** Intermediate
**Cost:** ~$1-2/month + usage

**Ready to launch voice consultations!** 📞
