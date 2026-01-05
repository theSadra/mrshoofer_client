# Liara Configuration README

## Problem: 403 Errors on /ORS/api/trip

The issue is that **Liara's WAF (Web Application Firewall)** or rate limiting is blocking POST requests to `/ORS/api/trip`.

### Evidence:
1. Response headers show `Server: Liara` (not Next.js)
2. Empty body (0 bytes) - blocked before reaching the app
3. Works initially, then gets 403 - suggests WAF learning/blocking
4. Other endpoints work - specific to this route

### Root Cause:
Liara's infrastructure is intercepting and blocking the requests, likely because:
- POST requests to API endpoints trigger WAF rules
- Repeated requests from same IP trigger rate limiting
- Request pattern looks "suspicious" to WAF

### Solution Steps:

#### Option 1: Disable WAF/Rate Limiting via Liara Dashboard
1. Go to https://console.liara.ir/
2. Navigate to your app: `mrshoofer-client`
3. Go to Settings → Security
4. Disable WAF or add exception for `/ORS/*` paths
5. Disable rate limiting or whitelist `/ORS/*` paths

#### Option 2: Use liara_nginx.conf (Already Created)
1. The `liara_nginx.conf` file has been created
2. It configures nginx to bypass WAF and rate limiting for ORS routes
3. Deploy with this file included

#### Option 3: Use liara.json Configuration (Already Updated)
The `liara.json` has been updated with:
```json
{
  "waf": {
    "enabled": false
  },
  "rateLimit": {
    "enabled": false
  }
}
```

### Deploy Now:
```powershell
# Deploy with updated configuration
.\quick-deploy.ps1

# Or manually
liara deploy --app mrshoofer-client --port 3000
```

### Verify After Deployment:
```powershell
node test-rate-limiting.js
```

### If Still 403:
Contact Liara support and ask them to:
1. Whitelist `/ORS/*` paths from WAF
2. Disable rate limiting for `/ORS/*` paths
3. Check server logs for why requests are being blocked

### Alternative: Use Liara CLI to Check Logs
```bash
liara logs --app mrshoofer-client --since 10m
```

Look for:
- WAF blocking messages
- Rate limit exceeded messages
- Security policy violations
