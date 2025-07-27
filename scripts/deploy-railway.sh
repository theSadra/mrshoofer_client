#!/bin/bash
# deploy-railway.sh - Deploy to Railway

echo "🚀 Deploying to Railway..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Link to project (or create new one)
echo "🔗 Linking to Railway project..."
railway link

# Set environment variables
echo "📝 Setting up environment variables..."
echo "⚠️  Please set these environment variables in Railway Dashboard:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL"
echo "   - SMSIR_API_KEY"
echo "   - NEXT_PUBLIC_NESHAN_MAP_KEY"
echo "   - NEXT_PUBLIC_NESHAN_API_KEY"
echo "   - APP_BASE_URL"
echo "   - ORS_API_SECRET"

# Deploy
echo "🚀 Deploying application..."
railway up

echo "✅ Deployment completed!"
echo "🌐 Your app will be available at your Railway domain"
