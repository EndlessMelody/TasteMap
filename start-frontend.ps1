# Start the TasteMap Next.js frontend
# Runs on http://localhost:3000

$currentDir = Get-Location
$frontendPath = "$currentDir\frontend"

Write-Host "Starting TasteMap Frontend (Next.js)..." -ForegroundColor Cyan
Write-Host "Location: $frontendPath" -ForegroundColor Gray
Write-Host "URL: http://localhost:3000" -ForegroundColor Green
Write-Host ""

Set-Location $frontendPath
npm run dev
