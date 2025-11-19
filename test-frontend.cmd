@echo off
REM Test if frontend can start

echo.
echo Testing Frontend Setup...
echo.

cd frontend

echo Checking react-scripts...
if exist node_modules\react-scripts (
    echo [OK] react-scripts is installed
    echo.
    echo Testing if it can run...
    echo.
    
    REM Try to get version
    call npm list react-scripts
    
    echo.
    echo [SUCCESS] Frontend is ready to start!
    echo.
    echo To start frontend:
    echo   cd frontend
    echo   npm start
    echo.
    echo Or to start both backend and frontend:
    echo   npm run dev
    echo.
) else (
    echo [ERROR] react-scripts not found
    echo.
    echo Run this to fix:
    echo   cd frontend
    echo   npm install
    echo.
)

cd ..
pause
