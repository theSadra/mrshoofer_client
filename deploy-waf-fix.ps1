# FIX: Disable WAF and Rate Limiting for ORS Routes
Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║      DEPLOYING FIX FOR LIARA WAF BLOCKING ORS ROUTES     ║" -ForegroundColor Red
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Red

Write-Host "🔍 DIAGNOSIS:" -ForegroundColor Yellow
Write-Host "  • 403 errors are from Liara's WAF/proxy, NOT Next.js"
Write-Host "  • Server header shows 'Liara' not 'Next.js'"
Write-Host "  • Empty response body (blocked before reaching app)"
Write-Host "  • All 20 test requests returned 403`n"

Write-Host "✅ FIXES APPLIED:" -ForegroundColor Green
Write-Host "  1. liara.json updated with WAF/rateLimit disabled"
Write-Host "  2. liara_nginx.conf created to bypass WAF for /ORS routes"
Write-Host "  3. Headers added to identify ORS as API client`n"

Write-Host "🚀 Deploying to Liara...`n" -ForegroundColor Cyan

Set-Location "c:\Users\doros\OneDrive\Desktop\MrShoofer client webapp\mrshoofer_client"

# Deploy to Liara
liara deploy --app mrshoofer-client --port 3000 --detach

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Deployment failed!`n" -ForegroundColor Red
    Write-Host "Try these steps:" -ForegroundColor Yellow
    Write-Host "1. Check Liara console: https://console.liara.ir/"
    Write-Host "2. Manually disable WAF in Security settings"
    Write-Host "3. Contact Liara support to whitelist /ORS/* paths`n"
    exit 1
}

Write-Host "`n✅ Deployment started!`n" -ForegroundColor Green

Write-Host "⏳ Waiting 30 seconds for deployment...`n" -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "🧪 Testing after deployment...`n" -ForegroundColor Cyan
node test-rate-limiting.js

Write-Host "`n════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "📝 If still getting 403:" -ForegroundColor Yellow
Write-Host "1. Go to Liara console: https://console.liara.ir/"
Write-Host "2. Navigate to mrshoofer-client → Settings → Security"
Write-Host "3. Disable WAF or add /ORS/* to whitelist"
Write-Host "4. Disable rate limiting or add /ORS/* to exceptions`n"

Write-Host "📞 Or contact Liara support:" -ForegroundColor Yellow
Write-Host "   support@liara.ir"
Write-Host "   Tell them: 'Need to whitelist /ORS/* from WAF and rate limiting'`n"
