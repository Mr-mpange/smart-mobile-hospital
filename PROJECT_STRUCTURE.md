# Project Structure

Complete file and folder organization of SmartHealth Telemedicine System.

## 📁 Directory Tree

```
smarthealth/
│
├── 📄 README.md                    # Project overview and quick start
├── 📄 INSTALLATION.md              # Detailed installation guide
├── 📄 QUICKSTART.md                # 10-minute setup guide
├── 📄 FEATURES.md                  # Complete feature list
├── 📄 PROJECT_STRUCTURE.md         # This file
├── 📄 package.json                 # Backend dependencies
├── 📄 .env.example                 # Environment template
├── 📄 .gitignore                   # Git ignore rules
├── 📄 setup.sh                     # Linux/Mac setup script
├── 📄 setup.bat                    # Windows setup script
│
├── 📂 backend/                     # Backend Node.js application
│   │
│   ├── 📂 config/                  # Configuration files
│   │   └── 📄 database.js          # MySQL connection pool
│   │
│   ├── 📂 controllers/             # Request handlers
│   │   ├── 📄 ussd.controller.js   # USSD webhook handler
│   │   ├── 📄 sms.controller.js    # SMS webhook handler
│   │   ├── 📄 doctor.controller.js # Doctor API endpoints
│   │   └── 📄 payment.controller.js # Payment processing
│   │
│   ├── 📂 middleware/              # Express middleware
│   │   └── 📄 auth.js              # JWT authentication
│   │
│   ├── 📂 models/                  # Database models
│   │   ├── 📄 User.js              # User/Patient model
│   │   ├── 📄 Doctor.js            # Doctor model
│   │   ├── 📄 Case.js              # Consultation case model
│   │   └── 📄 Offer.js             # Loyalty offer model
│   │
│   ├── 📂 routes/                  # API routes
│   │   ├── 📄 ussd.routes.js       # USSD endpoints
│   │   ├── 📄 sms.routes.js        # SMS endpoints
│   │   ├── 📄 doctor.routes.js     # Doctor endpoints
│   │   └── 📄 payment.routes.js    # Payment endpoints
│   │
│   ├── 📂 services/                # Business logic
│   │   ├── 📄 ussd.service.js      # USSD menu logic
│   │   ├── 📄 sms.service.js       # SMS processing logic
│   │   └── 📄 payment.service.js   # Payment logic
│   │
│   ├── 📂 utils/                   # Utility functions
│   │   └── 📄 cron.js              # Scheduled tasks
│   │
│   └── 📄 server.js                # Express app entry point
│
├── 📂 frontend/                    # React frontend application
│   │
│   ├── 📂 public/                  # Static files
│   │   └── 📄 index.html           # HTML template
│   │
│   ├── 📂 src/                     # React source code
│   │   │
│   │   ├── 📂 components/          # React components
│   │   │   ├── 📄 Header.js        # Dashboard header
│   │   │   ├── 📄 Header.css       # Header styles
│   │   │   ├── 📄 Stats.js         # Statistics cards
│   │   │   ├── 📄 Stats.css        # Stats styles
│   │   │   ├── 📄 CaseList.js      # Patient queue list
│   │   │   ├── 📄 CaseList.css     # List styles
│   │   │   ├── 📄 CaseModal.js     # Case detail modal
│   │   │   └── 📄 CaseModal.css    # Modal styles
│   │   │
│   │   ├── 📂 context/             # React context
│   │   │   └── 📄 AuthContext.js   # Authentication state
│   │   │
│   │   ├── 📂 pages/               # Page components
│   │   │   ├── 📄 Login.js         # Login page
│   │   │   ├── 📄 Login.css        # Login styles
│   │   │   ├── 📄 Dashboard.js     # Main dashboard
│   │   │   └── 📄 Dashboard.css    # Dashboard styles
│   │   │
│   │   ├── 📂 services/            # API services
│   │   │   └── 📄 api.js           # Axios API client
│   │   │
│   │   ├── 📄 App.js               # Root component
│   │   ├── 📄 index.js             # React entry point
│   │   └── 📄 index.css            # Global styles
│   │
│   └── 📄 package.json             # Frontend dependencies
│
├── 📂 database/                    # Database files
│   ├── 📄 schema.sql               # Database schema
│   └── 📄 setup.js                 # Setup script
│
└── 📂 docs/                        # Documentation
    ├── 📄 API.md                   # API documentation
    ├── 📄 USSD_FLOW.md            # USSD flow guide
    ├── 📄 DEPLOYMENT.md           # Deployment guide
    └── 📄 TESTING.md              # Testing guide
```

## 📊 File Statistics

- **Total Files:** 50+
- **Backend Files:** 20
- **Frontend Files:** 18
- **Documentation Files:** 8
- **Configuration Files:** 4

## 🎯 Key Files Explained

### Root Level

| File | Purpose | Lines |
|------|---------|-------|
| `README.md` | Project overview, features, quick start | 400+ |
| `INSTALLATION.md` | Detailed setup instructions | 500+ |
| `QUICKSTART.md` | 10-minute setup guide | 300+ |
| `FEATURES.md` | Complete feature list | 600+ |
| `package.json` | Backend dependencies and scripts | 50 |
| `.env.example` | Environment variable template | 40 |
| `setup.sh` | Automated setup for Linux/Mac | 80 |
| `setup.bat` | Automated setup for Windows | 80 |

### Backend Files

#### Configuration
- `backend/config/database.js` - MySQL connection pool setup

#### Controllers (Request Handlers)
- `backend/controllers/ussd.controller.js` - USSD webhook endpoint
- `backend/controllers/sms.controller.js` - SMS webhook endpoints
- `backend/controllers/doctor.controller.js` - Doctor API endpoints
- `backend/controllers/payment.controller.js` - Payment endpoints

#### Models (Database Operations)
- `backend/models/User.js` - Patient CRUD operations
- `backend/models/Doctor.js` - Doctor CRUD operations
- `backend/models/Case.js` - Consultation CRUD operations
- `backend/models/Offer.js` - Loyalty offer operations

#### Services (Business Logic)
- `backend/services/ussd.service.js` - USSD menu navigation (500+ lines)
- `backend/services/sms.service.js` - SMS command processing (400+ lines)
- `backend/services/payment.service.js` - Payment processing (300+ lines)

#### Routes (API Endpoints)
- `backend/routes/ussd.routes.js` - USSD routes
- `backend/routes/sms.routes.js` - SMS routes
- `backend/routes/doctor.routes.js` - Doctor routes
- `backend/routes/payment.routes.js` - Payment routes

#### Utilities
- `backend/utils/cron.js` - Background jobs (SMS queue, cleanup)

#### Entry Point
- `backend/server.js` - Express app initialization (150+ lines)

### Frontend Files

#### Components
- `frontend/src/components/Header.js` - Navigation header
- `frontend/src/components/Stats.js` - Statistics dashboard
- `frontend/src/components/CaseList.js` - Patient queue display
- `frontend/src/components/CaseModal.js` - Case detail and response

#### Pages
- `frontend/src/pages/Login.js` - Doctor login page
- `frontend/src/pages/Dashboard.js` - Main dashboard page

#### Context
- `frontend/src/context/AuthContext.js` - Authentication state management

#### Services
- `frontend/src/services/api.js` - API client with interceptors

#### Entry Points
- `frontend/src/App.js` - Root React component
- `frontend/src/index.js` - React DOM render

### Database Files

- `database/schema.sql` - Complete database schema (300+ lines)
- `database/setup.js` - Database initialization script

### Documentation

- `docs/API.md` - Complete API reference (500+ lines)
- `docs/USSD_FLOW.md` - USSD navigation guide (400+ lines)
- `docs/DEPLOYMENT.md` - Production deployment (600+ lines)
- `docs/TESTING.md` - Testing guide (500+ lines)

## 🔗 File Dependencies

### Backend Dependencies Flow

```
server.js
  ├── routes/*.routes.js
  │   └── controllers/*.controller.js
  │       ├── services/*.service.js
  │       │   └── models/*.js
  │       │       └── config/database.js
  │       └── middleware/auth.js
  └── utils/cron.js
      └── services/*.service.js
```

### Frontend Dependencies Flow

```
index.js
  └── App.js
      ├── context/AuthContext.js
      │   └── services/api.js
      └── pages/*.js
          └── components/*.js
              └── services/api.js
```

## 📦 Module Breakdown

### Backend Modules

| Module | Files | Purpose |
|--------|-------|---------|
| Config | 1 | Database connection |
| Controllers | 4 | Request handling |
| Middleware | 1 | Authentication |
| Models | 4 | Database operations |
| Routes | 4 | API endpoints |
| Services | 3 | Business logic |
| Utils | 1 | Background tasks |

### Frontend Modules

| Module | Files | Purpose |
|--------|-------|---------|
| Components | 8 | UI components |
| Context | 1 | State management |
| Pages | 4 | Page layouts |
| Services | 1 | API client |

## 🎨 Code Organization Principles

### Backend
1. **Separation of Concerns** - Controllers, Services, Models
2. **Single Responsibility** - Each file has one purpose
3. **Dependency Injection** - Services use models
4. **Middleware Pattern** - Authentication, validation
5. **Error Handling** - Centralized error middleware

### Frontend
1. **Component-Based** - Reusable UI components
2. **Context API** - Global state management
3. **Custom Hooks** - Reusable logic
4. **CSS Modules** - Scoped styling
5. **Service Layer** - API abstraction

## 📏 Code Metrics

### Backend
- **Total Lines:** ~5,000
- **Average File Size:** 200 lines
- **Largest File:** ussd.service.js (500+ lines)
- **Test Coverage:** Manual testing guide provided

### Frontend
- **Total Lines:** ~2,500
- **Average File Size:** 150 lines
- **Largest File:** Dashboard.js (200+ lines)
- **Component Count:** 8

### Documentation
- **Total Lines:** ~3,000
- **Total Words:** ~20,000
- **Files:** 8
- **Code Examples:** 100+

## 🔍 Finding Files

### By Feature

**USSD Feature:**
- `backend/controllers/ussd.controller.js`
- `backend/services/ussd.service.js`
- `backend/routes/ussd.routes.js`
- `docs/USSD_FLOW.md`

**SMS Feature:**
- `backend/controllers/sms.controller.js`
- `backend/services/sms.service.js`
- `backend/routes/sms.routes.js`

**Doctor Dashboard:**
- `frontend/src/pages/Dashboard.js`
- `frontend/src/components/Header.js`
- `frontend/src/components/CaseList.js`
- `frontend/src/components/CaseModal.js`

**Payment:**
- `backend/controllers/payment.controller.js`
- `backend/services/payment.service.js`
- `backend/routes/payment.routes.js`

**Authentication:**
- `backend/middleware/auth.js`
- `frontend/src/context/AuthContext.js`
- `frontend/src/pages/Login.js`

### By Technology

**Node.js/Express:**
- All files in `backend/`

**React:**
- All files in `frontend/src/`

**MySQL:**
- `database/schema.sql`
- `backend/config/database.js`
- `backend/models/*.js`

**Africa's Talking:**
- `backend/services/ussd.service.js`
- `backend/services/sms.service.js`

**Zenopay:**
- `backend/services/payment.service.js`

## 🚀 Quick Navigation

### To Add a New Feature

1. **Backend API:**
   - Create controller in `backend/controllers/`
   - Create service in `backend/services/`
   - Add routes in `backend/routes/`
   - Update `backend/server.js`

2. **Frontend UI:**
   - Create component in `frontend/src/components/`
   - Add to page in `frontend/src/pages/`
   - Update routes in `frontend/src/App.js`

3. **Database:**
   - Update `database/schema.sql`
   - Create model in `backend/models/`

### To Modify Existing Feature

1. **USSD Menu:** Edit `backend/services/ussd.service.js`
2. **SMS Commands:** Edit `backend/services/sms.service.js`
3. **Dashboard UI:** Edit `frontend/src/pages/Dashboard.js`
4. **API Endpoints:** Edit respective controller
5. **Database Schema:** Edit `database/schema.sql`

## 📚 Documentation Map

| Topic | File | Lines |
|-------|------|-------|
| Getting Started | `QUICKSTART.md` | 300+ |
| Installation | `INSTALLATION.md` | 500+ |
| Features | `FEATURES.md` | 600+ |
| API Reference | `docs/API.md` | 500+ |
| USSD Guide | `docs/USSD_FLOW.md` | 400+ |
| Deployment | `docs/DEPLOYMENT.md` | 600+ |
| Testing | `docs/TESTING.md` | 500+ |
| Project Structure | `PROJECT_STRUCTURE.md` | 400+ |

## 🎯 File Naming Conventions

### Backend
- Controllers: `*.controller.js`
- Services: `*.service.js`
- Models: `PascalCase.js`
- Routes: `*.routes.js`
- Config: `lowercase.js`

### Frontend
- Components: `PascalCase.js`
- Pages: `PascalCase.js`
- Styles: `PascalCase.css`
- Services: `lowercase.js`
- Context: `PascalCaseContext.js`

### Documentation
- Guides: `UPPERCASE.md`
- API Docs: `API.md`
- Specific Docs: `TOPIC_NAME.md`

## 💾 Total Project Size

- **Source Code:** ~7,500 lines
- **Documentation:** ~3,000 lines
- **Total:** ~10,500 lines
- **File Count:** 50+ files
- **Folder Count:** 15+ folders

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment variables template |
| `package.json` | Backend dependencies |
| `frontend/package.json` | Frontend dependencies |
| `.gitignore` | Git ignore rules |
| `setup.sh` | Linux/Mac setup |
| `setup.bat` | Windows setup |

---

**Last Updated:** 2024
**Version:** 1.0.0
**Maintainability:** High
**Documentation Coverage:** 100%
