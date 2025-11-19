# 🚀 Quick Start Guide

Get SmartHealth up and running in 10 minutes!

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 16+ installed ([Download](https://nodejs.org/))
- [ ] MySQL 8+ installed and running
- [ ] Text editor (VS Code, Sublime, etc.)
- [ ] Terminal/Command Prompt access

## 5-Step Installation

### Step 1: Get the Code (1 minute)

```bash
# Download or clone the project
cd smarthealth
```

### Step 2: Install Dependencies (2 minutes)

**On Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**On Windows:**
```bash
setup.bat
```

**Or manually:**
```bash
npm install
cd frontend && npm install && cd ..
```

### Step 3: Configure Environment (2 minutes)

```bash
# Copy template
cp .env.example .env

# Edit with your settings
nano .env  # or use any text editor
```

**Minimum required settings:**
```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=any_random_string_here
```

### Step 4: Setup Database (2 minutes)

```bash
npm run db:setup
```

This creates the database and sample doctors.

### Step 5: Start Application (1 minute)

```bash
npm run dev
```

## ✅ Verify Installation

### 1. Check Backend
Open browser: http://localhost:5000
- Should see: `{"name":"SmartHealth Telemedicine API",...}`

### 2. Check Frontend
Open browser: http://localhost:3000
- Should see: Login page

### 3. Test Login
- Email: `john.kamau@smarthealth.com`
- Password: `doctor123`
- Should see: Doctor dashboard

## 🎯 First Tests

### Test USSD (in terminal)

```bash
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test&serviceCode=*123#&phoneNumber=+254712345678&text="
```

Should return the main menu.

### Test SMS

```bash
curl -X POST http://localhost:5000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"+254712345678","message":"Test"}'
```

### Test Doctor API

```bash
curl -X POST http://localhost:5000/api/doctors/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.kamau@smarthealth.com","password":"doctor123"}'
```

Should return a JWT token.

## 📱 Using the System

### As a Patient (USSD)

1. Dial `*123#` (in production with Africa's Talking)
2. Select option 1 for free trial
3. Enter symptoms
4. Wait for SMS response

### As a Patient (SMS)

Send SMS:
```
CONSULT I have fever and headache
```

### As a Doctor (Web)

1. Go to http://localhost:3000
2. Login with credentials
3. View patient queue
4. Click on a case
5. Enter response
6. Submit

## 🔧 Common Issues

### Port Already in Use

```bash
# Change port in .env
PORT=5001
```

### Database Connection Failed

```bash
# Check MySQL is running
# On Linux/Mac:
sudo systemctl status mysql

# On Windows: Check Services app
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📚 Next Steps

1. **Read Documentation**
   - [Full Installation Guide](INSTALLATION.md)
   - [API Documentation](docs/API.md)
   - [USSD Flow Guide](docs/USSD_FLOW.md)

2. **Configure External Services**
   - Get Africa's Talking API key
   - Setup Zenopay account
   - Configure webhooks

3. **Customize Settings**
   - Adjust trial duration
   - Set consultation fees
   - Configure offers

4. **Add More Doctors**
   ```sql
   INSERT INTO doctors (name, email, password_hash, specialization, fee)
   VALUES ('Dr. New Doctor', 'email@example.com', 'hashed_password', 'Specialty', 1000);
   ```

5. **Deploy to Production**
   - Follow [Deployment Guide](docs/DEPLOYMENT.md)
   - Setup SSL/HTTPS
   - Configure domain

## 🆘 Getting Help

### Check Logs

```bash
# Backend logs appear in terminal where you ran npm run dev
# Look for errors in red
```

### Test Database

```bash
mysql -u root -p
USE smarthealth;
SHOW TABLES;
SELECT * FROM doctors;
```

### Verify Environment

```bash
# Check Node version
node --version  # Should be 16+

# Check MySQL version
mysql --version  # Should be 8+

# Check if ports are free
# Linux/Mac:
lsof -i :5000
lsof -i :3000

# Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

## 🎓 Learning Resources

### Video Tutorials (Create Your Own)
1. Installation walkthrough
2. USSD flow demonstration
3. Doctor dashboard tour
4. Payment integration setup

### Documentation
- [README.md](README.md) - Project overview
- [FEATURES.md](FEATURES.md) - Complete feature list
- [INSTALLATION.md](INSTALLATION.md) - Detailed setup
- [docs/API.md](docs/API.md) - API reference
- [docs/TESTING.md](docs/TESTING.md) - Testing guide
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production deployment

## 💡 Pro Tips

1. **Use Postman** for API testing
2. **Keep logs open** while testing
3. **Test incrementally** - one feature at a time
4. **Backup database** before major changes
5. **Use version control** (Git)
6. **Read error messages** carefully
7. **Check documentation** first
8. **Test on real devices** when possible

## 🎉 Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Database created with tables
- [ ] Sample doctors inserted
- [ ] Can login to dashboard
- [ ] USSD endpoint responds
- [ ] SMS endpoint responds
- [ ] Can create and respond to cases

## 🚀 Production Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Configure real API keys
- [ ] Setup SSL/HTTPS
- [ ] Configure firewall
- [ ] Setup backups
- [ ] Configure monitoring
- [ ] Test all features
- [ ] Setup error tracking
- [ ] Configure webhooks
- [ ] Test payment flow
- [ ] Load test the system

## 📞 Support

If you're stuck:

1. Check [INSTALLATION.md](INSTALLATION.md) troubleshooting section
2. Review error logs
3. Verify all environment variables
4. Test each component separately
5. Check database connectivity
6. Verify API credentials

## 🎯 Quick Commands Reference

```bash
# Start development
npm run dev

# Setup database
npm run db:setup

# Start backend only
npm start

# Start frontend only
cd frontend && npm start

# Install dependencies
npm install

# Check health
curl http://localhost:5000/health

# Test USSD
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test&serviceCode=*123#&phoneNumber=+254712345678&text="
```

## 🌟 What's Next?

After getting it running:

1. **Explore the Dashboard**
   - Try all filters
   - Respond to cases
   - Change status
   - View statistics

2. **Test USSD Flows**
   - Trial consultation
   - Paid consultation
   - History
   - Language change

3. **Test SMS Commands**
   - CONSULT
   - DOCTORS
   - SELECT
   - HISTORY
   - HELP

4. **Customize**
   - Add more doctors
   - Adjust fees
   - Change trial duration
   - Modify offers

5. **Deploy**
   - Choose hosting platform
   - Configure domain
   - Setup SSL
   - Go live!

---

**Estimated Time to First Working System:** 10 minutes
**Estimated Time to Production:** 1-2 hours
**Difficulty Level:** Beginner-friendly

Good luck! 🚀
