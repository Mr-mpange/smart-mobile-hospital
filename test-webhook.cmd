@echo off
echo ========================================
echo   Testing USSD Webhook Locally
echo ========================================
echo.

echo Testing endpoint: http://localhost:5000/api/ussd
echo.

REM Test with curl
curl -X POST http://localhost:5000/api/ussd -H "Content-Type: application/x-www-form-urlencoded" -d "sessionId=test123&serviceCode=*384*34153#&phoneNumber=+254712345678&text="

echo.
echo.
echo ========================================
echo   Test Complete
echo ========================================
echo.
echo If you see a USSD menu above (CON Welcome...), your endpoint works!
echo.
echo Next steps:
echo   1. Install ngrok: npm install -g ngrok
echo   2. Start ngrok: ngrok http 5000
echo   3. Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
echo   4. Update Africa's Talking callback URL to:
echo      https://your-ngrok-url.ngrok-free.app/api/ussd
echo   5. Test by dialing *384*34153# from your phone
echo.
echo See USSD_WEBHOOK_SETUP.md for detailed instructions.
echo.
pause
