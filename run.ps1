Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "            TubeSage AI - Starting Services         " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Starting Backend Server (FastAPI on Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "[2/2] Starting Frontend App (Vite on Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "TubeSage AI is running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Green

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
