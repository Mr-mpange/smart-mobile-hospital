# 🚀 START HERE - Quick Setup

## Current Issues & Solutions

### Issue 1: Frontend Not Starting ❌
**Error:** `'react-scripts' is not recognized`

**Solution:** Install frontend dependencies

### Issue 2: Database Tables Missing ❌
**Error:** `Table 'smarthealth.sms_queue' doesn't exist`

**Solution:** Run database setup

## 🎯 Quick Fix (2 Steps)

### Step 1: Open Command Prompt (NOT PowerShell)

1. Press `Win + R`
2. Type `cmd`
3. Press Enter
4. Navigate to project:
   ```cmd
   cd C:\Users\Administrator\Desktop\one-two\final
   ```

### Step 2: Run These Commands

```cmd
REM Install frontend dependencies
cd frontend
npm install
cd ..

REM Setup database (creates all tables)
npm run db:setup

REM Start the application
npm run dev
```

## ⚡ Even Easier (One-Click)

Just double-click: **`complete-setup.cmd`**

This will:
- ✅ Install frontend dependencies
- ✅ Setup database tables
- ✅ Verify everything is ready

Then double-click: **`start.cmd`** to run the app

## 🔍 What's Happening

### Backend ✅ Working!
```
✅ Database connected successfully
✅ Server running on port 5000
```

### Frontend ❌ Needs Fix
```
❌ react-scripts not installed
```

### Database ❌ Needs Setup
```
❌ Tables don't exist yet
```

## 📋 Manual Steps (If Scripts Don't Work)

### 1. Install Frontend Dependencies

Open **Command Prompt** (not PowerShell):

```cmd
cd C:\Users\Administrator\Desktop\one-two\final\frontend
npm install
```

Wait for installation to complete (may take 2-3 minutes).

### 2. Setup Database

Make sure MySQL is running, then:

```cmd
cd C:\Users\Administrator\Desktop\one-two\final
npm run db:setup
```

This creates all database tables.

### 3. Start Application

```cmd
npm run dev
```

## ✅ Verification

After setup, you should see:

```
Backend: http://localhost:5000 ✓
Frontend: http://localhost:3000 ✓
```

Open browser and go to http://localhost:3000

## 🔑 Default Login

```
Email: john.kamau@smarthealth.com
Password: doctor123
```

## ⚠️ Important: Use CMD, Not PowerShell

PowerShell has script execution disabled on your system.

**Use Command Prompt (cmd.exe) for all npm commands!**

Or double-click the `.cmd` files I created.

## 🆘 Still Having Issues?

### MySQL Not Running?

```cmd
net start MySQL80
```

### Port Already in Use?

```cmd
netstat -ano | findstr :5000
taskkill /PID <number> /F
```

### Need to Reset Everything?

```cmd
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
cd ..
npm run db:setup
```

## 📚 More Help

- **WINDOWS_SETUP.md** - Complete Windows guide
- **QUICK_FIX.md** - Frontend fix guide
- **INSTALLATION.md** - Detailed installation

---

**TL;DR:** 
1. Open Command Prompt (not PowerShell)
2. Run: `cd frontend && npm install && cd ..`
3. Run: `npm run db:setup`
4. Run: `npm run dev`

**Or just double-click `complete-setup.cmd`!** 🎉
