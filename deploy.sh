#!/bin/bash

# Deployment script for Liara with Prisma optimizations
set -e

echo "🚀 Starting deployment to Liara..."

# Step 1: Ensure Prisma client is generated
echo "📦 Generating Prisma client..."
npx prisma generate

# Step 2: Test database connection (optional)
echo "🔌 Testing database connection..."
# npx prisma db push --accept-data-loss  # Uncomment if you need to sync schema

# Step 3: Deploy to Liara
echo "☁️ Deploying to Liara..."
liara deploy --app mrshoofer-client --api-token $LIARA_API_TOKEN

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://mrshoofer-client.liara.run"

# Step 4: Run migrations on production (after deployment)
echo "🔄 Running database migrations..."
liara shell --app mrshoofer-client --command "npx prisma migrate deploy"

echo "🎉 All done! Your application is live!"
