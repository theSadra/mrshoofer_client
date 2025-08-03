#!/bin/sh
# pre-build.sh - Run this before building the Docker image to ensure all requirements are met

# Check if environment variables are set
if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "Setting default NEXTAUTH_SECRET for local development"
  export NEXTAUTH_SECRET="vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w"
fi

if [ -z "$NEXTAUTH_URL" ]; then
  echo "Setting default NEXTAUTH_URL for local development"
  export NEXTAUTH_URL="http://localhost:3000"
fi

# Create .env file with required variables
echo "Creating .env file with required variables..."
cat > .env << EOL
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=${NEXTAUTH_URL}
ORS_API_SECRET=YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6
SMSIR_API_KEY=YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6
APP_BASE_URL=${NEXTAUTH_URL}
DATABASE_URL=postgresql://root:X7pGrkczSStKTxuyw1dH9WxE@mrshoofer-client-db:5432/postgres
EOL

# Copy to other env files for redundancy
cp .env .env.local
cp .env .env.production

echo "Environment setup complete!"
echo "You can now build the Docker image with:"
echo "docker build -t mrshoofer-client -f Dockerfile.fixed2 ."
