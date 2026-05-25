@echo off
REM Start the TasteMap FastAPI backend
REM Runs on http://127.0.0.1:8000

cd /d "%~dp0..\backend"
echo Starting TasteMap Backend (FastAPI)...
echo Location: %cd%
echo URL: http://127.0.0.1:8000
echo API Docs: http://127.0.0.1:8000/api/v1/docs
echo.

REM Check and activate virtual environment if exists
if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
) else (
    echo Warning: No virtual environment found. Make sure dependencies are installed.
    echo Run: pip install -r requirements.txt
)

REM Start the FastAPI server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
