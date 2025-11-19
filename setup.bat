@echo off
REM SmartHealth Setup Script for Windows
REM This script automates the installation process

echo ========================================
echo    SmartHealth Setup Script
echo    Automated Installation
echo ========================================
echo.

REM Check Node.js
echo Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+ first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected
node --version

REM Check MySQL
echo Checking MySQL installation...
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MySQL is not installed. Please install MySQL 8+ first.
    pause
    exit /b 1
)

echo [OK] MySQL detected
echo.

REM Install backend dependencies
echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo [OK] Dependencies installed
echo.

REM Setup environment file
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo [OK] .env file created
    echo.
    echo [IMPORTANT] Please edit .env file with your credentials:
    echo    - Database password
    echo    - Africa's Talking API key
    echo    - Zenopay credentials
    echo    - JWT secret
    echo.
    pause
) else (
    echo [OK] .env file already exists
)

REM Setup database
echo.
set /p SETUP_DB="Do you want to setup the database now? (y/n): "
if /i "%SETUP_DB%"=="y" (
    call npm run db:setup
    echo [OK] Database setup complete
) else (
    echo [WARNING] Skipping database setup. Run 'npm run db:setup' later.
)

REM Success message
echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo To start the application:
echo   npm run dev
echo.
echo Access points:
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo Default login:
echo   Email:    john.kamau@smarthealth.com
echo   Password: doctor123
echo.
echo For more information, see:
echo   - INSTALLATION.md
echo   - docs\API.md
echo   - docs\USSD_FLOW.md
echo.
pause
