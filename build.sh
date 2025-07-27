#!/bin/bash
# build.sh - Run this script during deployment

echo "🔧 Installing dependencies..."
npm install

echo "🗃️ Generating Prisma client..."
npx prisma generate

echo "🚀 Running database migrations..."
npx prisma migrate deploy

echo "📦 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
