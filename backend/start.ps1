# start.ps1

Write-Host "Starting Docker services..." -ForegroundColor Cyan
docker compose up -d

Write-Host "Waiting for database and redis to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

if (-Not (Test-Path ".venv")) {
    Write-Host "Virtual environment not found! Please run 'python -m venv .venv' first." -ForegroundColor Red
    exit
}

Write-Host "Starting FastAPI Backend..." -ForegroundColor Green
Write-Host "Defaulting to 127.0.0.1:8000. Use CTRL+C to stop." -ForegroundColor Gray
.\.venv\Scripts\uvicorn.exe src.main:app --reload --host 0.0.0.0 --port 8000
