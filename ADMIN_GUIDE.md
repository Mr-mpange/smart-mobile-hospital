# 👨‍💼 Admin System Guide

## Overview

The SmartHealth admin system allows administrators to manage doctors, users, and monitor all system activities.

## 🔑 Default Admin Credentials

```
Email: admin@smarthealth.com
Password: admin123
```

**⚠️ IMPORTANT:** Change the default password immediately after first login in production!

## 🚀 Quick Start

### 1. Start the Application

```bash
npm run dev
```

### 2. Access Admin Panel

Open your browser and go to:
```
http://localhost:3000/admin/login
```

### 3. Login

Use the default credentials above to login.

## 📊 Admin Dashboard Features

### Overview Tab
- Total doctors count
- Total users count
- Total cases
- Pending cases
- Completed cases
- Revenue statistics

### Doctors Management
- View all doctors
- Add new doctors
- Update doctor information
- Deactivate doctors
- Monitor doctor status (online/offline/busy)
- Track consultations per doctor

### Users Management
- View all registered users
- Monitor user trial status
- Check user balances
- Track consultation history

### Cases Management
- View all consultations
- Filter by status
- Filter by doctor
- Assign cases to doctors
- Monitor case progress

## 👨‍⚕️ Adding a New Doctor

### Via Admin Dashboard

1. Login to admin panel
2. Click "Doctors" tab
3. Click "+ Add Doctor" button
4. Fill in the form:
   - Full Name
   - Phone (format: +254712345678)
   - Email
   - Password
   - Specialization
   - Consultation Fee (TZS)
5. Click "Add Doctor"

### Via API

```bash
curl -X POST http://localhost:5000/api/admin/doctors \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Doe",
    "phone": "+254712345678",
    "email": "jane.doe@smarthealth.com",
    "password": "doctor123",
    "specialization": "Cardiologist",
    "fee": 1500
  }'
```

## 🔗 Connecting USSD/2G with Doctor Dashboard

### How It Works

1. **Patient Dials USSD** (`*384*34153#`)
2. **System Creates Case** in database
3. **Case Appears in Doctor Dashboard** automatically
4. **Doctor Responds** via web dashboard
5. **Patient Receives SMS** with doctor's response

### Real-Time Flow

```
Patient (USSD)
    ↓
Creates Case
    ↓
Database
    ↓
Doctor Dashboard (Auto-refresh)
    ↓
Doctor Responds
    ↓
SMS to Patient
```

### Testing the Connection

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Expose with ngrok:**
   ```bash
   ngrok http 5000
   ```

3. **Update Africa's Talking callback:**
   ```
   https://your-ngrok-url.ngrok-free.app/api/ussd
   ```

4. **Dial USSD code** from your phone

5. **Login to doctor dashboard:**
   ```
   http://localhost:3000/login
   Email: john.kamau@smarthealth.com
   Password: doctor123
   ```

6. **See the case appear** in the dashboard

7. **Respond to the case**

8. **Patient receives SMS** with response

## 🔐 Admin API Endpoints

### Authentication

**Login**
```
POST /api/admin/login
Body: { email, password }
Response: { token, admin }
```

### Statistics

**Get Dashboard Stats**
```
GET /api/admin/stats
Headers: Authorization: Bearer TOKEN
Response: { stats, recentCases }
```

### Doctor Management

**Get All Doctors**
```
GET /api/admin/doctors
Headers: Authorization: Bearer TOKEN
```

**Add Doctor**
```
POST /api/admin/doctors
Headers: Authorization: Bearer TOKEN
Body: { name, phone, email, password, specialization, fee }
```

**Update Doctor**
```
PUT /api/admin/doctors/:id
Headers: Authorization: Bearer TOKEN
Body: { name?, phone?, email?, specialization?, fee? }
```

**Deactivate Doctor**
```
DELETE /api/admin/doctors/:id
Headers: Authorization: Bearer TOKEN
```

### User Management

**Get All Users**
```
GET /api/admin/users
Headers: Authorization: Bearer TOKEN
```

### Case Management

**Get All Cases**
```
GET /api/admin/cases?status=pending&doctor_id=1
Headers: Authorization: Bearer TOKEN
```

**Assign Case to Doctor**
```
POST /api/admin/cases/:id/assign
Headers: Authorization: Bearer TOKEN
Body: { doctor_id }
```

## 🔒 Security

### Password Requirements

For production, enforce:
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

### Changing Admin Password

```bash
# Via MySQL
mysql -u root -p smarthealth

UPDATE admins 
SET password_hash = '$2a$10$YOUR_HASHED_PASSWORD' 
WHERE email = 'admin@smarthealth.com';
```

Or use bcrypt to hash:
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('your_new_password', 10);
console.log(hash);
```

### Creating Additional Admins

```bash
curl -X POST http://localhost:5000/api/admin/admins \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "john@smarthealth.com",
    "password": "secure_password",
    "role": "admin"
  }'
```

## 📱 Mobile Access

The admin dashboard is responsive and works on mobile devices:

1. Access from mobile browser
2. Login with admin credentials
3. Manage system on the go

## 🔄 Auto-Refresh

The dashboard automatically refreshes data every 30 seconds to show:
- New cases
- Doctor status changes
- Updated statistics

## 🎯 Best Practices

### 1. Regular Monitoring
- Check pending cases daily
- Monitor doctor response times
- Review system statistics weekly

### 2. Doctor Management
- Verify doctor credentials before adding
- Set appropriate consultation fees
- Deactivate inactive doctors

### 3. User Support
- Monitor user trial expirations
- Check for payment issues
- Respond to user complaints

### 4. Security
- Change default passwords
- Use strong passwords
- Logout after each session
- Don't share admin credentials

## 🐛 Troubleshooting

### Can't Login

**Check credentials:**
```sql
SELECT email FROM admins;
```

**Reset password:**
```sql
UPDATE admins 
SET password_hash = '$2a$10$...' 
WHERE email = 'admin@smarthealth.com';
```

### Cases Not Appearing

**Check database:**
```sql
SELECT * FROM cases ORDER BY created_at DESC LIMIT 10;
```

**Check USSD webhook:**
```bash
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test" \
  -d "phoneNumber=+254712345678"
```

### Doctor Can't Login

**Check doctor status:**
```sql
SELECT email, is_active FROM doctors WHERE email = 'doctor@example.com';
```

**Activate doctor:**
```sql
UPDATE doctors SET is_active = TRUE WHERE email = 'doctor@example.com';
```

## 📊 Database Schema

### Admins Table
```sql
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('super_admin', 'admin'),
    created_at TIMESTAMP
);
```

### Doctors Table (Updated)
```sql
CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    specialization VARCHAR(100),
    fee DECIMAL(10, 2),
    status ENUM('online', 'offline', 'busy'),
    rating DECIMAL(3, 2),
    total_consultations INT,
    is_active BOOLEAN DEFAULT TRUE,  -- NEW
    created_at TIMESTAMP
);
```

## 🚀 Deployment

### Environment Variables

Add to `.env`:
```env
# Admin settings
ADMIN_EMAIL=admin@smarthealth.com
ADMIN_PASSWORD=your_secure_password
```

### Production Setup

1. **Change default password**
2. **Enable HTTPS**
3. **Set up firewall rules**
4. **Configure rate limiting**
5. **Enable audit logging**
6. **Set up backup system**

## 📈 Monitoring

### Key Metrics to Track

- New users per day
- Cases per day
- Doctor response time
- System uptime
- Revenue per day
- User satisfaction (ratings)

### Logs

Check logs for errors:
```bash
# Backend logs
npm start

# Or with PM2
pm2 logs smarthealth-api
```

## 🎓 Training

### For New Admins

1. Review this guide
2. Practice in development environment
3. Learn to add/manage doctors
4. Understand case flow
5. Know how to troubleshoot common issues

### For Doctors

1. Provide login credentials
2. Show how to access dashboard
3. Explain case management
4. Demonstrate response process
5. Share best practices

## 📞 Support

For admin support:
- Email: admin-support@smarthealth.com
- Phone: +254700000000
- Documentation: See docs/ folder

---

**Remember:** With great power comes great responsibility. Use admin access wisely! 🦸‍♂️
