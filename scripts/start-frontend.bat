@echo off
REM Start the TasteMap Next.js frontend
REM Runs on http://localhost:3000

cd /d "%~dp0..\frontend"
echo Starting TasteMap Frontend (Next.js)...
echo Location: %cd%
echo URL: http://localhost:3000
echo.
npm run dev
