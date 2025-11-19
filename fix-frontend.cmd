@echo off
REM Fix Frontend Dependencies

echo.
echo ========================================
echo   Fixing Frontend Dependencies
echo ========================================
echo.

cd frontend

echo Cleaning old installation...
if exist node_modules (
    rmdir /s /q node_modules
    echo [OK] Removed old node_modules
)

if exist package-lock.json (
    del package-lock.json
    echo [OK] Removed package-lock.json
)

echo.
echo Installing fresh dependencies...
echo This may take a few minutes...
echo.

call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Installation failed!
    echo.
    echo Try this manually:
    echo   cd frontend
    echo   npm install
    echo.
    cd ..
    pause
    exit /b 1
)

echo.
echo [OK] Frontend dependencies installed!
echo.

cd ..

echo ========================================
echo   Fix Complete!
echo ========================================
echo.
echo You can now run:
echo   npm run dev
echo.
echo Or start frontend only:
echo   cd frontend
echo   npm start
echo.
pause
