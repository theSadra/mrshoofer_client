#!/bin/bash
# Run this script ONCE during deployment to apply database migrations
# DO NOT run this on every container restart

echo "🔄 Running Prisma database migrations..."

# Generate Prisma client
npx prisma generate

# Apply pending migrations
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully!"
else
  echo "❌ Migration failed!"
  exit 1
fi
