#!/bin/sh
set -e

echo "🔄 Starting MrShoofer Client..."
echo "📍 Database URL: $DATABASE_URL"
echo "🔍 Database type: $(echo $DATABASE_URL | cut -d':' -f1)"

# Validate DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set!"
    echo "🔧 Using fallback DATABASE_URL from liara.json configuration..."
    export DATABASE_URL="postgresql://root:X7pGrkczSStKTxuyw1dH9WxE@mrshoofer-client-db:5432/postgres"
    echo "📍 Fallback Database URL: $DATABASE_URL"
fi

# Validate NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET is not set!"
    echo "🔧 Using fallback NEXTAUTH_SECRET..."
    export NEXTAUTH_SECRET="vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w"
    echo "✅ NEXTAUTH_SECRET configured"
fi

# Validate NEXTAUTH_URL
if [ -z "$NEXTAUTH_URL" ]; then
    echo "🔧 Setting NEXTAUTH_URL..."
    export NEXTAUTH_URL="https://mrshoofer-client.liara.run"
    echo "✅ NEXTAUTH_URL configured"
fi

# Check if it's PostgreSQL
if echo "$DATABASE_URL" | grep -q "postgresql://"; then
    echo "✅ Using PostgreSQL database"
else
    echo "⚠️ Warning: DATABASE_URL doesn't appear to be PostgreSQL"
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Test database connection and setup schema
echo "🔍 Testing database and setting up schema..."
DB_RETRY=0
DB_MAX_RETRIES=5

while [ $DB_RETRY -lt $DB_MAX_RETRIES ]; do
    echo "📋 Attempt $((DB_RETRY + 1))/$DB_MAX_RETRIES: Running Prisma setup..."
    
    # Try to setup the database schema safely (preserves data)
    echo "🔧 Running: npx prisma db push"
    if npx prisma db push 2>/dev/null; then
        echo "✅ Database schema setup successful! Data preserved."
        break
    else
        DB_RETRY=$((DB_RETRY + 1))
        if [ $DB_RETRY -lt $DB_MAX_RETRIES ]; then
            echo "⚠️ Database setup failed - retrying in 10 seconds..."
            sleep 10
        else
            echo "❌ Database setup failed after $DB_MAX_RETRIES attempts!"
            echo "🔧 DATABASE_URL: $DATABASE_URL"
            echo "🔧 Trying alternative approach..."
            
            # Try migrate deploy as fallback
            echo "🔧 Running: npx prisma migrate deploy"
            if npx prisma migrate deploy; then
                echo "✅ Migration deploy successful! Data preserved."
                break
            else
                echo "❌ All database setup methods failed!"
                echo "🔧 Checking Prisma schema file..."
                ls -la prisma/ || echo "No prisma directory found"
                echo "🔧 Prisma version:"
                npx prisma --version || echo "Prisma not found"
                exit 1
            fi
        fi
    fi
done

# Generate Prisma client (ensure it's available)
echo "📦 Ensuring Prisma client is ready..."
npx prisma generate || echo "⚠️ Prisma generate failed, using pre-built client"

# Start the Next.js application
echo "🚀 Starting Next.js application..."
echo "📁 Current directory: $(pwd)"
echo "📂 Directory contents:"
ls -la

# Set hostname to bind to all interfaces (required for Docker)
export HOSTNAME=0.0.0.0
export PORT=3000

# Directly set critical environment variables again before starting
export NEXTAUTH_SECRET="vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w"
export NEXTAUTH_URL="https://mrshoofer-client.liara.run"
export ORS_API_SECRET="YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6"
export SMSIR_API_KEY="YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6"

echo "🌐 Starting on $HOSTNAME:$PORT"

if [ -f "server.js" ]; then
    # Patch server.js to inject environment variables directly into the code
    echo "� Patching server.js with hardcoded environment variables..."
    
    # Create temporary patching file
    cat > patch.js << 'EOL'
// Hardcoded environment variables for NextAuth
process.env.NEXTAUTH_SECRET = 'vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w';
process.env.NEXTAUTH_URL = 'https://mrshoofer-client.liara.run';
process.env.ORS_API_SECRET = 'YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
process.env.SMSIR_API_KEY = 'YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
console.log('🔐 NextAuth secret and other environment variables injected directly into server.js');

EOL

    # Backup original server.js
    cp server.js server.original.js
    
    # Combine patch with original server.js
    cat patch.js server.original.js > server.js
    
    # Clean up
    rm patch.js server.original.js
    
    echo "✅ server.js successfully patched"
    echo "🔍 server.js contents preview:"
    head -10 server.js
    echo "▶️ Executing: node server.js"
    exec node server.js
elif [ -f "index.js" ]; then
    echo "📄 Using index.js - binding to $HOSTNAME:$PORT"
    echo "🔍 index.js contents preview:"
    head -10 index.js
    echo "▶️ Executing: node index.js"
    exec node index.js
else
    echo "❌ No server file found! Available files:"
    ls -la
    echo "🔍 Checking for Next.js files:"
    find . -name "*.js" -o -name "package.json" | head -10
    exit 1
fi
