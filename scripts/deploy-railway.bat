@echo off
REM deploy-railway.bat - Deploy to Railway (Windows)

echo 🚀 Deploying to Railway...

REM Check if railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
)

REM Login to Railway
echo 🔐 Checking Railway authentication...
railway login

REM Link to project
echo 🔗 Linking to Railway project...
railway link

REM Set environment variables reminder
echo 📝 Setting up environment variables...
echo ⚠️  Please set these environment variables in Railway Dashboard:
echo    - DATABASE_URL
echo    - NEXTAUTH_SECRET
echo    - NEXTAUTH_URL
echo    - SMSIR_API_KEY
echo    - NEXT_PUBLIC_NESHAN_MAP_KEY
echo    - NEXT_PUBLIC_NESHAN_API_KEY
echo    - APP_BASE_URL
echo    - ORS_API_SECRET

REM Deploy
echo 🚀 Deploying application...
railway up

echo ✅ Deployment completed!
echo 🌐 Your app will be available at your Railway domain

pause
