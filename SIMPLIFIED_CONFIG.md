# 🎯 Simplified Configuration Guide

## Africa's Talking - One API Key for Everything!

Good news! You only need **ONE set of credentials** from Africa's Talking for all services.

## Required Credentials

### From Africa's Talking Dashboard

1. **API Key** - Get from Settings → API Key
2. **Username** - Shown in your dashboard (e.g., "sandbox" or your company name)

**That's it!** These same credentials work for:
- ✅ USSD
- ✅ SMS
- ✅ Voice

## Complete .env Configuration

```env
# ============================================
# AFRICA'S TALKING (One API Key for All)
# ============================================
AT_API_KEY=your_api_key_here
AT_USERNAME=your_username_here

# USSD Configuration
AT_USSD_CODE=*123#

# SMS Configuration (Two-way with Shortcode)
AT_SMS_SHORTCODE=12345
AT_SMS_KEYWORD=HEALTH

# Voice Configuration
AT_VOICE_PHONE_NUMBER=+254XXXXXXXXX

# ============================================
# OTHER SETTINGS
# ============================================

# Voice Provider (use africastalking)
VOICE_PROVIDER=africastalking

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smarthealth

# JWT Secret
JWT_SECRET=your_random_secret_key

# Zenopay
ZENOPAY_API_KEY=your_zenopay_api_key
ZENOPAY_MERCHANT_ID=your_zenopay_merchant_id
ZENOPAY_SECRET=your_zenopay_secret

# Server
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## What You Need to Get

### 1. From Africa's Talking (https://africastalking.com)

| Item | Where to Get | Used For | Cost |
|------|--------------|----------|------|
| **API Key** | Settings → API Key | All services | Free |
| **Username** | Dashboard (auto-assigned) | All services | Free |
| **USSD Code** | USSD → Request Channel | USSD menu | ~KES 3,000/month |
| **SMS Shortcode** | SMS → Request Shortcode | Two-way SMS | ~KES 5,000/month |
| **Voice Number** | Voice → Buy Number | Voice calls | ~KES 1,000/month |

### 2. From Zenopay (or your payment provider)

| Item | Where to Get |
|------|--------------|
| API Key | Dashboard → API Settings |
| Merchant ID | Dashboard → Account |
| Secret | Dashboard → API Settings |

### 3. Generate Yourself

| Item | How to Generate |
|------|-----------------|
| JWT Secret | Any random string (e.g., use: `openssl rand -base64 32`) |

## Quick Setup Steps

### Step 1: Get Africa's Talking Credentials (5 minutes)

```bash
1. Sign up at https://africastalking.com
2. Go to Settings → API Key
3. Copy your API Key
4. Note your Username (shown in dashboard)
```

### Step 2: Request Services (1-5 days approval)

```bash
1. USSD: Go to USSD → Request Channel → Apply for *123#
2. SMS: Go to SMS → Request Shortcode → Apply for 12345
3. Voice: Go to Voice → Buy Number → Purchase +254XXXXXXXXX
```

### Step 3: Configure .env (2 minutes)

```bash
# Copy template
cp .env.example .env

# Edit with your credentials
nano .env

# Add:
AT_API_KEY=your_actual_api_key
AT_USERNAME=your_actual_username
AT_USSD_CODE=*123#
AT_SMS_SHORTCODE=12345
AT_VOICE_PHONE_NUMBER=+254XXXXXXXXX
```

### Step 4: Setup Database (2 minutes)

```bash
npm run db:setup
```

### Step 5: Start Server (1 minute)

```bash
npm run dev
```

## Common Mistakes to Avoid

### ❌ Wrong: Using Different Credentials

```env
# DON'T DO THIS:
AT_API_KEY=key_for_ussd
AT_SMS_API_KEY=different_key_for_sms
AT_VOICE_API_KEY=another_key_for_voice
```

### ✅ Correct: One Set of Credentials

```env
# DO THIS:
AT_API_KEY=your_api_key
AT_USERNAME=your_username
# This works for USSD, SMS, and Voice!
```

## Testing Your Configuration

### Test 1: Check Credentials

```bash
# All these should use the same AT_API_KEY and AT_USERNAME
echo $AT_API_KEY
echo $AT_USERNAME
```

### Test 2: Test USSD

```bash
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text="
```

### Test 3: Test SMS

```bash
curl -X POST http://localhost:5000/api/sms/incoming \
  -d "from=+254712345678" \
  -d "to=12345" \
  -d "text=HEALTH CONSULT I have fever"
```

### Test 4: Test Voice

```bash
curl -X POST http://localhost:5000/api/voice/incoming \
  -d "sessionId=voice123" \
  -d "phoneNumber=+254712345678" \
  -d "isActive=1"
```

## Troubleshooting

### Issue: "Invalid API Key"

**Solution:** Make sure you're using the correct API key from Africa's Talking dashboard.

```bash
# Check your .env file
cat .env | grep AT_API_KEY

# Should show: AT_API_KEY=your_actual_key
```

### Issue: "Username not found"

**Solution:** Use the exact username from your Africa's Talking dashboard.

```bash
# Check your username
cat .env | grep AT_USERNAME

# Should match your dashboard username exactly
```

### Issue: "Service not configured"

**Solution:** Make sure you've requested and been approved for the service (USSD/SMS/Voice).

## Configuration Checklist

- [ ] Africa's Talking account created
- [ ] API Key copied from dashboard
- [ ] Username noted from dashboard
- [ ] USSD code requested (if using USSD)
- [ ] SMS shortcode requested (if using SMS)
- [ ] Voice number purchased (if using Voice)
- [ ] .env file created and configured
- [ ] Database setup completed
- [ ] Server starts without errors
- [ ] All tests pass

## Summary

**Key Point:** You only need **ONE API Key** and **ONE Username** from Africa's Talking for all services!

```
AT_API_KEY + AT_USERNAME = Works for USSD + SMS + Voice ✅
```

No need for:
- ❌ AT_VOICE_API_KEY
- ❌ AT_VOICE_USERNAME
- ❌ AT_SMS_API_KEY
- ❌ AT_USSD_API_KEY

Just use the same credentials everywhere! 🎉

---

**Configuration Time:** 10 minutes (plus approval time for services)
**Difficulty:** Easy
**Cost:** ~KES 9,000/month for all services

**Ready to configure!** 🚀




git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Mr-mpange/smart-mobile-hospital.git
git push -u origin main