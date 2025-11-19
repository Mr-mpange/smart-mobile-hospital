# 🚀 Quick Start Guide

## Installation (3 Steps)

### 1. Install Dependencies

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your MySQL password and API keys.

### 3. Start Application

```bash
npm run dev
```

That's it! The system will:
- ✅ Create database automatically
- ✅ Create all tables automatically
- ✅ Insert sample doctors
- ✅ Start backend (port 5000)
- ✅ Start frontend (port 3000)

## Access

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## Default Login

```
Email: john.kamau@smarthealth.com
Password: doctor123
```

## USSD Setup (For Testing)

Your USSD endpoint is at `/api/ussd` but Africa's Talking can't reach `localhost`.

**Quick Solution:**

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok (in new terminal)
ngrok http 5000

# Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
# Update Africa's Talking callback to:
# https://abc123.ngrok-free.app/api/ussd
```

Now dial your USSD code to test!

## Troubleshooting

### Frontend Won't Start
```bash
cd frontend
npm install
cd ..
npm run dev
```

### Database Connection Failed
```bash
# Start MySQL
net start MySQL80

# Check .env credentials
DB_PASSWORD=your_actual_password
```

### Port Already in Use
```bash
netstat -ano | findstr :5000
taskkill /PID <number> /F
```

## Next Steps

- See **README.md** for full documentation
- See **INSTALLATION.md** for detailed setup
- See **docs/** folder for API docs and guides

## Windows Users

Use **Command Prompt (cmd)**, not PowerShell.

Or double-click:
- `install.cmd` - Install dependencies
- `start.cmd` - Start application
- `complete-setup.cmd` - Full setup

---

**Need help?** Check README.md or open an issue on GitHub.
