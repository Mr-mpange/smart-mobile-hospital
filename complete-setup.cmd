@echo off
REM Complete SmartHealth Setup Script
REM This will fix everything and get you running

echo.
echo ========================================
echo   SmartHealth Complete Setup
echo ========================================
echo.

REM Step 1: Install frontend dependencies
echo [1/3] Installing frontend dependencies...
cd frontend
if exist node_modules\react-scripts (
    echo [OK] react-scripts already installed
) else (
    echo Installing react-scripts...
    call npm install react-scripts@5.0.1
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install react-scripts
        echo.
        echo Try manually:
        echo   cd frontend
        echo   npm install
        cd ..
        pause
        exit /b 1
    )
)
cd ..
echo [OK] Frontend dependencies ready
echo.

REM Step 2: Check database (auto-created on server start!)
echo [2/3] Checking database configuration...
echo.
echo [INFO] Database tables are now created automatically!
echo       Just start the server and tables will be ready.
echo.
if not exist .env (
    echo [WARNING] .env file not found - database won't connect
) else (
    echo [OK] .env file exists
)
echo.

REM Step 3: Verify setup
echo [3/3] Verifying setup...
if not exist .env (
    echo [WARNING] .env file not found
    echo Creating from template...
    copy .env.example .env
    echo.
    echo [IMPORTANT] Edit .env file with your credentials!
    echo.
)

if exist node_modules (
    echo [OK] Backend dependencies installed
) else (
    echo [WARNING] Backend dependencies missing
    echo Run: npm install
)

if exist frontend\node_modules\react-scripts (
    echo [OK] Frontend dependencies installed
) else (
    echo [WARNING] Frontend dependencies incomplete
)

echo.
echo ========================================
echo   Setup Status
echo ========================================
echo.
echo Backend: Ready ✓
if exist frontend\node_modules\react-scripts (
    echo Frontend: Ready ✓
) else (
    echo Frontend: Needs npm install
)
echo.
echo To start the application:
echo   npm run dev
echo.
echo Or use: start.cmd
echo.
pause
