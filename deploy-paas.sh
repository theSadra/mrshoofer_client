#!/bin/bash
# deploy-paas.sh - Universal PaaS deployment script

echo "🚀 PaaS Deployment Helper for MrShoofer"
echo "======================================"

# Check for required files
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found. This script should be run from the project root."
    exit 1
fi

echo "✅ Dockerfile found"
echo "✅ Railway configuration found"

echo ""
echo "📋 Deployment Options:"
echo "1. Railway (Recommended for Docker)"
echo "2. Render"
echo "3. Google Cloud Run"
echo "4. Manual Docker deployment"

read -p "Choose deployment option (1-4): " option

case $option in
    1)
        echo "🚂 Deploying to Railway..."
        if ! command -v railway &> /dev/null; then
            echo "Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        
        echo "🔐 Login to Railway (browser will open)..."
        railway login
        
        echo "🔗 Linking project..."
        railway link
        
        echo "🚀 Deploying..."
        railway up
        
        echo "✅ Railway deployment initiated!"
        echo "📊 Check status: railway status"
        echo "📝 View logs: railway logs"
        ;;
    2)
        echo "🎨 For Render deployment:"
        echo "1. Go to https://render.com"
        echo "2. Connect your GitHub repository"
        echo "3. Choose 'Web Service'"
        echo "4. Select 'Docker' as build method"
        echo "5. Set environment variables from DEPLOYMENT_ENV.md"
        echo "6. Deploy!"
        ;;
    3)
        echo "🌤️ For Google Cloud Run:"
        echo "Make sure you have gcloud CLI installed and configured"
        read -p "Enter your Google Cloud Project ID: " project_id
        
        if [ -z "$project_id" ]; then
            echo "❌ Project ID required"
            exit 1
        fi
        
        echo "🔨 Building and pushing to Google Container Registry..."
        docker build -t gcr.io/$project_id/mrshoofer-app .
        docker push gcr.io/$project_id/mrshoofer-app
        
        echo "🚀 Deploying to Cloud Run..."
        gcloud run deploy mrshoofer-app \
          --image gcr.io/$project_id/mrshoofer-app \
          --platform managed \
          --region us-central1 \
          --allow-unauthenticated
        ;;
    4)
        echo "🐳 Manual Docker deployment:"
        echo "1. Build: docker build -t mrshoofer-app ."
        echo "2. Run: docker run -p 3000:3000 --env-file .env.production mrshoofer-app"
        echo "3. Or use docker-compose.prod.yml"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "📝 Don't forget to set these environment variables in your PaaS platform:"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - NEXTAUTH_SECRET (32+ character random string)"
echo "   - NEXTAUTH_URL (your app's URL)"
echo "   - SMSIR_API_KEY"
echo "   - NEXT_PUBLIC_NESHAN_MAP_KEY"
echo "   - NEXT_PUBLIC_NESHAN_API_KEY"
echo "   - APP_BASE_URL"
echo "   - ORS_API_SECRET"
echo ""
echo "📖 See DEPLOYMENT_ENV.md for complete list"
