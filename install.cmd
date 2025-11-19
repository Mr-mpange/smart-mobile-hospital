@echo off
REM SmartHealth Installation Script for Windows
REM Run this file to install all dependencies

echo.
echo ========================================
echo   SmartHealth Installation
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected
node --version
echo.

REM Install backend dependencies
echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend dependencies installed
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo [OK] .env file created
    echo.
    echo [IMPORTANT] Please edit .env file with your credentials!
    echo.
) else (
    echo [OK] .env file already exists
    echo.
)

echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit .env file with your credentials
echo   2. Run: npm run db:setup
echo   3. Run: npm run dev
echo.
echo See WINDOWS_SETUP.md for more help
echo.
pause
