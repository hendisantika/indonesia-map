# Flyway Failed Migration Fix

## Error Message
```
Validate failed: Migrations have failed validation
Detected failed migration to version 16.24012026.1300 (add kecamatan cangkuang).
Please remove any half-completed changes then run repair to fix the schema history.
```

## What Happened?
- Migration V16 was attempted but failed
- Flyway recorded the failure in `flyway_schema_history`
- Now Flyway refuses to run because of the failed migration record

## Solution Options

### 🎯 Option 1: Quick Fix (Recommended if you have data to preserve)

**Step 1:** Remove the failed migration record

Run this in your database console:
```sql
DELETE FROM flyway_schema_history WHERE success = 0;
```

Or use the provided SQL file:
```bash
mysql -h localhost -P 13306 -u yu71 -p53cret wilayah_indo3 < fix_flyway_failed_migration.sql
```

**Step 2:** Restart the application
```bash
mvn spring-boot:run
```

Flyway will now retry the migration with the fixed version.

---

### 🔄 Option 2: Clean Reset (Recommended for fresh start)

**This will DELETE ALL DATA in the database!**

Use the automated reset script:
```bash
./reset_db.sh
```

Or manual reset:
```bash
mysql -h localhost -P 13306 -u yu71 -p53cret < reset_database.sql
mvn clean package -DskipTests
mvn spring-boot:run
```

---

### 🛠️ Option 3: Flyway Repair (Advanced)

In your `application.properties`, temporarily add:
```properties
spring.flyway.baseline-on-migrate=true
spring.flyway.repair-on-migrate=true
```

Then restart the application. **Remove these properties after successful migration.**

---

## Verify Success

After the application starts, check the migration history:

```sql
SELECT
    installed_rank,
    version,
    description,
    success,
    installed_on
FROM flyway_schema_history
WHERE version IN ('16.24012026.1300', '17.24012026.1310', '18.24012026.1320')
ORDER BY installed_rank;
```

All should show `success = 1`.

Check the data was inserted:
```sql
-- Kecamatan Cangkuang
SELECT * FROM idn_admbnda_adm3_bps_20200401 WHERE adm3_pcode = '32.04.44';

-- Cangkuang villages (should return 7)
SELECT count(*) FROM all_villages WHERE adm3_pcode = '32.04.44';

-- Banjaran villages (should return 11)
SELECT count(*) FROM all_villages WHERE adm3_pcode = '32.04.13';
```

## Why Did It Fail?

The original migration had issues:
1. ✅ **FIXED**: Used `NULL` for `geom` field (field is NOT NULL)
2. ✅ **FIXED**: Had `lat`/`lng` columns that don't exist
3. ✅ **FIXED**: Now uses `POINT(x, y)` placeholder geometry

These issues are now fixed in the latest commit (cb1380d).

## Need Help?

If migrations still fail:
1. Check application logs for specific SQL errors
2. Verify database connection
3. Check MySQL version compatibility
4. Review migration files in `src/main/resources/db/migration/`
