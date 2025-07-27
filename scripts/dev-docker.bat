@echo off
REM Windows batch script for Docker development

echo 🐳 Building Docker containers...
docker-compose build

echo 🚀 Starting services...
docker-compose up -d

echo ⏳ Waiting for database to be ready...
timeout /t 10

echo 🗃️ Running database migrations...
docker-compose exec app npx prisma migrate deploy

echo ✅ Application is running!
echo 🌐 Open http://localhost:3000
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop services: docker-compose down
