# 🔧 Quick Fix - Frontend Not Starting

## Problem

You're seeing: `'react-scripts' is not recognized`

## Solution (Choose One)

### Option 1: Use the Fix Script (Easiest)

Double-click: **`fix-frontend.cmd`**

This will:
- Clean old installation
- Install fresh dependencies
- Fix the issue automatically

### Option 2: Manual Fix (Command Prompt)

```cmd
cd frontend
del package-lock.json
rmdir /s /q node_modules
npm install
cd ..
```

### Option 3: Use NPM Directly

```cmd
cd frontend
npm install react-scripts@5.0.1
cd ..
```

## After Fixing

Start the application:

```cmd
npm run dev
```

Or start frontend only:

```cmd
cd frontend
npm start
```

## What Was Wrong?

The `package.json` had `react-scripts` set to `^0.0.0` (invalid version). I've fixed it to `5.0.1`.

## Verification

After installation, check:

```cmd
cd frontend
npm list react-scripts
```

Should show: `react-scripts@5.0.1`

## Still Having Issues?

Try installing from the root:

```cmd
npm run dev
```

This will install all dependencies and start both servers.

---

**Quick Fix:** Just double-click `fix-frontend.cmd` 🚀
