#!/bin/bash

# Database Backup Script for MrShoofer
# Run this script regularly to create backups before migrations

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load DATABASE_URL from .env
if [ -f .env ]; then
  export $(cat .env | grep DATABASE_URL | xargs)
else
  echo "❌ .env file not found"
  exit 1
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in .env"
  exit 1
fi

echo "🔄 Creating database backup..."
echo "📁 Backup location: $BACKUP_FILE"

# Use pg_dump to create backup
# Note: This requires pg_dump to be installed
# Install: sudo apt-get install postgresql-client (Linux) or brew install postgresql (Mac)

pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup created successfully!"
  echo "📊 Backup size: $(du -h $BACKUP_FILE | cut -f1)"
  
  # Keep only last 10 backups
  cd "$BACKUP_DIR"
  ls -t backup_*.sql | tail -n +11 | xargs -r rm
  echo "🧹 Cleaned old backups (keeping last 10)"
else
  echo "❌ Backup failed"
  exit 1
fi
