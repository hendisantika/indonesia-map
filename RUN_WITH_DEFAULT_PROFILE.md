# Running V18 Migration with Default Profile

## Current Configuration (Default Profile)

Your `application.properties` is configured for **local development**:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:13306/wilayah_indo3
spring.datasource.username=yu71
spring.datasource.password=53cret

# Flyway - ENABLED
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.validate-on-migrate=true
spring.flyway.out-of-order=true
spring.flyway.clean-disabled=true

# JPA - Schema management DISABLED (Flyway handles it)
spring.jpa.hibernate.ddl-auto=none
spring.jpa.generate-ddl=false

# Logging - DEBUG for Flyway (you'll see everything)
logging.level.org.flywaydb=DEBUG
logging.level.org.springframework.boot.autoconfigure.flyway=DEBUG
```

## Why This Configuration Works for V18

✅ **Flyway is enabled** - Will automatically run migrations on startup
✅ **Baseline on migrate** - Handles existing schema gracefully
✅ **Out-of-order allowed** - V18 can run even if there are gaps
✅ **DEBUG logging** - You'll see detailed migration progress
✅ **JPA ddl-auto=none** - Won't interfere with Flyway migrations

## Step-by-Step Execution

### Option 1: Automated Test Script (Recommended)

```bash
./TEST_DEFAULT_PROFILE.sh
```

This script will:
1. ✅ Check database connection
2. ✅ Clean failed migrations
3. ✅ Build the application
4. ✅ Verify V18 migration file exists
5. ✅ Show current database state
6. ✅ Ask if you want to start the app

### Option 2: Manual Steps

#### Step 1: Clean Failed Migrations (if any)

In **IntelliJ Database Console**:
```sql
DELETE FROM flyway_schema_history WHERE success = 0;
```

Or use the script:
```bash
mysql -h localhost -P 13306 -u yu71 -p53cret wilayah_indo3 < QUICK_FIX.sql
```

#### Step 2: Build Application

```bash
mvn clean package -DskipTests
```

#### Step 3: Start with Default Profile

```bash
mvn spring-boot:run
```

**No need to specify profile** - `application.properties` is the default!

#### Step 4: Watch the Console Output

You should see:

```
DEBUG o.f.core.internal.command.DbMigrate  : Migrating schema `wilayah_indo3` to version "18.24012026.1320 - normalize cangkuang banjaran codes"
DEBUG o.f.core.internal.sqlscript.DefaultSqlScriptExecutor : Executing SQL: ALTER TABLE `wilayah_level_3_4` ENGINE=InnoDB
DEBUG o.f.core.internal.sqlscript.DefaultSqlScriptExecutor : Executing SQL: UPDATE `idn_admbnda_adm3_bps_20200401` SET ...
DEBUG o.f.core.internal.sqlscript.DefaultSqlScriptExecutor : Executing SQL: UPDATE `all_villages` SET ...
DEBUG o.f.core.internal.sqlscript.DefaultSqlScriptExecutor : Executing SQL: INSERT INTO wilayah_level_3_4 ...
INFO  o.f.core.internal.command.DbMigrate  : Successfully applied 1 migration to schema `wilayah_indo3`
```

#### Step 5: Verify Results

In **IntelliJ Database Console**:
```sql
-- Run the comprehensive verification
source VERIFY.sql
```

Or manually:
```sql
-- Check V18 succeeded
SELECT version, description, success
FROM flyway_schema_history
WHERE version = '18.24012026.1320';

-- Verify Cangkuang in kecamatan list
SELECT kode, nama, parent_kode
FROM wilayah_level_3_4
WHERE kode = '32.04.44' AND level = 3;

-- Verify village counts
SELECT
    parent_kode,
    COUNT(*) as village_count
FROM wilayah_level_3_4
WHERE parent_kode IN ('32.04.13', '32.04.44')
  AND level = 4
GROUP BY parent_kode;
```

## Expected Results

### ✅ Successful Migration Output

```
Migrating schema `wilayah_indo3` to version "18.24012026.1320 - normalize cangkuang banjaran codes" (0.523s)
Successfully applied 1 migration to schema `wilayah_indo3` (execution time 00:00.544s)
```

### ✅ Database Verification

**Cangkuang Kecamatan:**
| kode | nama | parent_kode | level |
|------|------|-------------|-------|
| 32.04.44 | Cangkuang | 32.04 | 3 |

**Village Counts:**
| parent_kode | village_count |
|-------------|---------------|
| 32.04.13 | 11 (Banjaran) |
| 32.04.44 | 7 (Cangkuang) |

**wilayah_level_3_4 Engine:**
| TABLE_NAME | ENGINE | TABLE_ROWS |
|------------|--------|------------|
| wilayah_level_3_4 | InnoDB | ~81,911+ |

## Troubleshooting

### Issue: "Access denied for user 'yu71'@'localhost'"

**Solution:** Database isn't running
```bash
# Check if MySQL container is running
docker ps | grep mysql

# Or start it if needed
docker-compose up -d mysql
```

### Issue: "Validate failed: Detected failed migration"

**Solution:** Clean failed migrations
```sql
DELETE FROM flyway_schema_history WHERE success = 0;
```

### Issue: "GTID consistency error"

**Solution:** Already fixed in V18!
V18 converts the table to InnoDB first:
```sql
ALTER TABLE `wilayah_level_3_4` ENGINE=InnoDB;
```

### Issue: Migration succeeded but Cangkuang not showing

**Solution:** Check the query
```sql
-- Make sure you're using the right table
SELECT kode, nama FROM wilayah_level_3_4
WHERE parent_kode = '32.04.44' AND level = 4;

-- Not this (wrong table):
SELECT * FROM idn_admbnda_adm3_bps_20200401 WHERE ...
```

## Profile Comparison

| Feature | Default Profile | Dev Profile |
|---------|----------------|-------------|
| Database | localhost:13306 | localhost:13306 or env var |
| Flyway Logging | DEBUG | INFO |
| SQL Logging | Enabled | Disabled |
| Port | 8080 | 2000 |
| Best for | Local dev/testing | Deployment |

## After Successful Run

✅ V18 migration applied successfully
✅ Cangkuang appears in kecamatan list
✅ 7 Cangkuang villages in wilayah_level_3_4
✅ 11 Banjaran villages in wilayah_level_3_4
✅ Table engine converted to InnoDB
✅ All codes normalized properly

**Next:** You can now commit the changes!

```bash
git add .
git commit -m "fix: add Kecamatan Cangkuang and normalize codes

- Add V18 migration to normalize Cangkuang and Banjaran codes
- Convert wilayah_level_3_4 to InnoDB (fix GTID consistency)
- Add Cangkuang kecamatan (32.04.44) to kecamatan list
- Add 7 Cangkuang villages to wilayah_level_3_4
- Update 11 Banjaran villages in wilayah_level_3_4
- Fixes pemekaran data (Cangkuang split from Banjaran in 2003)

Closes #[issue-number]"
```

## Quick Reference Commands

```bash
# Clean failed migrations
mysql -h localhost -P 13306 -u yu71 -p53cret wilayah_indo3 < QUICK_FIX.sql

# Build
mvn clean package -DskipTests

# Run with default profile
mvn spring-boot:run

# Verify
mysql -h localhost -P 13306 -u yu71 -p53cret wilayah_indo3 < VERIFY.sql
```

## Files Reference

- `application.properties` - Default profile configuration ✅
- `application-dev.properties` - Deployment profile
- `V18_24012026_1320__normalize_cangkuang_banjaran_codes.sql` - The migration
- `TEST_DEFAULT_PROFILE.sh` - Automated test script
- `QUICK_FIX.sql` - Clean failed migrations
- `VERIFY.sql` - Verify results
- `RUN_WITH_DEFAULT_PROFILE.md` - This guide
