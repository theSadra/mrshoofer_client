# REQUIRED ENVIRONMENT VARIABLES FOR PAAS DEPLOYMENT
# Set these in your PaaS platform's environment variables section

# Database URL (CRITICAL - Replace with your actual database)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth Configuration (CRITICAL - Generate strong secrets)
NEXTAUTH_SECRET="your-32-character-secret-here"
NEXTAUTH_URL="https://your-app-domain.vercel.app"

# SMS Service
SMSIR_API_KEY="your-production-sms-key"

# Neshan Maps
NEXT_PUBLIC_NESHAN_MAP_KEY="your-neshan-map-key"
NEXT_PUBLIC_NESHAN_API_KEY="your-neshan-api-key"

# App Configuration
APP_BASE_URL="https://your-app-domain.vercel.app"
ORS_API_SECRET="your-ors-secret"

# Node Environment (auto-set by most platforms)
NODE_ENV="production"
