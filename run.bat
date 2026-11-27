@echo off
title TubeSage AI Launcher
echo ===================================================
echo             TubeSage AI - Starting Services
echo ===================================================
echo.

echo [1/2] Starting Backend Server (FastAPI on Port 8000)...
start "TubeSage Backend" cmd /k "cd backend && python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting Frontend App (Vite on Port 5173)...
start "TubeSage Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo TubeSage AI is launching!
echo Frontend will be live at: http://localhost:5173
echo Backend API is live at:   http://localhost:8000
echo ===================================================
timeout /t 3 >nul
start http://localhost:5173
