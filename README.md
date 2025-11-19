# 🏥 SmartHealth Telemedicine System

Complete telemedicine platform with USSD, SMS, Voice, and Web interfaces for healthcare delivery in Africa.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL 8.0+
- Africa's Talking account (sandbox or production)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Mr-mpange/smart-mobile-hospital.git
cd smart-mobile-hospital

# 2. Install dependencies
npm install
cd frontend && npm install && cd ..

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Start application
npm run dev
```

The system will automatically:
- Create database if not exists
- Create all tables
- Insert sample doctors
- Start backend (port 5000) and frontend (port 3000)

## 📋 Features

### 🔹 Multi-Channel Access
- **USSD**: `*384*34153#` - Works on any phone
- **SMS**: Text "HEALTH" to shortcode
- **Voice/IVR**: Call for voice consultations
- **Web Dashboard**: Doctor portal at http://localhost:3000

### 🔹 Core Functionality
- Patient consultations via USSD/SMS/Voice
- Doctor dashboard for case management
- Payment integration (Zenopay)
- Trial system (1 day, 3 free consultations)
- Automated SMS notifications
- Real-time case assignment

### 🔹 Auto-Migration System
- Database tables created automatically on startup
- Schema updates applied automatically
- Sample data inserted if database is empty
- Zero manual database setup required

## 🔧 Configuration

### Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database (auto-created)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smarthealth

# Africa's Talking
AT_API_KEY=your_api_key
AT_USERNAME=sandbox
AT_USSD_CODE=*384*34153#
AT_SMS_SHORTCODE=34059

# JWT
JWT_SECRET=your_secret_key

# Payment (Optional)
ZENOPAY_API_KEY=your_key
ZENOPAY_MERCHANT_ID=your_id
```

### USSD Webhook Setup

**For local testing with Africa's Talking:**

1. Install ngrok: `npm install -g ngrok`
2. Start server: `npm start`
3. Start ngrok: `ngrok http 5000`
4. Copy HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
5. Update Africa's Talking callback: `https://abc123.ngrok-free.app/api/ussd`
6. Test by dialing your USSD code

**For production:** Deploy to Heroku, DigitalOcean, Railway, or your own server.

## 📁 Project Structure

```
smarthealth/
├── backend/
│   ├── config/          # Database & migrations
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API client
│   └── public/
├── database/
│   └── schema.sql       # Database schema
├── docs/                # Documentation
├── .env                 # Configuration
└── package.json
```

## 🔑 Default Credentials

### Admin Login
```
URL: http://localhost:3000/admin/login
Email: admin@smarthealth.com
Password: admin123
```

### Doctor Login
```
URL: http://localhost:3000/login
Email: john.kamau@smarthealth.com
Password: doctor123
```

Other sample doctors:
- mary.wanjiku@smarthealth.com
- james.omondi@smarthealth.com

## 🧪 Testing

### Test Backend
```bash
curl http://localhost:5000/health
```

### Test Database Status
```bash
curl http://localhost:5000/api/doctors/db-status
```

### Test Migrations
```bash
node test-migrations.js
```

### Test USSD Locally
```bash
curl -X POST http://localhost:5000/api/ussd \
  -d "sessionId=test123" \
  -d "serviceCode=*384*34153#" \
  -d "phoneNumber=+254712345678" \
  -d "text="
```

## 📚 Documentation

- **ADMIN_GUIDE.md** - Complete admin system guide
- **INSTALLATION.md** - Detailed installation guide
- **WINDOWS_SETUP.md** - Windows-specific setup
- **START_HERE.md** - Quick troubleshooting guide
- **VOICE_SETUP.md** - Voice/IVR configuration
- **SECURITY.md** - Security best practices
- **docs/API.md** - API documentation
- **docs/AUTO_MIGRATIONS.md** - Migration system guide
- **docs/USSD_FLOW.md** - USSD flow documentation
- **docs/VOICE_IVR.md** - Voice system documentation

## 🛠️ Available Scripts

```bash
# Development (both backend & frontend)
npm run dev

# Backend only
npm start

# Frontend only
cd frontend && npm start

# Database setup (optional - auto-created on startup)
npm run db:setup

# Test migrations
node test-migrations.js
```

## 🔄 Auto-Migration System

The system automatically handles database setup:

1. **Creates database** if it doesn't exist
2. **Creates tables** from schema.sql
3. **Adds new columns** when schema updates
4. **Inserts sample data** if database is empty
5. **Never deletes** existing data

To add new columns:
```javascript
// Edit backend/config/migrations.js
const tableUpdates = {
  doctors: {
    'new_column': 'VARCHAR(255) DEFAULT NULL'
  }
};
```

Restart server - column added automatically!

## 🚨 Troubleshooting

### USSD Returns 404
**Problem:** Africa's Talking can't reach localhost

**Solution:** Use ngrok to expose your local server
```bash
ngrok http 5000
```
Update callback URL in Africa's Talking dashboard.

### Frontend Won't Start
**Problem:** react-scripts not installed

**Solution:**
```bash
cd frontend
npm install
```

### Database Connection Failed
**Problem:** MySQL not running or wrong credentials

**Solution:**
```bash
# Start MySQL
net start MySQL80

# Check credentials in .env
DB_USER=root
DB_PASSWORD=your_password
```

### Port Already in Use
**Solution:**
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <number> /F
```

## 🌍 Deployment

### Heroku
```bash
heroku create smarthealth-api
heroku addons:create jawsdb:kitefin
git push heroku main
```

### DigitalOcean
1. Create App Platform app
2. Connect GitHub repo
3. Add environment variables
4. Deploy

### Railway
1. New project from GitHub
2. Add environment variables
3. Deploy

Update Africa's Talking callback URL to your production domain.

## 🔒 Security

- Never commit `.env` file
- Use strong JWT secrets in production
- Rotate API keys regularly
- Enable HTTPS in production
- Use environment variables for secrets
- See **SECURITY.md** for details

## 📊 System Architecture

```
┌─────────────┐
│   Patient   │
└──────┬──────┘
       │
       ├─── USSD (*384*34153#)
       ├─── SMS (34059)
       └─── Voice Call
       │
       ▼
┌──────────────────┐
│ Africa's Talking │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  SmartHealth    │
│  Backend API    │
│  (Node.js)      │
└────────┬────────┘
         │
         ├─── MySQL Database
         └─── Doctor Dashboard
              (React)
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

- **Documentation:** Check `docs/` folder
- **Issues:** Open GitHub issue
- **Email:** support@smarthealth.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] WhatsApp integration
- [ ] Telemedicine video calls
- [ ] Prescription management
- [ ] Lab results integration
- [ ] Multi-language support
- [ ] Analytics dashboard

## ⭐ Acknowledgments

- Africa's Talking for USSD/SMS/Voice APIs
- Zenopay for payment integration
- All contributors and testers

---

**Built with ❤️ for accessible healthcare in Africa**
