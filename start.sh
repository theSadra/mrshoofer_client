#!/bin/sh
set -e

echo "🔄 Starting MrShoofer Client..."
echo "📍 Database URL: $DATABASE_URL"

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Test database connection with retries
echo "🔍 Testing database connection..."
DB_RETRY=0
DB_MAX_RETRIES=5
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
TABLE_EXISTS=$(npx prisma db execute --stdin <<< "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Passenger');" 2>/dev/null | grep -o 't\|f' || echo "f")

if [ "$TABLE_EXISTS" = "t" ]; then
    echo "✅ Database tables already exist!"
else
    echo "🏗️ Database tables don't exist - creating schema..."
    
    # Try migrations first
    echo "🗄️ Running database migrations..."
    if npx prisma migrate deploy; then
        echo "✅ Migrations completed successfully!"
    else
        echo "⚠️ Migration failed - trying direct schema push..."
        if npx prisma db push --force-reset; then
            echo "✅ Schema pushed successfully!"
        else
            echo "❌ All database operations failed!"
            echo "� Manual schema creation required"
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
