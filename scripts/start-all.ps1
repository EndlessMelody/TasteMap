# Start both TasteMap servers (Backend + Frontend) in separate windows

$projectRoot = Split-Path -Parent $PSScriptRoot
$scriptsPath = $PSScriptRoot

Write-Host "Launching TasteMap servers..." -ForegroundColor Cyan
Write-Host ""

# Launch backend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptsPath\start-backend.ps1"

# Small delay so the backend window opens first
Start-Sleep -Milliseconds 500

# Launch frontend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptsPath\start-frontend.ps1"

Write-Host "Backend  → http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Frontend → http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Both servers are starting in separate windows." -ForegroundColor Yellow
