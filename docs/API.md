# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

Most doctor endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## USSD Endpoints

### Handle USSD Request

**POST** `/ussd`

Webhook endpoint for Africa's Talking USSD requests.

**Request Body:**
```json
{
  "sessionId": "ATUid_123456",
  "serviceCode": "*123#",
  "phoneNumber": "+254712345678",
  "text": "1*2"
}
```

**Response:**
```
CON Welcome to SmartHealth
1. Free Trial Consultation
2. Pay-per-Consultation
3. Consultation History
```

## SMS Endpoints

### Handle Incoming SMS

**POST** `/sms/incoming`

Webhook endpoint for incoming SMS messages.

**Request Body:**
```json
{
  "from": "+254712345678",
  "text": "CONSULT I have fever and headache",
  "date": "2024-01-15 10:30:00",
  "id": "msg_123"
}
```

### Send SMS (Testing)

**POST** `/sms/send`

Send SMS message (for testing purposes).

**Request Body:**
```json
{
  "phone": "+254712345678",
  "message": "Your consultation response..."
}
```

## Doctor Endpoints

### Login

**POST** `/doctors/login`

Authenticate doctor and receive JWT token.

**Request Body:**
```json
{
  "email": "john.kamau@smarthealth.com",
  "password": "doctor123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "doctor": {
    "id": 1,
    "name": "Dr. John Kamau",
    "email": "john.kamau@smarthealth.com",
    "specialization": "General Practitioner",
    "fee": 500.00,
    "status": "online"
  }
}
```

### Logout

**POST** `/doctors/logout`

Logout doctor and set status to offline.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Profile

**GET** `/doctors/profile`

Get authenticated doctor's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "doctor": {
    "id": 1,
    "name": "Dr. John Kamau",
    "email": "john.kamau@smarthealth.com",
    "specialization": "General Practitioner",
    "fee": 500.00,
    "status": "online",
    "rating": 4.5,
    "total_consultations": 150
  }
}
```

### Update Status

**PUT** `/doctors/status`

Update doctor's availability status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "online"
}
```

**Valid statuses:** `online`, `offline`, `busy`

**Response:**
```json
{
  "success": true,
  "status": "online"
}
```

### Get Cases

**GET** `/doctors/cases?status=pending`

Get doctor's cases with optional status filter.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by case status

**Response:**
```json
{
  "success": true,
  "cases": [
    {
      "id": 1,
      "user_name": "John Doe",
      "phone": "+254712345678",
      "symptoms": "I have fever and headache for 2 days",
      "response": null,
      "status": "assigned",
      "consultation_type": "trial",
      "priority": 0,
      "created_at": "2024-01-15T10:30:00.000Z",
      "consultation_count": 1
    }
  ]
}
```

### Get Queue

**GET** `/doctors/queue`

Get pending cases assigned to doctor.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "queue": [
    {
      "id": 1,
      "user_name": "John Doe",
      "phone": "+254712345678",
      "symptoms": "I have fever and headache",
      "status": "assigned",
      "priority": 1,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Respond to Case

**POST** `/doctors/cases/:caseId/respond`

Submit response to a patient case.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "response": "Based on your symptoms, I recommend taking paracetamol 500mg every 6 hours and drinking plenty of fluids. If symptoms persist for more than 3 days, please visit a clinic."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Response sent successfully"
}
```

### Get Statistics

**GET** `/doctors/stats`

Get doctor's consultation statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_cases": 150,
    "completed_cases": 145,
    "pending_cases": 5,
    "avg_rating": 4.5
  }
}
```

### Get Available Doctors (Public)

**GET** `/doctors/available`

Get list of available doctors (no authentication required).

**Response:**
```json
{
  "success": true,
  "doctors": [
    {
      "id": 1,
      "name": "Dr. John Kamau",
      "specialization": "General Practitioner",
      "fee": 500.00,
      "rating": 4.5,
      "total_consultations": 150
    }
  ]
}
```

## Payment Endpoints

### Initiate Payment

**POST** `/payments/initiate`

Initiate payment via Zenopay.

**Request Body:**
```json
{
  "userId": 1,
  "amount": 500.00,
  "caseId": 1
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": 1,
  "paymentId": "ZP_123456",
  "status": "pending",
  "message": "Payment initiated. Please complete on your phone."
}
```

### Payment Callback

**POST** `/payments/callback`

Webhook endpoint for Zenopay payment callbacks.

**Request Body:**
```json
{
  "transaction_id": 1,
  "status": "success",
  "payment_id": "ZP_123456",
  "signature": "abc123..."
}
```

### Check Payment Status

**GET** `/payments/:transactionId/status`

Check status of a payment transaction.

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": 1,
    "user_id": 1,
    "amount": 500.00,
    "payment_method": "zenopay",
    "status": "completed",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get User Transactions

**GET** `/payments/user/:userId?limit=10`

Get transaction history for a user.

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 10)

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": 1,
      "amount": 500.00,
      "payment_method": "zenopay",
      "status": "completed",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Process Refund

**POST** `/payments/:transactionId/refund`

Process refund for a completed transaction.

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully"
}
```

### Get Payment Statistics

**GET** `/payments/stats?startDate=2024-01-01&endDate=2024-01-31`

Get payment statistics for a date range.

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_transactions": 500,
    "successful_transactions": 480,
    "total_revenue": 240000.00,
    "avg_transaction_amount": 500.00
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

When rate limit is exceeded:

```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Webhooks

### USSD Webhook

Configure in Africa's Talking dashboard:
- URL: `https://your-domain.com/api/ussd`
- Method: POST

### SMS Webhook

Configure in Africa's Talking dashboard:
- URL: `https://your-domain.com/api/sms/incoming`
- Method: POST

### Payment Webhook

Configure in Zenopay dashboard:
- URL: `https://your-domain.com/api/payments/callback`
- Method: POST
