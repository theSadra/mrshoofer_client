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

# Test database connection with retries
echo "🔍 Testing database connection..."
DB_RETRY=0
DB_MAX_RETRIES=10
while [ $DB_RETRY -lt $DB_MAX_RETRIES ]; do
    if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
        echo "✅ Database connection successful!"
        break
    else
        DB_RETRY=$((DB_RETRY + 1))
        echo "❌ Database connection failed (attempt $DB_RETRY/$DB_MAX_RETRIES)"
        if [ $DB_RETRY -lt $DB_MAX_RETRIES ]; then
            echo "⏳ Retrying in 5 seconds..."
            sleep 5
        else
            echo "💥 Database connection failed after $DB_MAX_RETRIES attempts!"
            echo "🔧 DATABASE_URL: $DATABASE_URL"
            exit 1
        fi
    fi
done

# Check if tables exist
echo "🔍 Checking if database tables exist..."
echo "🔍 Running query: SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Passenger');"
TABLE_EXISTS=$(npx prisma db execute --stdin <<< "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Passenger');" 2>/dev/null | grep -o 't\|f' || echo "f")
echo "🔍 Table existence result: $TABLE_EXISTS"

if [ "$TABLE_EXISTS" = "t" ]; then
    echo "✅ Database tables already exist!"
else
    echo "🏗️ Database tables don't exist - creating schema..."
    
    # For PostgreSQL, prioritize db push over migrations (SQLite migrations won't work)
    echo "🗄️ Pushing schema directly to PostgreSQL..."
    if npx prisma db push --force-reset; then
        echo "✅ Schema pushed successfully to PostgreSQL!"
    else
        echo "⚠️ Direct push failed - trying migrations..."
        if npx prisma migrate deploy; then
            echo "✅ Migrations completed successfully!"
        else
            echo "❌ All database operations failed!"
            echo "🔧 Manual schema creation required"
            exit 1
        fi
    fi
fi

# Verify tables were created
echo "🔍 Verifying database schema..."
if npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" | grep -q "Passenger\|Trip\|Driver"; then
    echo "✅ Database schema verified - tables exist!"
else
    echo "❌ Database schema verification failed!"
    exit 1
fi

# Generate Prisma client (ensure it's available)
echo "📦 Ensuring Prisma client is ready..."
npx prisma generate || echo "⚠️ Prisma generate failed, using pre-built client"

# Start the Next.js application
echo "🚀 Starting Next.js application..."

# Set hostname to bind to all interfaces (required for Docker)
export HOSTNAME=0.0.0.0
export PORT=3000

if [ -f "server.js" ]; then
    echo "📄 Using server.js - binding to $HOSTNAME:$PORT"
    exec node server.js
elif [ -f "index.js" ]; then
    echo "📄 Using index.js - binding to $HOSTNAME:$PORT"
    exec node index.js
else
    echo "❌ No server file found! Available files:"
    ls -la
    exit 1
fi
