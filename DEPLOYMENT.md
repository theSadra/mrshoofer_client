# Deployment Guide

## Database Migrations

### ⚠️ IMPORTANT: Migration Strategy

**DO NOT** run migrations on every container restart! This causes:
- Unnecessary startup delays
- Potential race conditions with multiple containers
- Risk of data loss if migrations are destructive

### Recommended Approach

#### Option 1: Run Migrations Before Deployment (Recommended)
```bash
# On your deployment server, before starting containers:
npm run migrate
# or
bash scripts/run-migrations.sh
```

#### Option 2: One-Time Migration Container
Create a separate job/task that runs migrations once:
```bash
docker run --rm \
  -e DATABASE_URL="your-database-url" \
  your-image:latest \
  npx prisma migrate deploy
```

#### Option 3: Liara Pre-Deployment Hook
If using Liara, you can add a pre-deployment script in your CI/CD pipeline.

### For Liara Deployment

1. **SSH into your Liara container:**
```bash
liara shell --app mrshoofer-client
```

2. **Run migrations manually:**
```bash
npx prisma migrate deploy
```

3. **Or use the provided script:**
```bash
bash scripts/run-migrations.sh
```

### Docker Compose Example

```yaml
services:
  migrate:
    image: your-image:latest
    command: npx prisma migrate deploy
    environment:
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      - db
    restart: "no"  # Run once and exit

  app:
    image: your-image:latest
    command: node server.js
    depends_on:
      migrate:
        condition: service_completed_successfully
```

## Current Build Scripts

- `npm run build` - Runs migrations + builds (for initial setup)
- `npm run build:prod` - Just generates client + builds (faster)
- `npm run migrate` - Runs migrations only
- `npm run start` - Starts app WITHOUT migrations
- `npm run start:with-migrate` - Runs migrations then starts (use carefully)

## Migration Safety Checklist

Before running migrations in production:

- [ ] Backup your database
- [ ] Test migrations in staging environment
- [ ] Review migration SQL for destructive operations
- [ ] Ensure no DROP COLUMN or data-loss operations
- [ ] Check if migration is reversible
- [ ] Monitor application logs during migration

## What Happens During Migration?

Prisma tracks applied migrations in `_prisma_migrations` table:
- ✅ Only NEW migrations are applied
- ✅ Already-applied migrations are skipped
- ✅ Existing data is preserved (unless migration explicitly deletes it)
- ✅ Schema changes are applied incrementally

## Troubleshooting

### Migration Failed
```bash
# Check migration status
npx prisma migrate status

# Reset if needed (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Force migrate (use with caution)
npx prisma migrate resolve --applied <migration-name>
```

### Multiple Containers Racing
If you see "migration is already running" errors:
1. Stop all containers
2. Run migration once manually
3. Start containers without migration flag

### Data Loss Prevention
- Always backup before migrations
- Use Prisma's preview features for reviewing migrations
- Test in staging first
- Never run `prisma migrate reset` in production
