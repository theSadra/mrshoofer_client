#!/bin/sh
# start-production.sh - Ensures environment variables are set before starting the application

# Set essential environment variables with defaults if not already set
export NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-"vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w"}
export NEXTAUTH_URL=${NEXTAUTH_URL:-"https://mrshoofer-client.liara.run"}
export ORS_API_SECRET=${ORS_API_SECRET:-"YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6"}
export SMSIR_API_KEY=${SMSIR_API_KEY:-"YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6"}
export APP_BASE_URL=${APP_BASE_URL:-"https://webapp.mrshoofer.ir"}
export DATABASE_URL=${DATABASE_URL:-"postgresql://root:X7pGrkczSStKTxuyw1dH9WxE@mrshoofer-client-db:5432/postgres"}

# Create or update .env files at runtime for redundancy
cat > .env << EOL
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=${NEXTAUTH_URL}
ORS_API_SECRET=${ORS_API_SECRET}
SMSIR_API_KEY=${SMSIR_API_KEY}
APP_BASE_URL=${APP_BASE_URL}
DATABASE_URL=${DATABASE_URL}
EOL

# Copy to all possible env file locations that Next.js might check
cp .env .env.local
cp .env .env.production
cp .env .env.production.local

# Log environment status for verification
echo "📝 Environment variables set:"
echo "NEXTAUTH_SECRET: [exists]"
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "Environment files created at: .env, .env.local, .env.production"

# Start the application
echo "🚀 Starting MrShoofer Client application..."
exec npm start
