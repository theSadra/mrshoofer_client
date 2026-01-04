# Deploy to fix ORS 403 error
# This script will deploy the updated code to production

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🚀 Deploying ORS Protection Fix" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Navigate to project directory
Set-Location "c:\Users\doros\OneDrive\Desktop\MrShoofer client webapp\mrshoofer_client"

Write-Host "📦 Files modified:" -ForegroundColor Yellow
Write-Host "  ✅ middleware.ts (triple bypass + centralized public routes)"
Write-Host "  ✅ lib/public-routes.ts (NEW - centralized route config)"
Write-Host "  ✅ next.config.js (headers for ORS routes)"
Write-Host "  ✅ app/ORS/layout.tsx (public layout)"
Write-Host "  ✅ app/ORS/api/register/route.ts (NEW endpoint)"
Write-Host "  ✅ app/ORS/api/debug/route.ts (NEW debug endpoint)"
Write-Host "  ✅ app/ORS/api/test/route.ts (updated config)"
Write-Host "  ✅ app/ORS/api/trip/route.tsx (updated config)"
Write-Host "  ✅ app/ORS/api/trip/cancel/route.tsx (updated config)"
Write-Host ""

Write-Host "🔨 Building Docker image..." -ForegroundColor Yellow
docker build -t sadradorostkar/mrshoofer-client:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Docker image built successfully!`n" -ForegroundColor Green

Write-Host "📤 Pushing to Docker Hub..." -ForegroundColor Yellow
docker push sadradorostkar/mrshoofer-client:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Image pushed to Docker Hub!`n" -ForegroundColor Green

Write-Host "🚀 Deploying to Liara..." -ForegroundColor Yellow
liara deploy --app mrshoofer-client --image sadradorostkar/mrshoofer-client:latest --port 3000 --platform docker

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Liara deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅✅✅ DEPLOYMENT SUCCESSFUL! ✅✅✅`n" -ForegroundColor Green

Write-Host "⏳ Waiting 10 seconds for deployment to stabilize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n🧪 Running verification tests...`n" -ForegroundColor Yellow
node verify-ors-unprotected.js

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "If tests still fail, check:" -ForegroundColor Yellow
Write-Host "1. Liara logs: liara logs --app mrshoofer-client"
Write-Host "2. Container status: docker ps"
Write-Host "3. Restart app: liara restart --app mrshoofer-client"
Write-Host ""
