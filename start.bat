@echo off
echo ========================================
echo   CSKarma - Starting Application
echo ========================================
echo.

echo [1/3] Starting Backend...
start "CSKarma Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend...
start "CSKarma Frontend" cmd /k "cd web && npm run dev"
timeout /t 2 /nobreak >nul

echo [3/3] Opening Browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo   CSKarma is running!
echo ========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000
echo ========================================
echo.
echo Press any key to stop all services...
pause >nul

echo.
echo Stopping services...
taskkill /FI "WINDOWTITLE eq CSKarma Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq CSKarma Frontend*" /T /F >nul 2>&1

echo Done!
