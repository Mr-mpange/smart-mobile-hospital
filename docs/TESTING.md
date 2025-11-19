# Testing Guide

Complete guide for testing the SmartHealth Telemedicine System.

## Table of Contents
1. [Local Testing](#local-testing)
2. [USSD Testing](#ussd-testing)
3. [SMS Testing](#sms-testing)
4. [Doctor Dashboard Testing](#doctor-dashboard-testing)
5. [Payment Testing](#payment-testing)
6. [API Testing](#api-testing)
7. [Integration Testing](#integration-testing)

## Local Testing

### Prerequisites
- Application running locally (`npm run dev`)
- Database setup completed
- Sample doctors created

### Quick Health Check

```bash
# Check backend health
curl http://localhost:5000/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-15T10:30:00.000Z"}
```

## USSD Testing

### Using cURL

#### 1. Test Main Menu

```bash
curl -X POST http://localhost:5000/api/ussd \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text="
```

**Expected Response:**
```
CON Welcome to SmartHealth
1. Free Trial Consultation
2. Pay-per-Consultation
3. Consultation History
4. Change Language
```

#### 2. Test Trial Consultation

```bash
# Step 1: Select trial option
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text=1"

# Step 2: Enter symptoms
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text=1*I have fever and headache for 2 days"
```

#### 3. Test Paid Consultation

```bash
# Step 1: Select paid option
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text=2"

# Step 2: Select doctor
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text=2*1"

# Step 3: Enter symptoms
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text=2*1*I have persistent cough and chest pain"
```

#### 4. Test History

```bash
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text=3"
```

#### 5. Test Language Change

```bash
# Select language option
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text=4"

# Select Swahili
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text=4*2"
```

### Using Postman

1. Create new POST request
2. URL: `http://localhost:5000/api/ussd`
3. Body type: `x-www-form-urlencoded`
4. Add parameters:
   - `sessionId`: test123
   - `serviceCode`: *123#
   - `phoneNumber`: +254712345678
   - `text`: (varies by test)

### Using Africa's Talking Simulator

1. Login to Africa's Talking dashboard
2. Go to USSD → Simulator
3. Enter test phone number
4. Dial your USSD code
5. Navigate through menus

## SMS Testing

### Test SMS Sending

```bash
curl -X POST http://localhost:5000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254712345678",
    "message": "Test message from SmartHealth"
  }'
```

### Test Incoming SMS

```bash
# Test CONSULT command
curl -X POST http://localhost:5000/api/sms/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+254712345678",
    "text": "CONSULT I have fever and headache",
    "date": "2024-01-15 10:30:00",
    "id": "msg_123"
  }'

# Test DOCTORS command
curl -X POST http://localhost:5000/api/sms/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+254712345678",
    "text": "DOCTORS",
    "date": "2024-01-15 10:30:00",
    "id": "msg_124"
  }'

# Test SELECT command
curl -X POST http://localhost:5000/api/sms/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+254712345678",
    "text": "SELECT 1 I have persistent cough",
    "date": "2024-01-15 10:30:00",
    "id": "msg_125"
  }'

# Test HISTORY command
curl -X POST http://localhost:5000/api/sms/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+254712345678",
    "text": "HISTORY",
    "date": "2024-01-15 10:30:00",
    "id": "msg_126"
  }'
```

## Doctor Dashboard Testing

### Manual Testing Steps

1. **Login Test**
   - Go to http://localhost:3000
   - Enter credentials:
     - Email: `john.kamau@smarthealth.com`
     - Password: `doctor123`
   - Click Login
   - Verify redirect to dashboard

2. **Dashboard View Test**
   - Verify statistics cards display
   - Check case list loads
   - Verify filter buttons work

3. **Status Change Test**
   - Click status dropdown
   - Change to "Online"
   - Verify status updates
   - Change to "Busy"
   - Change to "Offline"

4. **Case Response Test**
   - Click on a case card
   - Modal should open
   - Enter response text
   - Click "Send Response"
   - Verify success message
   - Check case status updates

5. **Filter Test**
   - Click "Pending" filter
   - Verify only pending cases show
   - Click "Completed" filter
   - Verify only completed cases show

6. **Logout Test**
   - Click doctor menu
   - Click Logout
   - Verify redirect to login

### Automated UI Tests (Optional)

Create test file `frontend/src/App.test.js`:

```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page', () => {
  render(<App />);
  const loginElement = screen.getByText(/SmartHealth/i);
  expect(loginElement).toBeInTheDocument();
});
```

Run tests:
```bash
cd frontend
npm test
```

## Payment Testing

### Test Payment Initiation

```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "amount": 500,
    "caseId": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "transactionId": 1,
  "paymentId": "ZP_123456",
  "status": "pending",
  "message": "Payment initiated. Please complete on your phone."
}
```

### Test Payment Callback

```bash
curl -X POST http://localhost:5000/api/payments/callback \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": 1,
    "status": "success",
    "payment_id": "ZP_123456",
    "signature": "test_signature"
  }'
```

### Test Payment Status Check

```bash
curl http://localhost:5000/api/payments/1/status
```

## API Testing

### Doctor Authentication

```bash
# Login
curl -X POST http://localhost:5000/api/doctors/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.kamau@smarthealth.com",
    "password": "doctor123"
  }'

# Save the token from response
TOKEN="your_jwt_token_here"

# Get Profile
curl http://localhost:5000/api/doctors/profile \
  -H "Authorization: Bearer $TOKEN"

# Update Status
curl -X PUT http://localhost:5000/api/doctors/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "online"}'

# Get Cases
curl http://localhost:5000/api/doctors/cases \
  -H "Authorization: Bearer $TOKEN"

# Get Queue
curl http://localhost:5000/api/doctors/queue \
  -H "Authorization: Bearer $TOKEN"

# Respond to Case
curl -X POST http://localhost:5000/api/doctors/cases/1/respond \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Take paracetamol 500mg every 6 hours and rest. If symptoms persist, visit a clinic."
  }'

# Get Statistics
curl http://localhost:5000/api/doctors/stats \
  -H "Authorization: Bearer $TOKEN"

# Logout
curl -X POST http://localhost:5000/api/doctors/logout \
  -H "Authorization: Bearer $TOKEN"
```

### Public Endpoints

```bash
# Get Available Doctors
curl http://localhost:5000/api/doctors/available
```

## Integration Testing

### End-to-End Patient Flow

1. **New User Registration (via USSD)**
```bash
# User dials USSD
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=e2e_test" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254700000001" \
  -d "text="
```

2. **Start Trial Consultation**
```bash
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=e2e_test" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254700000001" \
  -d "text=1*I have severe headache and dizziness"
```

3. **Doctor Responds**
```bash
# Login as doctor
TOKEN=$(curl -X POST http://localhost:5000/api/doctors/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.kamau@smarthealth.com","password":"doctor123"}' \
  | jq -r '.token')

# Get pending cases
CASE_ID=$(curl http://localhost:5000/api/doctors/queue \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.queue[0].id')

# Respond to case
curl -X POST http://localhost:5000/api/doctors/cases/$CASE_ID/respond \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Your symptoms suggest tension headache. Take paracetamol and rest in a dark room."
  }'
```

4. **Verify SMS Sent**
Check SMS queue in database:
```sql
SELECT * FROM sms_queue WHERE phone = '+254700000001' ORDER BY created_at DESC LIMIT 1;
```

### Database Verification

```sql
-- Check user created
SELECT * FROM users WHERE phone = '+254700000001';

-- Check case created
SELECT * FROM cases WHERE user_id = (SELECT id FROM users WHERE phone = '+254700000001');

-- Check trial period
SELECT trial_start, trial_end FROM users WHERE phone = '+254700000001';

-- Check consultation count
SELECT consultation_count FROM users WHERE phone = '+254700000001';
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test USSD endpoint
ab -n 1000 -c 10 -p ussd_data.txt -T application/x-www-form-urlencoded \
  http://localhost:5000/api/ussd

# Test doctor login
ab -n 100 -c 5 -p login_data.json -T application/json \
  http://localhost:5000/api/doctors/login
```

### Stress Testing

```bash
# Install artillery
npm install -g artillery

# Create test script (artillery.yml)
# Run stress test
artillery run artillery.yml
```

## Test Checklist

### USSD Tests
- [ ] Main menu displays correctly
- [ ] Trial consultation flow works
- [ ] Paid consultation flow works
- [ ] Doctor selection works
- [ ] History displays correctly
- [ ] Language change works
- [ ] Invalid input handled
- [ ] Session timeout handled

### SMS Tests
- [ ] CONSULT command works
- [ ] DOCTORS command works
- [ ] SELECT command works
- [ ] HISTORY command works
- [ ] HELP command works
- [ ] Invalid command handled
- [ ] SMS delivery confirmed

### Doctor Dashboard Tests
- [ ] Login works
- [ ] Dashboard loads
- [ ] Statistics display
- [ ] Case list displays
- [ ] Filters work
- [ ] Case modal opens
- [ ] Response submission works
- [ ] Status change works
- [ ] Logout works

### Payment Tests
- [ ] Payment initiation works
- [ ] Callback processing works
- [ ] Status check works
- [ ] Balance update works
- [ ] Transaction history works
- [ ] Refund works

### Integration Tests
- [ ] End-to-end patient flow
- [ ] End-to-end doctor flow
- [ ] Offer application works
- [ ] Priority queue works
- [ ] Multi-language support
- [ ] SMS notifications sent

## Troubleshooting Tests

### Common Issues

1. **USSD returns empty response**
   - Check backend logs
   - Verify database connection
   - Check session data

2. **SMS not sending**
   - Check Africa's Talking credentials
   - Verify SMS queue
   - Check network connectivity

3. **Doctor login fails**
   - Verify credentials
   - Check JWT secret
   - Verify database connection

4. **Payment fails**
   - Check Zenopay credentials
   - Verify callback URL
   - Check transaction logs

## Continuous Testing

### Setup GitHub Actions (Optional)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: smarthealth_test
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Test Reports

Generate test coverage:

```bash
npm test -- --coverage
```

View coverage report:
```bash
open coverage/lcov-report/index.html
```
