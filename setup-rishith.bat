@echo off
echo ========================================
echo   Cryptocurrency Alerts Setup for Rishith
echo ========================================
echo.
echo Your email: rishith2204086@gmail.com
echo.

echo Step 1: Setting up backend environment...
cd server
if not exist .env (
    copy env-backend.example .env
    echo ✓ Backend .env file created
) else (
    echo ⚠ Backend .env file already exists
)

echo.
echo Step 2: Setting up frontend environment...
cd ..
if not exist .env (
    copy env-template.txt .env
    echo ✓ Frontend .env file created
) else (
    echo ⚠ Frontend .env file already exists
)

echo.
echo ========================================
echo   NEXT STEPS REQUIRED:
echo ========================================
echo.
echo 1. Edit server\.env and set your Gmail App Password:
echo    EMAIL_USER=rishith2204086@gmail.com
echo    EMAIL_APP_PASSWORD=your_16_character_app_password
echo.
echo 2. To get Gmail App Password:
echo    - Go to Google Account settings
echo    - Security → 2-Step Verification → App passwords
echo    - Generate password for "Mail"
echo.
echo 3. Start the backend server:
echo    cd server && npm install && npm run dev
echo.
echo 4. Start the frontend server:
echo    npm run dev
echo.
echo ========================================
pause
