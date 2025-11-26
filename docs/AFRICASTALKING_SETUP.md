# Africa's Talking Setup Guide

Complete guide for setting up USSD, SMS (two-way with shortcode), and Voice using Africa's Talking.

## Overview

SmartHealth uses Africa's Talking for:
1. **USSD** - Interactive menus (*123#)
2. **SMS** - Two-way messaging with shortcode
3. **Voice** - IVR and live doctor calls

## Prerequisites

- Africa's Talking account
- Verified phone number
- Business/organization details
- Domain with SSL certificate

## Step 1: Create Africa's Talking Account

### Sign Up

1. Go to https://africastalking.com/
2. Click "Sign Up"
3. Fill in your details:
   - Full name
   - Email address
   - Phone number
   - Country
4. Verify your email
5. Verify your phone number

### Complete Profile

1. Login to dashboard
2. Go to Settings → Profile
3. Complete business information:
   - Company name
   - Business type
   - Address
   - Tax ID (if applicable)

## Step 2: Get API Credentials

### API Key

1. Go to Settings → API Key
2. Click "Generate API Key"
3. Copy and save your API key securely
4. **Never share this key publicly**
5. **This same API key is used for USSD, SMS, and Voice**

### Username

1. Your username is displayed in the dashboard
2. Usually in format: `sandbox` (test) or your company name (production)
3. **This same username is used for all Africa's Talking services**

## Step 3: Setup SMS (Two-Way with Shortcode)

### Request Shortcode

1. Go to SMS → Shortcodes
2. Click "Request Shortcode"
3. Fill in application:
   - Desired shortcode (e.g., 12345)
   - Purpose: Healthcare/Telemedicine
   - Expected volume
   - Use case description
4. Submit application
5. Wait for approval (1-5 business days)

### Configure Shortcode

Once approved:

1. Go to SMS → Shortcodes
2. Click on your shortcode
3. Configure settings:
   - **Keyword:** HEALTH (or your choice)
   - **Callback URL:** `https://your-domain.com/api/sms/incoming`
   - **Method:** POST
4. Save configuration

### Test Two-Way SMS

```
Send SMS to: 12345
Message: HEALTH CONSULT I have fever
```

System should respond automatically.

## Step 4: Setup USSD

### Request USSD Code

1. Go to USSD → Channels
2. Click "Create Channel"
3. Fill in details:
   - **USSD Code:** *123# (or available code)
   - **Purpose:** Healthcare consultation
   - **Description:** Telemedicine platform
4. Submit request
5. Wait for approval (1-5 business days)

### Configure USSD

Once approved:

1. Go to USSD → Channels
2. Click on your USSD code
3. Configure callback:
   - **Callback URL:** `https://your-domain.com/api/ussd`
   - **Method:** POST
4. Save configuration

### Test USSD

```
Dial: *123#
```

Should show SmartHealth menu.

## Step 5: Setup Voice

### Request Voice Number

1. Go to Voice → Phone Numbers
2. Click "Get Number"
3. Select country and number type
4. Choose a number
5. Complete purchase

### Configure Voice Callbacks

1. Go to Voice → Phone Numbers
2. Click on your number
3. Configure callbacks:
   - **Voice URL:** `https://your-domain.com/api/voice/incoming`
   - **Method:** POST
   - **Status Callback:** `https://your-domain.com/api/voice/call-status`
4. Save configuration

### Test Voice

```
Call: +254XXXXXXXXX (your voice number)
```

Should hear SmartHealth IVR menu.

## Step 6: Configure Environment

### Update .env File

```env
# Africa's Talking API
AT_API_KEY=your_api_key_here
AT_USERNAME=your_username_here
AT_USSD_CODE=*123#

# SMS (Two-way with Shortcode)
AT_SMS_SHORTCODE=12345
AT_SMS_KEYWORD=HEALTH

# Voice
AT_VOICE_USERNAME=your_username_here
AT_VOICE_API_KEY=your_api_key_here
AT_VOICE_PHONE_NUMBER=+254XXXXXXXXX

# Voice Provider
VOICE_PROVIDER=africastalking

# API Base URL
API_BASE_URL=https://your-domain.com
```

## Step 7: Verify Setup

### Test USSD

```bash
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text="
```

### Test SMS

```bash
curl -X POST http://localhost:5000/api/sms/incoming \
  -d "from=+254712345678" \
  -d "to=12345" \
  -d "text=HEALTH CONSULT I have fever" \
  -d "date=2024-01-15 10:30:00" \
  -d "id=msg_123"
```

### Test Voice

```bash
curl -X POST http://localhost:5000/api/voice/incoming \
  -d "sessionId=voice123" \
  -d "phoneNumber=+254712345678" \
  -d "isActive=1"
```

## Africa's Talking API Endpoints

### SMS API

```
POST https://api.africastalking.com/version1/messaging
Headers:
  apiKey: YOUR_API_KEY
  Content-Type: application/x-www-form-urlencoded
Body:
  username: YOUR_USERNAME
  to: +254712345678
  message: Your message
  from: 12345 (shortcode)
```

### Voice API

```
POST https://voice.africastalking.com/call
Headers:
  apiKey: YOUR_API_KEY
  Content-Type: application/json
Body:
  {
    "username": "YOUR_USERNAME",
    "to": "+254712345678",
    "from": "+254XXXXXXXXX",
    "callbackUrl": "https://your-domain.com/api/voice/callback"
  }
```

## Webhook Formats

### USSD Webhook

Africa's Talking sends:
```
POST /api/ussd
Body:
  sessionId: ATUid_xxxxx
  serviceCode: *123#
  phoneNumber: +254712345678
  text: 1*2 (user input)
```

Response format:
```
CON Welcome message (continue)
or
END Final message (end session)
```

### SMS Webhook

Africa's Talking sends:
```
POST /api/sms/incoming
Body:
  from: +254712345678
  to: 12345
  text: HEALTH CONSULT symptoms
  date: 2024-01-15 10:30:00
  id: msg_xxxxx
  linkId: link_xxxxx
```

### Voice Webhook

Africa's Talking sends:
```
POST /api/voice/incoming
Body:
  sessionId: voice_xxxxx
  phoneNumber: +254712345678
  isActive: 1 (1=active, 0=ended)
  direction: inbound
  callSessionState: active
```

Response format (XML):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Welcome message</Say>
  <GetDigits timeout="30" finishOnKey="#">
    <Say>Press 1 for option 1</Say>
  </GetDigits>
</Response>
```

## Voice XML Elements

### Say
```xml
<Say voice="man" playBeep="false">
  Text to speak
</Say>
```

### GetDigits
```xml
<GetDigits timeout="30" finishOnKey="#" 
           callbackUrl="https://your-domain.com/callback">
  <Say>Enter your choice</Say>
</GetDigits>
```

### Record
```xml
<Record finishOnKey="#" maxLength="60" trimSilence="true"
        callbackUrl="https://your-domain.com/recording">
  <Say>Record your message after the beep</Say>
</Record>
```

### Dial
```xml
<Dial phoneNumbers="+254712345678" record="true" sequential="true"
      callbackUrl="https://your-domain.com/completed">
</Dial>
```

### Play
```xml
<Play url="https://example.com/audio.mp3"/>
```

### Redirect
```xml
<Redirect>https://your-domain.com/next-step</Redirect>
```

## Pricing (Kenya)

### SMS
- **Outgoing:** TZS 16 per SMS
- **Incoming (Shortcode):** Free
- **Shortcode rental:** TZS 100,000/month

### USSD
- **Per session:** KES 0.50 - 1.00
- **USSD code rental:** KES 3,000/month

### Voice
- **Incoming calls:** KES 2.00/minute
- **Outgoing calls:** KES 3.00/minute
- **Phone number:** KES 1,000/month

### Example Monthly Costs

For 1000 consultations/month:
- USSD sessions: KES 1,000
- SMS (2 per consultation): KES 1,600
- Voice calls (10 min avg): KES 20,000
- Rentals: KES 9,000
- **Total:** ~KES 31,600/month (~$240)

## Testing

### Sandbox Mode

Africa's Talking provides sandbox for testing:

1. Use sandbox credentials
2. Test with registered numbers only
3. No charges in sandbox
4. Limited to 100 requests/day

### Production Mode

1. Upgrade to production
2. Add credit to account
3. Verify business details
4. Test with real numbers

## Troubleshooting

### USSD Not Working

1. Check callback URL is publicly accessible
2. Verify USSD code is approved
3. Check response format (CON/END)
4. Review Africa's Talking logs

### SMS Not Receiving

1. Verify shortcode is active
2. Check callback URL
3. Ensure keyword matches
4. Review delivery reports

### Voice Issues

1. Check voice number is active
2. Verify callback URL
3. Test XML response format
4. Check call logs in dashboard

## Best Practices

### USSD
- Keep menus simple (max 5 options)
- Use clear, concise language
- Handle session timeouts
- Provide back/cancel options

### SMS
- Use shortcode for two-way
- Keep messages under 160 characters
- Include opt-out instructions
- Handle delivery failures

### Voice
- Use clear voice prompts
- Provide timeout handling
- Offer keypad alternatives
- Record important calls

## Support

### Africa's Talking Support
- Email: support@africastalking.com
- Phone: +254 20 5000 953
- Docs: https://developers.africastalking.com/
- Community: https://help.africastalking.com/

### SmartHealth Support
- See INSTALLATION.md
- See VOICE_SETUP.md
- See docs/API.md

## Compliance

### Kenya Regulations
- Register with CA (Communications Authority)
- Comply with data protection laws
- Follow healthcare regulations
- Maintain call/SMS records

### Data Privacy
- Encrypt sensitive data
- Secure API keys
- Implement access controls
- Regular security audits

---

**Setup Time:** 1-2 hours (plus approval time)
**Approval Time:** 1-5 business days
**Difficulty:** Intermediate

**Ready to launch with Africa's Talking!** 🚀
