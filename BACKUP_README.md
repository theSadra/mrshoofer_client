# Database Backup & Recovery Guide

## ⚠️ CRITICAL: What Happened on December 27, 2025

The migration `20251227115039_sync_trip_table` **recreated all database tables from scratch**, resulting in **complete data loss**.

This happened because:
1. The migration was run as if it was a fresh database (using CREATE TABLE instead of ALTER TABLE)
2. No backups were available on Liara
3. The migration was deployed to production without testing

**Result: All passenger, trip, driver, and user data was permanently deleted.**

---

## 🛡️ Prevention - Never Let This Happen Again

### 1. **ALWAYS Backup Before Migrations**

Before running ANY migration on production:

```bash
# Linux/Mac
./scripts/backup-database.sh

# Windows
scripts\backup-database.bat
```

### 2. **Enable Liara Automated Backups**

1. Go to https://console.liara.ir
2. Select your database
3. Go to "Backups" section
4. Enable **Daily Automated Backups**
5. Set retention period to at least 7 days

### 3. **Test Migrations Locally First**

```bash
# 1. Never test on production DATABASE_URL
# 2. Use a separate .env.local with test database
# 3. Run migration locally first:
npx prisma migrate dev

# 4. Check if data is preserved
npx prisma studio

# 5. Only then deploy to production:
npx prisma migrate deploy
```

### 4. **Safe Migration Workflow**

```bash
# ✅ CORRECT - Safe workflow
1. Create backup: ./scripts/backup-database.sh
2. Test locally with test database
3. Deploy with: npx prisma migrate deploy
4. Verify data is intact

# ❌ WRONG - Dangerous commands
- prisma migrate reset (DELETES ALL DATA)
- prisma db push --force-reset (DELETES ALL DATA)
- prisma migrate dev on production DATABASE_URL
```

---

## 📦 How to Create Manual Backups

### Using pg_dump (Recommended)

```bash
# Backup entire database
pg_dump "postgresql://user:pass@host:port/dbname" > backup.sql

# Restore backup
psql "postgresql://user:pass@host:port/dbname" < backup.sql
```

### Using Prisma Studio

1. `npx prisma studio`
2. Manually export data (not ideal for large datasets)

---

## 🔄 Recovery Options (If Data Loss Occurs)

### 1. Check Liara Backups
- Login to https://console.liara.ir
- Database → Backups
- Restore from snapshot

### 2. Check Local Database
```bash
# If you have local dev database with data
pg_dump local_db > recovery.sql
psql "production_url" < recovery.sql
```

### 3. Check Git History
```bash
git log --all --full-history -- "*.sql" "*.dump"
```

### 4. Contact Hosting Support
- Liara might have hidden/archived backups
- Ask about point-in-time recovery

---

## 📋 Backup Schedule Recommendation

1. **Before every migration**: Manual backup
2. **Daily**: Automated backup via Liara
3. **Before major releases**: Full dump to local storage
4. **Weekly**: Download backup from Liara to local machine

---

## 🚨 Red Flags - Stop Immediately If You See:

1. Migration file contains `CREATE TABLE` for existing tables
2. Migration file contains `DROP TABLE`
3. Prisma suggests "resetting" the database
4. Error: "Migration history diverged"
5. Any command with `--force-reset` flag

**If you see these, STOP and create a backup first!**

---

## 📞 Emergency Contacts

- **Liara Support**: https://liara.ir/support
- **Database Admin**: [Add contact info]
- **Team Lead**: [Add contact info]

---

## ✅ Checklist Before Production Deployment

- [ ] Backup created and verified
- [ ] Migration tested on local database
- [ ] Migration tested on staging database
- [ ] Data integrity verified after test migration
- [ ] Team notified about deployment
- [ ] Rollback plan prepared
- [ ] Liara automated backups enabled
- [ ] No `CREATE TABLE` for existing tables
- [ ] No `DROP TABLE` in migration
