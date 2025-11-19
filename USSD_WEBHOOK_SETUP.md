# 🔧 USSD Webhook Setup - Fix 404 Error

## Problem

Africa's Talking shows:
```
Error Message: Received unexpected response code: 404 Not Found
App Response: {"error":"Route not found"}
Status: Failed
```

But Postman returns 200 OK when testing locally.

## Root Cause

**Your server is running on `localhost:5000`** which is only accessible from your computer. Africa's Talking servers can't reach `localhost` - they need a **public URL**.

## Solution Options

### Option 1: Use ngrok (Quick Testing) ⚡ RECOMMENDED

ngrok creates a public URL that tunnels to your localhost.

#### Step 1: Install ngrok

**Download:**
- Go to https://ngrok.com/download
- Download for Windows
- Extract `ngrok.exe` to a folder

**Or install via npm:**
```cmd
npm install -g ngrok
```

#### Step 2: Start Your Server

```cmd
npm start
```

Server should be running on http://localhost:5000

#### Step 3: Start ngrok

Open a **new Command Prompt** window:

```cmd
ngrok http 5000
```

You'll see:
```
ngrok

Session Status                online
Account                       your_account
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

#### Step 4: Copy Your Public URL

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

#### Step 5: Update Africa's Talking

1. Go to https://account.africastalking.com/apps/sandbox/ussd/createchannel
2. Find your USSD code: `*384*34153#`
3. Update the **Callback URL** to:
   ```
   https://abc123.ngrok-free.app/api/ussd
   ```
4. Click **Save**

#### Step 6: Test

Dial `*384*34153#` from your phone

You should now see the USSD menu!

#### Step 7: Monitor Requests

Open http://127.0.0.1:4040 in your browser to see all incoming requests in real-time.

---

### Option 2: Deploy to Cloud (Production) 🚀

For production, deploy to a cloud service:

#### A. Heroku (Free Tier Available)

```cmd
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create smarthealth-api

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set AT_API_KEY=your_key
heroku config:set AT_USERNAME=sandbox

# Deploy
git push heroku main

# Get your URL
heroku info
```

Your URL will be: `https://smarthealth-api.herokuapp.com`

Update Africa's Talking callback to:
```
https://smarthealth-api.herokuapp.com/api/ussd
```

#### B. DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Click **Create App**
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `npm install`
   - **Run Command:** `npm start`
   - **HTTP Port:** `5000`
5. Add environment variables from your `.env`
6. Deploy

Your URL will be: `https://smarthealth-api.ondigitalocean.app`

#### C. Railway

1. Go to https://railway.app
2. Click **New Project**
3. Select **Deploy from GitHub**
4. Choose your repo
5. Add environment variables
6. Deploy

Your URL will be: `https://smarthealth-api.railway.app`

---

### Option 3: Use Your Own Server

If you have a VPS or dedicated server:

#### Requirements:
- Public IP address
- Domain name (optional but recommended)
- SSL certificate (required for production)

#### Setup:

1. **Install Node.js on server**
2. **Clone your repo**
3. **Install dependencies**
4. **Configure environment**
5. **Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name smarthealth
   pm2 startup
   pm2 save
   ```
6. **Setup Nginx reverse proxy**
7. **Get SSL certificate (Let's Encrypt)**

Your URL will be: `https://yourdomain.com`

---

## Quick Test Script

Create `test-webhook.cmd`:

```cmd
@echo off
echo Testing USSD Webhook...
echo.

REM Test with curl
curl -X POST http://localhost:5000/api/ussd ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "sessionId=test123" ^
  -d "serviceCode=*384*34153#" ^
  -d "phoneNumber=+254712345678" ^
  -d "text="

echo.
echo.
echo If you see USSD menu above, your endpoint works!
echo.
echo Now expose it with ngrok:
echo   ngrok http 5000
echo.
pause
```

Run it:
```cmd
test-webhook.cmd
```

---

## Troubleshooting

### ngrok: command not found

**Install ngrok:**
```cmd
npm install -g ngrok
```

Or download from https://ngrok.com/download

### ngrok session expired

Free ngrok URLs expire after 2 hours. Restart ngrok:
```cmd
ngrok http 5000
```

You'll get a new URL - update it in Africa's Talking.

**Solution:** Sign up for free ngrok account for longer sessions.

### Still getting 404

**Check your endpoint:**
```cmd
curl https://your-ngrok-url.ngrok-free.app/api/ussd
```

Should return: `Cannot GET /api/ussd` (because it's POST only)

**Test POST:**
```cmd
curl -X POST https://your-ngrok-url.ngrok-free.app/api/ussd ^
  -d "sessionId=test" ^
  -d "phoneNumber=+254712345678"
```

Should return USSD menu.

### CORS errors

Your server already has CORS configured, but if you get errors:

Edit `backend/server.js`:
```javascript
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));
```

### Rate limiting blocking requests

Temporarily disable for testing:

Edit `backend/server.js`:
```javascript
// Comment out rate limiter
// app.use('/api/', limiter);
```

---

## Africa's Talking Configuration

### Sandbox USSD Setup

1. Go to https://account.africastalking.com/apps/sandbox
2. Click **USSD** → **Create Channel**
3. Fill in:
   - **USSD Code:** `*384*34153#` (your code)
   - **Callback URL:** `https://your-ngrok-url.ngrok-free.app/api/ussd`
   - **Description:** SmartHealth Telemedicine
4. Click **Create**

### Live USSD Setup (Production)

1. Go to https://account.africastalking.com/apps/production
2. Purchase USSD code
3. Configure callback URL with your production domain
4. Test thoroughly before going live

---

## Verification Checklist

- [ ] Server running on localhost:5000
- [ ] Can test endpoint with Postman locally
- [ ] ngrok installed and running
- [ ] Public URL obtained from ngrok
- [ ] Africa's Talking callback URL updated
- [ ] Test USSD code from phone
- [ ] Monitor requests in ngrok dashboard
- [ ] USSD menu appears correctly

---

## Expected Flow

### 1. User Dials USSD Code
```
User dials: *384*34153#
```

### 2. Africa's Talking Calls Your Webhook
```
POST https://your-url.ngrok-free.app/api/ussd
Body:
  sessionId: ATUid_xxx
  serviceCode: *384*34153#
  phoneNumber: +254712345678
  text: (empty on first request)
```

### 3. Your Server Responds
```
CON Welcome to SmartHealth
1. New Consultation
2. Check Status
3. My Account
```

### 4. User Selects Option
```
User presses: 1
```

### 5. Africa's Talking Calls Again
```
POST https://your-url.ngrok-free.app/api/ussd
Body:
  sessionId: ATUid_xxx (same)
  serviceCode: *384*34153#
  phoneNumber: +254712345678
  text: 1
```

### 6. Your Server Responds
```
CON Describe your symptoms:
(Reply via SMS to 34059)
```

And so on...

---

## Current vs Required Setup

### ❌ Current (Not Working)
```
Africa's Talking → http://localhost:5000/api/ussd
                   ↑
                   Can't reach localhost!
```

### ✅ Required (Working)
```
Africa's Talking → https://abc123.ngrok-free.app/api/ussd
                   ↓
                   ngrok tunnel
                   ↓
                   http://localhost:5000/api/ussd
                   ↓
                   Your Server ✓
```

---

## Quick Start Commands

```cmd
REM Terminal 1: Start your server
npm start

REM Terminal 2: Start ngrok
ngrok http 5000

REM Copy the HTTPS URL from ngrok
REM Update Africa's Talking callback URL
REM Test by dialing *384*34153#
```

---

## Production Checklist

Before going live:

- [ ] Deploy to cloud service (not localhost)
- [ ] Use production Africa's Talking account
- [ ] Configure proper domain with SSL
- [ ] Set up monitoring and logging
- [ ] Test all USSD flows
- [ ] Set up error alerting
- [ ] Configure backup/failover
- [ ] Document all endpoints
- [ ] Set up rate limiting properly
- [ ] Enable security headers

---

## Summary

**Problem:** Africa's Talking can't reach `localhost`

**Solution:** Use ngrok to create public URL

**Steps:**
1. Start server: `npm start`
2. Start ngrok: `ngrok http 5000`
3. Copy ngrok URL
4. Update Africa's Talking callback
5. Test USSD code

**For Production:** Deploy to Heroku, DigitalOcean, Railway, or your own server

---

**Need help?** Check the ngrok dashboard at http://127.0.0.1:4040 to see all incoming requests and debug issues.
