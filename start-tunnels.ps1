 # start-tunnels.ps1
Write-Host "Starting TasteMap Network Tunnels..." -ForegroundColor Cyan
Write-Host "This will expose your local servers to the internet securely via HTTPS." -ForegroundColor Yellow
Write-Host "It allows your friends to join your lobby and Voice Chat securely!" -ForegroundColor Green

# We only need to tunnel the frontend (Port 3000) now, because we configured 
# Next.js rewrites to automatically proxy the backend APIs and WebSockets!
Write-Host "`nStarting Frontend Tunnel on port 3000..." -ForegroundColor Gray
Write-Host "Using localhost.run (SSH Tunnel). This handles heavy Next.js assets much better!" -ForegroundColor Cyan

# Use built-in Windows SSH to port forward with explicit IPv4 binding to bypass 502s
ssh -o StrictHostKeyChecking=accept-new -R 80:127.0.0.1:3000 nokey@localhost.run
