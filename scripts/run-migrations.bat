@echo off
REM Run this script ONCE during deployment to apply database migrations
REM DO NOT run this on every container restart

echo 🔄 Running Prisma database migrations...

REM Generate Prisma client
call npx prisma generate

REM Apply pending migrations
call npx prisma migrate deploy

if %ERRORLEVEL% EQU 0 (
  echo ✅ Migrations completed successfully!
) else (
  echo ❌ Migration failed!
  exit /b 1
)
