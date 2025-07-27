#!/bin/bash
# deploy-liara.sh - Deploy to Liara PaaS

echo "🚀 Deploying to Liara..."

# Check if Liara CLI is installed
if ! command -v liara &> /dev/null; then
    echo "❌ Liara CLI not found. Installing..."
    npm install -g @liara/cli
fi

# Login to Liara
echo "🔐 Login to Liara..."
liara login

# Deploy to Liara
echo "🚀 Deploying application..."
liara deploy

echo "✅ Deployment completed!"
echo "🌐 Your app will be available at: https://mrshoofer-client.liara.run"
echo ""
echo "📝 Don't forget to set environment variables in Liara dashboard:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL"
echo "   - SMSIR_API_KEY"
echo "   - NEXT_PUBLIC_NESHAN_MAP_KEY"
echo "   - NEXT_PUBLIC_NESHAN_API_KEY"
echo "   - APP_BASE_URL"
echo "   - ORS_API_SECRET"
