# USSD Flow Documentation

## Overview

The USSD interface provides an interactive menu system for 2G users to access telemedicine services. Users dial `*123#` to access the system.

## Main Menu

```
CON Welcome to SmartHealth
1. Free Trial Consultation
2. Pay-per-Consultation
3. Consultation History
4. Change Language
```

## Flow Diagrams

### 1. Free Trial Consultation Flow

```
User dials *123#
    ↓
Main Menu (Select 1)
    ↓
Check Trial Status
    ├─ Trial Active
    │   ↓
    │   CON Enter your symptoms:
    │   ↓
    │   User enters symptoms
    │   ↓
    │   Create case (trial type)
    │   ↓
    │   Auto-assign to available doctor
    │   ↓
    │   END Thank you! A doctor will respond via SMS shortly. Case #123
    │
    └─ Trial Expired
        ↓
        END Your trial period has ended. Please choose paid consultation.
```

### 2. Pay-per-Consultation Flow

```
User dials *123#
    ↓
Main Menu (Select 2)
    ↓
CON Select Doctor:
1. Dr. John Kamau - General Practitioner (KES 500)
2. Dr. Mary Wanjiku - Pediatrician (KES 800)
3. Dr. James Omondi - Dermatologist (KES 1000)
    ↓
User selects doctor (e.g., 1)
    ↓
CON Enter your symptoms:
    ↓
User enters symptoms
    ↓
Check for active offers
    ├─ Free Consultation Offer
    │   ↓
    │   Apply offer (no payment)
    │   ↓
    │   Create case (free_offer type)
    │
    ├─ Discount Offer (20%)
    │   ↓
    │   Calculate discounted amount
    │   ↓
    │   Check balance or initiate payment
    │
    └─ No Offer
        ↓
        Check balance or initiate payment
    ↓
Assign to selected doctor
    ↓
END Thank you! Dr. John Kamau will respond shortly. Case #123
```

### 3. Consultation History Flow

```
User dials *123#
    ↓
Main Menu (Select 3)
    ↓
Fetch user's recent consultations
    ├─ Has History
    │   ↓
    │   END Your recent history:
    │   1. Dr. John Kamau - completed
    │   2. Dr. Mary Wanjiku - pending
    │   3. Dr. James Omondi - completed
    │
    └─ No History
        ↓
        END No consultation history yet.
```

### 4. Language Change Flow

```
User dials *123#
    ↓
Main Menu (Select 4)
    ↓
CON Select Language / Chagua Lugha:
1. English
2. Kiswahili
    ↓
User selects language
    ↓
Update user language preference
    ↓
END Language changed to English
```

## Session Management

### Session Data Structure

```javascript
{
  session_id: "ATUid_123456",
  user_id: 1,
  phone: "+254712345678",
  step: "1*2",  // Current navigation path
  temporary_data: {
    doctors: [...],  // Cached doctor list
    selected_doctor: 1,
    symptoms: "..."
  }
}
```

### Session Timeout

- USSD sessions timeout after 30 seconds of inactivity
- Session data is stored in database for recovery
- Temporary data is cleared after session completion

## Multi-language Support

### English Menu

```
CON Welcome to SmartHealth
1. Free Trial Consultation
2. Pay-per-Consultation
3. Consultation History
4. Change Language
```

### Swahili Menu

```
CON Karibu SmartHealth
1. Ushauri wa Bure
2. Ushauri wa Malipo
3. Historia ya Ushauri
4. Badilisha Lugha
```

## Input Validation

### Symptoms Validation

- Minimum length: 10 characters
- Maximum length: 500 characters
- Required for all consultation types

Example valid input:
```
I have fever and headache for 2 days
```

Example invalid input:
```
fever
```

Response:
```
END Please provide more detailed symptoms.
```

### Doctor Selection Validation

- Must be a valid number
- Must be within available doctor range
- Doctor must be available

## Offer System Integration

### Automatic Offer Application

1. **Free Consultation** (every 10 consultations)
   - Automatically applied
   - No payment required
   - Marked as `free_offer` type

2. **Discount** (every 5 consultations)
   - 20% discount applied
   - Reduced payment amount
   - Still marked as `paid` type

3. **Priority Queue** (after 3 consultations)
   - Higher priority value
   - Faster doctor assignment
   - No cost difference

### Offer Display

When offer is available:
```
CON You have a 20% discount offer!
Original: KES 500
Discounted: KES 400

Enter your symptoms:
```

## Payment Integration

### Payment Flow in USSD

1. User selects paid consultation
2. System checks for offers
3. Calculate final amount
4. Check user balance
5. If insufficient:
   ```
   END Please pay KES 500 via Zenopay. 
   You will receive payment SMS.
   ```
6. If sufficient:
   - Deduct from balance
   - Create case
   - Assign doctor

### Payment Confirmation

After successful payment via Zenopay:
- SMS sent to user
- Case status updated to `assigned`
- Doctor notified

## SMS Fallback

When USSD session expires or fails:
- System sends SMS with case details
- Doctor response delivered via SMS
- User can continue via SMS commands

Example SMS:
```
Your consultation request has been received.
Case #123
Dr. John Kamau will respond shortly.
```

## Error Handling

### Common Errors

1. **Invalid Option**
   ```
   END Invalid option. Please try again.
   ```

2. **No Doctors Available**
   ```
   END No doctors available. Please try again later.
   ```

3. **Insufficient Symptoms**
   ```
   END Please provide more detailed symptoms.
   ```

4. **Payment Failed**
   ```
   END Payment failed. Please try again or contact support.
   ```

5. **System Error**
   ```
   END Service temporarily unavailable. Please try again.
   ```

## Testing USSD Flow

### Using Africa's Talking Simulator

1. Go to Africa's Talking dashboard
2. Navigate to USSD → Simulator
3. Enter phone number
4. Dial your USSD code
5. Test all menu options

### Using cURL

```bash
# Test main menu
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text="

# Test trial consultation
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text=1"

# Test with symptoms
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*123#" \
  -d "phoneNumber=+254712345678" \
  -d "text=1*I have fever and headache"
```

## Performance Considerations

### Response Time

- USSD responses must be < 3 seconds
- Database queries optimized with indexes
- Doctor list cached in session
- Async operations for non-critical tasks

### Concurrent Sessions

- System handles multiple simultaneous sessions
- Session isolation via unique session IDs
- Connection pooling for database

### Scalability

- Stateless design (session data in DB)
- Horizontal scaling possible
- Load balancing supported

## Best Practices

1. **Keep menus simple** - Max 5 options per menu
2. **Clear instructions** - Tell users what to do
3. **Validate input** - Check before processing
4. **Handle timeouts** - Graceful session expiry
5. **Provide feedback** - Confirm actions
6. **Use SMS fallback** - For long responses
7. **Test thoroughly** - All paths and edge cases
8. **Monitor errors** - Log and track issues
9. **Optimize queries** - Fast response times
10. **Support both languages** - English and Swahili
