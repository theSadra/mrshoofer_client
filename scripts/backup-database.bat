@echo off
REM Database Backup Script for MrShoofer (Windows)
REM Run this script regularly to create backups before migrations

setlocal enabledelayedexpansion

REM Configuration
set BACKUP_DIR=backups
set TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\backup_%TIMESTAMP%.sql

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Load DATABASE_URL from .env
if not exist .env (
    echo ❌ .env file not found
    exit /b 1
)

for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr "DATABASE_URL"') do (
    set DATABASE_URL=%%b
)

if "%DATABASE_URL%"=="" (
    echo ❌ DATABASE_URL not found in .env
    exit /b 1
)

echo 🔄 Creating database backup...
echo 📁 Backup location: %BACKUP_FILE%

REM Use pg_dump to create backup
REM Note: This requires PostgreSQL client tools to be installed and in PATH
REM Download from: https://www.postgresql.org/download/windows/

pg_dump "%DATABASE_URL%" > "%BACKUP_FILE%" 2>&1

if %errorlevel% equ 0 (
    echo ✅ Backup created successfully!
    for %%A in ("%BACKUP_FILE%") do echo 📊 Backup size: %%~zA bytes
    
    REM Keep only last 10 backups
    for /f "skip=10 delims=" %%F in ('dir /b /o-d "%BACKUP_DIR%\backup_*.sql" 2^>nul') do (
        del "%BACKUP_DIR%\%%F"
        echo 🧹 Deleted old backup: %%F
    )
) else (
    echo ❌ Backup failed - make sure PostgreSQL client tools are installed
    echo Download from: https://www.postgresql.org/download/windows/
    exit /b 1
)

echo.
echo 💡 Tip: Run this script before any database migrations!
