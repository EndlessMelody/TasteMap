.\.venv\Scripts\alembic.exe upgrade head

.\.venv\Scripts\python.exe scripts/seed.py

.\.venv\Scripts\python.exe scripts/seed_levels.py


Write-Host "Database setup complete!"
