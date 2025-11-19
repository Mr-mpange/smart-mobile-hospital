@echo off
REM SmartHealth Start Script for Windows
REM Starts both backend and frontend servers

echo.
echo ========================================
echo   Starting SmartHealth
echo ========================================
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo [ERROR] Dependencies not installed!
    echo Please run: install.cmd
    pause
    exit /b 1
)

if not exist frontend\node_modules (
    echo [ERROR] Frontend dependencies not installed!
    echo Please run: install.cmd
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please copy .env.example to .env and configure it
    pause
    exit /b 1
)

echo Starting servers...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

REM Start both servers
call npm run dev
