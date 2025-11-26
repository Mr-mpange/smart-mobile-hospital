# 📱 Enhanced USSD Flow with Registration, Login & Payment

## Overview

The new USSD flow includes:
1. ✅ **User Registration** - Name + 4-digit PIN for new users
2. ✅ **Secure Login** - PIN verification for returning users
3. ✅ **Payment Before Consultation** - Must pay before accessing doctor
4. ✅ **Medical Records Protection** - PIN protects patient history

---

## 🔄 Complete USSD Flow

### **Scenario 1: New User (First Time)**

```
User dials: *384*34153#

Step 1: Registration - Name
┌─────────────────────────────────┐
│ CON Welcome to SmartHealth!     │
│ You are a new user.             │
│                                 │
│ Please enter your full name:    │
└─────────────────────────────────┘
User enters: John Doe

Step 2: Registration - PIN
┌─────────────────────────────────┐
│ CON Hello John Doe!             │
│                                 │
│ For security, create a 4-digit  │
│ PIN:                            │
│ (This will protect your medical │
│ records)                        │
└─────────────────────────────────┘
User enters: 1234

Step 3: Registration Complete
┌─────────────────────────────────┐
│ END Registration successful!    │
│                                 │
│ Name: John Doe                  │
│ Phone: +254712345678            │
│ Trial: 3 FREE consultations     │
│                                 │
│ Dial *384*34153# again to start!│
└─────────────────────────────────┘
```

---

### **Scenario 2: Returning User (Login)**

```
User dials: *384*34153#

Step 1: Login
┌─────────────────────────────────┐
│ CON Welcome back, John Doe!     │
│                                 │
│ Enter your 4-digit PIN:         │
└─────────────────────────────────┘
User enters: 1234

Step 2: Main Menu (After Authentication)
┌─────────────────────────────────┐
│ CON SmartHealth - Main Menu     │
│                                 │
│ 1. Free Trial (2 free left)     │
│ 2. Paid Consultation            │
│ 3. My History                   │
│ 4. Change Language              │
│ 5. Logout                       │
└─────────────────────────────────┘
```

---

### **Scenario 3: Free Trial Consultation**

```
User selects: 1

Step 1: Enter Symptoms
┌─────────────────────────────────┐
│ CON Enter your symptoms:        │
│ (At least 2 sentences)          │
└─────────────────────────────────┘
User enters: I have severe headache and fever for 2 days

Step 2: Confirmation
┌─────────────────────────────────┐
│ END Thank you! A doctor will    │
│ respond via SMS shortly.        │
│                                 │
│ Case #123                       │
│ Time: 5-30 minutes              │
└─────────────────────────────────┘
```

---

### **Scenario 4: Paid Consultation (WITH PAYMENT)**

```
User selects: 2

Step 1: Select Doctor
┌─────────────────────────────────┐
│ CON Select Doctor:              │
│                                 │
│ 1. Dr. John Kamau               │
│    General Practitioner         │
│    TZS 500                      │
│                                 │
│ 2. Dr. Mary Wanjiku             │
│    Pediatrician                 │
│    TZS 800                      │
│                                 │
│ 3. Dr. James Omondi             │
│    Dermatologist                │
│    TZS 1,000                    │
└─────────────────────────────────┘
User selects: 1

Step 2: PAYMENT OPTIONS
┌─────────────────────────────────┐
│ CON PAYMENT REQUIRED            │
│                                 │
│ Doctor: Dr. John Kamau          │
│ Fee: TZS 500                    │
│ Total: TZS 500                  │
│                                 │
│ Select payment method:          │
│ 1. M-Pesa                       │
│ 2. Balance (TZS 200)            │
│ 3. Back                         │
└─────────────────────────────────┘

Option A: User selects M-Pesa (1)
┌─────────────────────────────────┐
│ END Payment request sent!       │
│                                 │
│ Amount: TZS 500                 │
│ Number: +254712345678           │
│                                 │
│ You will receive M-Pesa SMS.    │
│ Pay then dial *384*34153# again │
└─────────────────────────────────┘

Option B: User selects Balance (2) - Insufficient
┌─────────────────────────────────┐
│ END Insufficient balance!       │
│                                 │
│ Required: TZS 500               │
│ You have: TZS 200               │
│ Short: TZS 300                  │
│                                 │
│ Please use M-Pesa.              │
└─────────────────────────────────┘

Option C: User selects Balance (2) - Sufficient
┌─────────────────────────────────┐
│ CON Payment successful!         │
│ Amount: TZS 500                 │
│                                 │
│ Now enter your symptoms:        │
│ (At least 2 sentences)          │
└─────────────────────────────────┘
User enters: I have chest pain and difficulty breathing

Step 3: Confirmation
┌─────────────────────────────────┐
│ END Thank you! Payment completed│
│                                 │
│ Doctor: Dr. John Kamau          │
│ Amount: TZS 500                 │
│ Case: #124                      │
│                                 │
│ You will receive response via   │
│ SMS in 5-30 minutes.            │
└─────────────────────────────────┘
```

---

### **Scenario 5: With Discount/Offer**

```
User has completed 5 consultations (20% discount)

Step 1: Select Doctor
User selects: 1 (Dr. John Kamau - TZS 500)

Step 2: PAYMENT with DISCOUNT
┌─────────────────────────────────┐
│ CON PAYMENT REQUIRED            │
│                                 │
│ Doctor: Dr. John Kamau          │
│ Fee: TZS 500                    │
│ Discount: -TZS 100 (20%)        │
│ Total: TZS 400                  │
│                                 │
│ Select payment method:          │
│ 1. M-Pesa                       │
│ 2. Balance (TZS 500)            │
│ 3. Back                         │
└─────────────────────────────────┘
```

---

### **Scenario 6: Free Consultation Offer**

```
User has completed 10 consultations (1 FREE)

Step 1: Select Doctor
User selects: 2 (Dr. Mary Wanjiku - TZS 800)

Step 2: FREE CONSULTATION
┌─────────────────────────────────┐
│ CON Congratulations! You have a │
│ FREE consultation!              │
│                                 │
│ Doctor: Dr. Mary Wanjiku        │
│ Regular: TZS 800                │
│ Discount: TZS 800               │
│ Your price: TZS 0               │
│                                 │
│ 1. Continue                     │
│ 2. Back                         │
└─────────────────────────────────┘
User selects: 1

Step 3: Enter Symptoms (No Payment Required)
┌─────────────────────────────────┐
│ CON Enter your symptoms:        │
│ (At least 2 sentences)          │
└─────────────────────────────────┘
```

---

## 🔐 Security Features

### 1. **User Registration**
```
✅ Name required (minimum 3 characters)
✅ 4-digit PIN required
✅ PIN hashed with bcrypt
✅ Stored securely in database
```

### 2. **Login Protection**
```
✅ PIN verification required
✅ Session-based authentication
✅ Auto-logout after session ends
✅ Manual logout option
```

### 3. **Medical Records Protection**
```
✅ Cannot access history without PIN
✅ Cannot make consultation without login
✅ Each session requires authentication
✅ Protects patient privacy
```

---

## 💰 Payment Flow

### **Payment Methods:**

1. **M-Pesa** (Zenopay Integration)
   - Request sent to user's phone
   - User receives M-Pesa prompt
   - User enters PIN to pay
   - System confirms payment
   - Consultation proceeds

2. **Balance** (Prepaid)
   - Check user balance
   - Deduct consultation fee
   - Instant confirmation
   - Consultation proceeds

### **Payment Validation:**
```
✅ Payment required BEFORE symptoms entry
✅ Cannot proceed without payment
✅ Balance checked in real-time
✅ Transaction recorded in database
✅ Receipt via SMS
```

---

## 📊 Database Changes

### **Users Table (Updated)**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    email VARCHAR(100),
    password_hash VARCHAR(255),  -- NEW
    trial_start DATETIME,
    trial_end DATETIME,
    consultation_count INT,
    balance DECIMAL(10, 2),
    language ENUM('en', 'sw'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### **USSD Sessions Table (Enhanced)**
```sql
CREATE TABLE ussd_sessions (
    id INT PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE,
    user_id INT,
    phone VARCHAR(20),
    step VARCHAR(50),
    temporary_data JSON,  -- Stores: authenticated, doctors, payment, etc.
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🔄 Implementation Steps

### **Step 1: Update Database**
```bash
# Add password_hash column to users table
node update-users-table.js
```

### **Step 2: Update USSD Controller**
```javascript
// In backend/controllers/ussd.controller.js
const USSDService = require('../services/ussd.service.v2');

static async handleUSSD(req, res) {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
  const response = await USSDService.handleUSSD(
    sessionId,
    serviceCode,
    phoneNumber,
    text || ''
  );
  
  res.set('Content-Type', 'text/plain');
  res.send(response);
}
```

### **Step 3: Test Flow**
```bash
# Test registration
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "phoneNumber=+254700000000" \
  -d "text="

# Test login
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test124" \
  -d "phoneNumber=+254712345678" \
  -d "text="

# Test payment
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test125" \
  -d "phoneNumber=+254712345678" \
  -d "text=2*1*1"
```

---

## 🎯 Benefits

### **For Patients:**
```
✅ Secure medical records
✅ PIN-protected access
✅ Payment before service (no surprises)
✅ Clear pricing upfront
✅ Transaction history
✅ Privacy protected
```

### **For Doctors:**
```
✅ Guaranteed payment before consultation
✅ No unpaid consultations
✅ Professional service
✅ Verified patients
✅ Reduced no-shows
```

### **For Business:**
```
✅ Payment before service delivery
✅ Reduced fraud
✅ Better cash flow
✅ User authentication
✅ Compliance with regulations
✅ Audit trail
```

---

## 📱 User Experience

### **First-Time User Journey:**
```
1. Dial USSD code (10 seconds)
2. Enter name (15 seconds)
3. Create PIN (10 seconds)
4. Dial again (5 seconds)
5. Enter PIN (5 seconds)
6. Select consultation type (5 seconds)
7. Select doctor (5 seconds)
8. Pay (30 seconds)
9. Enter symptoms (30 seconds)
10. Done! (Total: ~2 minutes)
```

### **Returning User Journey:**
```
1. Dial USSD code (5 seconds)
2. Enter PIN (5 seconds)
3. Select consultation type (5 seconds)
4. Select doctor (5 seconds)
5. Pay (30 seconds)
6. Enter symptoms (30 seconds)
7. Done! (Total: ~1.5 minutes)
```

---

## 🔧 Configuration

### **Environment Variables:**
```env
# Trial period
TRIAL_DURATION_DAYS=1

# USSD code
AT_USSD_CODE=*384*34153#

# Payment
ZENOPAY_API_KEY=your_key
ZENOPAY_MERCHANT_ID=your_id

# Security
JWT_SECRET=your_secret
```

---

## 🚀 Deployment

### **1. Update Database:**
```bash
node update-users-table.js
```

### **2. Update USSD Service:**
```bash
# Backup old service
cp backend/services/ussd.service.js backend/services/ussd.service.old.js

# Use new service
cp backend/services/ussd.service.v2.js backend/services/ussd.service.js
```

### **3. Restart Server:**
```bash
npm start
```

### **4. Test:**
```bash
# Dial USSD code from phone
*384*34153#
```

---

## 📊 Success Metrics

### **Track:**
- Registration completion rate
- Login success rate
- Payment completion rate
- Consultation completion rate
- User retention
- Revenue per user

### **Expected Results:**
```
Registration: 90%+ completion
Login: 95%+ success
Payment: 85%+ completion
Consultation: 95%+ completion
Retention: 70%+ return users
Revenue: +40% increase
```

---

## 🎉 Summary

**New USSD Flow Features:**

1. ✅ **Registration** - Name + PIN for new users
2. ✅ **Login** - PIN verification for security
3. ✅ **Payment First** - Must pay before consultation
4. ✅ **Medical Records** - PIN-protected history
5. ✅ **Discounts** - Automatic offer application
6. ✅ **Balance** - Prepaid option
7. ✅ **M-Pesa** - Integrated payment
8. ✅ **Logout** - Secure session management

**Result:** More secure, professional, and profitable telemedicine system! 🏥💰🔐
