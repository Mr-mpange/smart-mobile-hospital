# 🪟 Windows Setup Guide

## PowerShell Execution Policy Issue

You're seeing this error because PowerShell scripts are disabled on your system.

### Quick Fix

Run PowerShell as Administrator and execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try again.

## Complete Setup Steps for Windows

### Step 1: Enable PowerShell Scripts (One-time)

1. **Open PowerShell as Administrator:**
   - Press `Win + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Run this command:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Type `Y` and press Enter**

### Step 2: Install Backend Dependencies

Open Command Prompt or PowerShell in the project root:

```cmd
npm install
```

### Step 3: Install Frontend Dependencies

```cmd
cd frontend
npm install
cd ..
```

### Step 4: Configure Environment

```cmd
copy .env.example .env
notepad .env
```

Edit the `.env` file with your credentials.

### Step 5: Setup Database

Make sure MySQL is running, then:

```cmd
npm run db:setup
```

### Step 6: Start the Application

**Option 1: Start Both (Backend + Frontend)**
```cmd
npm run dev
```

**Option 2: Start Separately**

Terminal 1 (Backend):
```cmd
npm start
```

Terminal 2 (Frontend):
```cmd
cd frontend
npm start
```

## Alternative: Use CMD Instead of PowerShell

If you can't change execution policy, use Command Prompt (CMD):

1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to project:
   ```cmd
   cd C:\Users\Administrator\Desktop\one-two\final
   ```
4. Run commands using `npm` directly

## Alternative: Use Git Bash

If you have Git installed:

1. Right-click in project folder
2. Select "Git Bash Here"
3. Run commands:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   npm run db:setup
   npm run dev
   ```

## Troubleshooting

### Issue: "npm is not recognized"

**Solution:** Add Node.js to PATH

1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Go to "Advanced" tab → "Environment Variables"
3. Under "System variables", find "Path"
4. Click "Edit" → "New"
5. Add: `C:\Program Files\nodejs\`
6. Click OK, restart terminal

### Issue: "MySQL connection failed"

**Solution:** Start MySQL service

```cmd
net start MySQL80
```

Or use Services app:
1. Press `Win + R`, type `services.msc`
2. Find "MySQL80" or "MySQL"
3. Right-click → Start

### Issue: Port already in use

**Solution:** Kill the process

```cmd
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

## Quick Start Commands (CMD)

```cmd
REM Install dependencies
npm install
cd frontend
npm install
cd ..

REM Setup database
npm run db:setup

REM Start application
npm run dev
```

## Quick Start Commands (PowerShell - After Fixing Policy)

```powershell
# Install dependencies
npm install
Set-Location frontend
npm install
Set-Location ..

# Setup database
npm run db:setup

# Start application
npm run dev
```

## Verification

After setup, verify:

1. **Backend:** http://localhost:5000
2. **Frontend:** http://localhost:3000

You should see:
- Backend: API info JSON
- Frontend: Login page

## Default Login

```
Email: john.kamau@smarthealth.com
Password: doctor123
```

## Common Windows-Specific Issues

### 1. Long Path Names

If you get "path too long" errors:

```cmd
# Enable long paths
reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1 /f
```

### 2. Antivirus Blocking

Add project folder to antivirus exclusions:
- Windows Defender: Settings → Virus & threat protection → Exclusions

### 3. Firewall Blocking

Allow Node.js through firewall:
1. Windows Firewall → Allow an app
2. Find Node.js or add manually
3. Allow both Private and Public networks

## Using Windows Terminal (Recommended)

Install Windows Terminal from Microsoft Store for better experience:

1. Install "Windows Terminal" from Microsoft Store
2. Open Windows Terminal
3. Navigate to project
4. Run commands

## Using VS Code Terminal

If using VS Code:

1. Open project in VS Code
2. Press `` Ctrl + ` `` to open terminal
3. Select "Command Prompt" or "PowerShell" from dropdown
4. Run commands

## Setup Script for Windows

Create `setup.cmd` in project root:

```cmd
@echo off
echo Installing SmartHealth...
echo.

echo Installing backend dependencies...
call npm install

echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your credentials
echo 2. Run: npm run db:setup
echo 3. Run: npm run dev
echo.
pause
```

Run it:
```cmd
setup.cmd
```

## Summary

**Recommended approach for Windows:**

1. Use Command Prompt (CMD) instead of PowerShell
2. Or fix PowerShell execution policy once
3. Install dependencies with `npm install`
4. Configure `.env` file
5. Setup database with `npm run db:setup`
6. Start with `npm run dev`

**That's it!** 🚀

---

**Need help?** See INSTALLATION.md for more details.
