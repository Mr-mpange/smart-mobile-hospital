@echo off
echo ========================================
echo   SmartHealth - Complete Setup
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo [IMPORTANT] Edit .env file with your credentials!
    echo.
    pause
)

REM Install backend dependencies
echo [1/2] Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend installation failed
    pause
    exit /b 1
)
echo [OK] Backend ready
echo.

REM Install frontend dependencies
echo [2/2] Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend installation failed
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend ready
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Database tables will be created automatically on first start.
echo.
echo To start the application:
echo   - Double-click: start.cmd
echo   - Or run: npm run dev
echo.
echo Default login:
echo   Email: john.kamau@smarthealth.com
echo   Password: doctor123
echo.
pause
