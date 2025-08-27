@echo off
echo Starting Cryptocurrency Alert System...
echo.

echo Starting Backend Server (Nodemailer)...
start "Backend Server" cmd /k "cd server && npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Vite)...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5176
echo.
echo Press any key to close this window...
pause >nul
