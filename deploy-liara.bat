@echo off
REM deploy-liara.bat - Deploy to Liara (Windows)

echo 🚀 Deploying to Liara...

REM Check if Liara CLI is installed
liara --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Liara CLI not found. Installing...
    npm install -g @liara/cli
)

REM Login to Liara
echo 🔐 Login to Liara...
liara login

REM Deploy to Liara
echo 🚀 Deploying application...
liara deploy

echo ✅ Deployment completed!
echo 🌐 Your app will be available at: https://mrshoofer-client.liara.run
echo.
echo 📝 Don't forget to set environment variables in Liara dashboard:
echo    - DATABASE_URL
echo    - NEXTAUTH_SECRET
echo    - NEXTAUTH_URL
echo    - SMSIR_API_KEY
echo    - NEXT_PUBLIC_NESHAN_MAP_KEY
echo    - NEXT_PUBLIC_NESHAN_API_KEY
echo    - APP_BASE_URL
echo    - ORS_API_SECRET

pause
