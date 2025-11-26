# SmartHealth Installation Guide

Complete step-by-step installation guide for the SmartHealth Telemedicine System.

## System Requirements

### Minimum Requirements
- Node.js 16.x or higher
- MySQL 8.0 or higher
- 2GB RAM
- 10GB disk space
- Ubuntu 20.04+ / Windows 10+ / macOS 10.15+

### Recommended Requirements
- Node.js 18.x
- MySQL 8.0
- 4GB RAM
- 20GB disk space
- Ubuntu 22.04 LTS

## Step 1: Install Prerequisites

### On Ubuntu/Debian

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x

# Install MySQL
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

### On Windows

1. Download and install Node.js from https://nodejs.org/
2. Download and install MySQL from https://dev.mysql.com/downloads/installer/
3. During MySQL installation:
   - Choose "Developer Default"
   - Set root password
   - Configure MySQL as Windows Service

### On macOS

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install MySQL
brew install mysql

# Start MySQL
brew services start mysql

# Secure MySQL
mysql_secure_installation
```

## Step 2: Clone or Download Project

```bash
# If using Git
git clone <repository-url>
cd smarthealth

# Or download and extract ZIP file
# Then navigate to the extracted folder
```

## Step 3: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

This will install all required packages including:
- Express (backend framework)
- React (frontend framework)
- MySQL2 (database driver)
- JWT (authentication)
- Axios (HTTP client)
- And many more...

## Step 4: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration (use your preferred editor)
nano .env
# or
code .env
# or
notepad .env  # On Windows
```

### Required Configuration

Edit `.env` file with your settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smarthealth

# JWT Secret (generate a random string)
JWT_SECRET=your_random_secret_key_here

# Africa's Talking API
AT_API_KEY=your_africas_talking_api_key
AT_USERNAME=your_africas_talking_username
AT_USSD_CODE=*123#
AT_SENDER_ID=SmartHealth

# Zenopay API
ZENOPAY_API_KEY=your_zenopay_api_key
ZENOPAY_MERCHANT_ID=your_zenopay_merchant_id
ZENOPAY_SECRET=your_zenopay_secret
ZENOPAY_CALLBACK_URL=http://localhost:5000/api/payments/callback

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Getting API Credentials

#### Africa's Talking
1. Sign up at https://africastalking.com/
2. Go to Dashboard → Settings → API Key
3. Copy your API Key and Username
4. For USSD: Go to USSD → Create Channel

#### Zenopay
1. Sign up at https://zenopay.com/ (or your payment provider)
2. Get API credentials from dashboard
3. Configure webhook URL

## Step 5: Setup Database

```bash
# Run database setup script
npm run db:setup
```

This script will:
1. Create the `smarthealth` database
2. Create all required tables
3. Insert sample doctors for testing

### Sample Doctors Created

| Name | Email | Password | Specialization | Fee |
|------|-------|----------|----------------|-----|
| Dr. John Kamau | john.kamau@smarthealth.com | doctor123 | General Practitioner | TZS 500 |
| Dr. Mary Wanjiku | mary.wanjiku@smarthealth.com | doctor123 | Pediatrician | TZS 800 |
| Dr. James Omondi | james.omondi@smarthealth.com | doctor123 | Dermatologist | TZS 1000 |

### Manual Database Setup (if script fails)

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE smarthealth;
USE smarthealth;

# Run schema file
source database/schema.sql;

# Exit MySQL
exit;
```

## Step 6: Start the Application

### Development Mode (Both Backend and Frontend)

```bash
# Start both servers concurrently
npm run dev
```

This will start:
- Backend API on http://localhost:5000
- Frontend Dashboard on http://localhost:3000

### Start Separately

```bash
# Terminal 1: Start backend
npm start

# Terminal 2: Start frontend
cd frontend
npm start
```

## Step 7: Verify Installation

### Check Backend

Open browser and visit:
- http://localhost:5000 - Should show API info
- http://localhost:5000/health - Should show health status

### Check Frontend

Open browser and visit:
- http://localhost:3000 - Should show login page

### Test Doctor Login

1. Go to http://localhost:3000
2. Login with:
   - Email: `john.kamau@smarthealth.com`
   - Password: `doctor123`
3. You should see the doctor dashboard

## Step 8: Test USSD (Optional)

### Using cURL

```bash
# Test USSD main menu
curl -X POST http://localhost:5000/api/ussd \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "sessionId=test123&serviceCode=*123#&phoneNumber=+254712345678&text="
```

Expected response:
```
CON Welcome to SmartHealth
1. Free Trial Consultation
2. Pay-per-Consultation
3. Consultation History
4. Change Language
```

### Using Postman

1. Create new POST request
2. URL: `http://localhost:5000/api/ussd`
3. Body (x-www-form-urlencoded):
   - sessionId: `test123`
   - serviceCode: `*123#`
   - phoneNumber: `+254712345678`
   - text: `` (empty for main menu)

## Step 9: Test SMS (Optional)

```bash
# Test SMS sending
curl -X POST http://localhost:5000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254712345678",
    "message": "Test message from SmartHealth"
  }'
```

## Troubleshooting

### Database Connection Error

**Error:** `ER_ACCESS_DENIED_ERROR: Access denied for user`

**Solution:**
```bash
# Reset MySQL root password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
exit;
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
# On Linux/Mac:
lsof -i :5000
kill -9 <PID>

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env file
PORT=5001
```

### Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### MySQL Service Not Running

**Error:** `ECONNREFUSED 127.0.0.1:3306`

**Solution:**
```bash
# On Linux:
sudo systemctl start mysql

# On macOS:
brew services start mysql

# On Windows:
# Start MySQL service from Services app
```

### Frontend Build Errors

**Error:** Various React build errors

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## Next Steps

1. **Configure Webhooks** - Set up Africa's Talking webhooks for production
2. **Customize Settings** - Adjust trial duration, fees, offers in `.env`
3. **Add More Doctors** - Insert additional doctors via MySQL
4. **Test All Features** - Try USSD, SMS, payments, doctor dashboard
5. **Deploy to Production** - Follow [DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Getting Help

- Check [API Documentation](docs/API.md)
- Review [USSD Flow](docs/USSD_FLOW.md)
- Read [Deployment Guide](docs/DEPLOYMENT.md)

## Quick Reference

### Start Application
```bash
npm run dev
```

### Stop Application
```
Ctrl + C (in terminal)
```

### Reset Database
```bash
npm run db:setup
```

### View Logs
```bash
# Backend logs appear in terminal
# Check for errors and warnings
```

### Access Points
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000
- Health Check: http://localhost:5000/health

## Security Notes

⚠️ **Important for Production:**

1. Change default passwords
2. Use strong JWT_SECRET
3. Enable HTTPS/SSL
4. Restrict database access
5. Use environment-specific configs
6. Enable rate limiting
7. Regular security updates

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review documentation in `docs/` folder
3. Check application logs for errors
4. Verify all environment variables are set correctly
