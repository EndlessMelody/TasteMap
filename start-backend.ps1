# Start the TasteMap FastAPI backend
# Runs on http://127.0.0.1:8000

$currentDir = Get-Location
$backendPath = "$currentDir\backend"

Write-Host "Starting TasteMap Backend (FastAPI)..." -ForegroundColor Cyan
Write-Host "Location: $backendPath" -ForegroundColor Gray
Write-Host "URL: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "API Docs: http://127.0.0.1:8000/api/v1/docs" -ForegroundColor Green
Write-Host ""

Set-Location $backendPath

# Check if virtual environment exists and activate it
$venvPath = Join-Path $backendPath ".venv"
$venvScripts = Join-Path $venvPath "Scripts"
$activateScript = Join-Path $venvScripts "Activate.ps1"

if (Test-Path $activateScript) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & $activateScript
}
else {
    Write-Host "Warning: No virtual environment found at $venvPath" -ForegroundColor Yellow
    Write-Host "Make sure dependencies are installed: pip install -r requirements.txt" -ForegroundColor Yellow
}

# Start the FastAPI server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
