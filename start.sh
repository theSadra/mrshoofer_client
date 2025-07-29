#!/bin/sh
set -e

echo "🔄 Starting MrShoofer Client..."
echo "📍 Database URL: $DATABASE_URL"
echo "🔍 Database type: $(echo $DATABASE_URL | cut -d':' -f1)"

# Validate DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set!"
    exit 1
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
    
    # Try to setup the database schema directly
    if npx prisma db push --force-reset 2>/dev/null; then
        echo "✅ Database schema setup successful!"
        break
    else
        DB_RETRY=$((DB_RETRY + 1))
        if [ $DB_RETRY -lt $DB_MAX_RETRIES ]; then
            echo "⚠️ Database setup failed - retrying in 10 seconds..."
            sleep 10
        else
            echo "❌ Database setup failed after $DB_MAX_RETRIES attempts!"
            echo "🔧 DATABASE_URL: $DATABASE_URL"
            echo "� Trying alternative approach..."
            
            # Try migrate deploy as fallback
            if npx prisma migrate deploy; then
                echo "✅ Migration deploy successful!"
                break
            else
                echo "� All database setup methods failed!"
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

echo "🌐 Starting on $HOSTNAME:$PORT"

if [ -f "server.js" ]; then
    echo "📄 Using server.js - binding to $HOSTNAME:$PORT"
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
