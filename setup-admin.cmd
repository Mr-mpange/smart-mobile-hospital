@echo off
echo ========================================
echo   SmartHealth Admin Setup
echo ========================================
echo.

echo [1/3] Creating admins table...
node create-admins-table.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create admins table
    pause
    exit /b 1
)
echo.

echo [2/3] Updating doctors table...
node update-doctors-table.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to update doctors table
    pause
    exit /b 1
)
echo.

echo [3/3] Creating admin account...
node create-admin.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create admin
    pause
    exit /b 1
)
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Admin Login:
echo   URL: http://localhost:3000/admin/login
echo   Email: admin@smarthealth.com
echo   Password: admin123
echo.
echo Next steps:
echo   1. Start server: npm start
echo   2. Open: http://localhost:3000/admin/login
echo   3. Login with credentials above
echo.
pause
