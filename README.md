# 🏥 SmartHealth Telemedicine System

Complete telemedicine platform supporting 2G (USSD/SMS) and 4G (web) users with integrated payment processing.

## 📋 Overview

SmartHealth is a comprehensive telemedicine solution designed for both feature phone (2G) and smartphone (4G) users in Kenya and across Africa. The system enables patients to consult with doctors via USSD, SMS, or web interface, with seamless payment integration through Zenopay.

### Key Features

#### For Patients (2G Users)
- 📱 **USSD Menu** - Interactive consultation via `*123#`
- 💬 **SMS Interface** - Text-based consultation commands
- 🆓 **Free Trial** - 1-day trial period for new users
- 💰 **Flexible Payment** - Pay-per-consultation via Zenopay
- 🎁 **Loyalty Rewards** - Discounts and free consultations
- ⚡ **Priority Queue** - For frequent users
- 🌍 **Multi-language** - English and Swahili support

#### For Doctors (4G Users)
- 💻 **Web Dashboard** - Modern, responsive interface
- 📊 **Real-time Queue** - View pending consultations
- 📝 **Case Management** - Respond to patient queries
- 📈 **Statistics** - Track performance and ratings
- 🔔 **Notifications** - Instant patient alerts
- 🟢 **Status Control** - Online/Offline/Busy modes

#### System Features
- 🔐 **Secure Authentication** - JWT-based auth for doctors
- 💳 **Payment Integration** - Zenopay API integration
- 📧 **SMS Notifications** - Automated patient updates
- 🗄️ **Database Persistence** - MySQL with optimized queries
- 🔄 **Auto-assignment** - Smart doctor allocation
- 📱 **Mobile Responsive** - Works on all devices

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, bcryptjs, express-rate-limit
- **Validation:** express-validator

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Notifications:** React Toastify
- **Date Handling:** date-fns

### External Services
- **USSD/SMS:** Africa's Talking API
- **Payment:** Zenopay API
- **Hosting:** AWS/DigitalOcean/Heroku compatible

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MySQL 8+ installed and running
- Africa's Talking account ([Sign up](https://africastalking.com/))
- Zenopay merchant account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd smarthealth
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install && cd ..
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Setup database**
```bash
npm run db:setup
```

5. **Start development servers**
```bash
npm run dev
```

The application will be available at:
- Backend API: http://localhost:5000
- Frontend Dashboard: http://localhost:3000

### Default Login Credentials

```
Email: john.kamau@smarthealth.com
Password: doctor123
```

## 📁 Project Structure

```
smarthealth/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/
│   │   ├── ussd.controller.js   # USSD webhook handler
│   │   ├── sms.controller.js    # SMS webhook handler
│   │   ├── doctor.controller.js # Doctor API endpoints
│   │   └── payment.controller.js # Payment processing
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── models/
│   │   ├── User.js              # User database model
│   │   ├── Doctor.js            # Doctor database model
│   │   ├── Case.js              # Consultation case model
│   │   └── Offer.js             # Loyalty offer model
│   ├── routes/
│   │   ├── ussd.routes.js       # USSD routes
│   │   ├── sms.routes.js        # SMS routes
│   │   ├── doctor.routes.js     # Doctor routes
│   │   └── payment.routes.js    # Payment routes
│   ├── services/
│   │   ├── ussd.service.js      # USSD business logic
│   │   ├── sms.service.js       # SMS business logic
│   │   └── payment.service.js   # Payment business logic
│   ├── utils/
│   │   └── cron.js              # Scheduled tasks
│   └── server.js                # Express app entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Header.js        # Dashboard header
│       │   ├── Stats.js         # Statistics cards
│       │   ├── CaseList.js      # Patient queue list
│       │   └── CaseModal.js     # Case detail modal
│       ├── context/
│       │   └── AuthContext.js   # Authentication context
│       ├── pages/
│       │   ├── Login.js         # Login page
│       │   └── Dashboard.js     # Main dashboard
│       ├── services/
│       │   └── api.js           # API client
│       ├── App.js               # Root component
│       └── index.js             # React entry point
├── database/
│   ├── schema.sql               # Database schema
│   └── setup.js                 # Database setup script
├── docs/
│   ├── API.md                   # API documentation
│   ├── USSD_FLOW.md            # USSD flow diagrams
│   └── DEPLOYMENT.md           # Deployment guide
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── INSTALLATION.md              # Detailed installation guide
└── README.md                    # This file
```

## 📖 Documentation

- **[Installation Guide](INSTALLATION.md)** - Detailed setup instructions
- **[API Documentation](docs/API.md)** - Complete API reference
- **[USSD Flow](docs/USSD_FLOW.md)** - USSD menu navigation
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment

## 🔄 User Flows

### USSD Consultation Flow

```
User dials *123# → Main Menu → Select Option
    ├─ Free Trial → Enter Symptoms → Auto-assign Doctor → SMS Response
    ├─ Paid Consultation → Select Doctor → Enter Symptoms → Payment → SMS Response
    ├─ History → View Past Consultations
    └─ Language → Change to English/Swahili
```

### SMS Consultation Flow

```
User sends "CONSULT [symptoms]" → System Processes
    ├─ Trial Active → Create Case → Assign Doctor → SMS Response
    └─ Trial Expired → Send Doctor List → User Selects → Payment → SMS Response
```

### Doctor Dashboard Flow

```
Doctor Login → Dashboard
    ├─ View Queue → Select Case → Read Symptoms → Send Response → SMS to Patient
    ├─ View Statistics → Total/Completed/Pending Cases
    └─ Change Status → Online/Busy/Offline
```

## 💡 Key Features Explained

### 1. Free Trial System
- New users get 1-day free trial
- Configurable duration via `TRIAL_DURATION_DAYS`
- Automatic expiry tracking
- Seamless transition to paid consultations

### 2. Loyalty Rewards
- **Every 5 consultations:** 20% discount
- **Every 10 consultations:** Free consultation
- **After 3 consultations:** Priority queue access
- Automatic offer application

### 3. Payment Integration
- Zenopay API integration
- Balance tracking
- Transaction history
- Refund support
- Webhook callbacks

### 4. Smart Doctor Assignment
- Auto-assign to available doctors
- Load balancing based on workload
- Priority queue for frequent users
- Manual doctor selection option

### 5. Multi-channel Communication
- USSD for interactive menus
- SMS for notifications and responses
- Web dashboard for doctors
- Seamless channel switching

## 🔧 Configuration

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smarthealth

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Africa's Talking
AT_API_KEY=your_api_key
AT_USERNAME=your_username
AT_USSD_CODE=*123#

# Zenopay
ZENOPAY_API_KEY=your_api_key
ZENOPAY_MERCHANT_ID=your_merchant_id
ZENOPAY_SECRET=your_secret

# Trial & Offers
TRIAL_DURATION_DAYS=1
CONSULTATIONS_FOR_DISCOUNT=5
DISCOUNT_PERCENTAGE=20
CONSULTATIONS_FOR_FREE=10
```

## 🧪 Testing

### Test USSD Locally

```bash
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123&serviceCode=*123#&phoneNumber=+254712345678&text="
```

### Test SMS

```bash
curl -X POST http://localhost:5000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"+254712345678","message":"Test message"}'
```

### Test Doctor Login

```bash
curl -X POST http://localhost:5000/api/doctors/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.kamau@smarthealth.com","password":"doctor123"}'
```

## 🚀 Deployment

### Quick Deploy Options

1. **Heroku** - One-click deploy
2. **DigitalOcean** - App Platform
3. **AWS** - EC2 + RDS
4. **Docker** - Container deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 🔒 Security Features

- JWT authentication for doctors
- Password hashing with bcrypt
- SQL injection prevention
- XSS protection with Helmet
- Rate limiting (100 req/15min)
- Input validation
- CORS configuration
- Secure session management

## 📊 Database Schema

### Main Tables
- **users** - Patient information and trial status
- **doctors** - Doctor profiles and availability
- **cases** - Consultation records
- **transactions** - Payment history
- **offers** - Loyalty rewards
- **ussd_sessions** - USSD session tracking
- **sms_queue** - SMS delivery queue

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
1. Check [INSTALLATION.md](INSTALLATION.md) for setup help
2. Review [docs/](docs/) for detailed documentation
3. Check application logs for errors
4. Open an issue on GitHub

## 🎯 Roadmap

- [ ] Video consultation support
- [ ] Prescription management
- [ ] Lab test integration
- [ ] Pharmacy integration
- [ ] Mobile apps (iOS/Android)
- [ ] AI symptom checker
- [ ] Multi-country support
- [ ] Insurance integration

## 👥 Authors

Built with ❤️ for accessible healthcare in Africa

## 🙏 Acknowledgments

- Africa's Talking for USSD/SMS infrastructure
- Zenopay for payment processing
- Open source community

