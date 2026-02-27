@echo off
title Diabetes Risk Engine Launcher
echo =========================================
echo   Diabetes Risk Engine - Starting Up...
echo =========================================
echo.

:: Start Flask backend in a new window
echo [1/2] Starting Flask API server (port 5000)...
start "Flask Backend" cmd /k "cd /d D:\diabetes_model && python app.py"

:: Wait a moment for the backend to initialize
timeout /t 3 /nobreak >nul

:: Start Vite frontend in a new window
echo [2/2] Starting React frontend (port 5173)...
start "Vite Frontend" cmd /k "cd /d D:\diabetes_model\frontend && npm run dev"

:: Wait for Vite to start
timeout /t 5 /nobreak >nul

:: Open in Chrome
echo.
echo Opening in Chrome...
start chrome http://localhost:5173/

echo.
echo =========================================
echo   App is running! 
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo =========================================
echo.
echo Close this window anytime. To stop the app,
echo close the Flask and Vite terminal windows.
pause
