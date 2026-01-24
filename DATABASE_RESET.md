# Database Reset Guide

This guide explains how to reset your database to ensure clean Flyway migration execution.

## Why Reset?

Reset the database if you encounter:
- Flyway migration errors
- Failed migrations in `flyway_schema_history`
- Schema conflicts
- Need to start fresh with all migrations

## Quick Reset (Automated)

### Option 1: Using Bash Script (Recommended)

```bash
./reset_db.sh
```

This script will:
1. Ask for confirmation
2. Drop and recreate the database
3. Build the application
4. Display next steps

### Option 2: Manual MySQL Command

```bash
mysql -h localhost -P 13306 -u yu71 -p53cret < reset_database.sql
```

Then rebuild and run:
```bash
mvn clean package -DskipTests
mvn spring-boot:run
```

## What Happens After Reset?

1. **Database Dropped**: `wilayah_indo3` database is completely removed
2. **Database Recreated**: Fresh empty database with UTF-8 encoding
3. **Flyway Runs**: On application start, Flyway will execute all migrations in order:
   - V1: Create base tables for Level 1 & 2
   - V2-V8: Insert regional data (Sumatera, Jawa, etc.)
   - V9.0: Create Level 3 (Kecamatan) table
   - V9.1-V9.8: Insert Level 3 regional data
   - V10.0: Create Level 4 (Desa/Kelurahan) table
   - V10.1-V10.8: Insert Level 4 regional data
   - V11: Create boundary verification views
   - V16: Add Kecamatan Cangkuang
   - V17: Add villages for Kecamatan Cangkuang
   - V18: Add villages for Kecamatan Banjaran

## Current Migration Fixes (cb1380d)

### Fixed Issues:
1. **GEOMETRY NOT NULL Constraint**
   - Tables `idn_admbnda_adm3_bps_20200401` and `all_villages` require non-NULL geometry
   - Changed from NULL to POINT placeholders

2. **Migration Files Updated:**
   - **V16**: Kecamatan Cangkuang uses `POINT(107.6420, -7.0236)` (approximate centroid)
   - **V17**: 7 Cangkuang villages use `POINT(0, 0)` placeholder
   - **V18**: 11 Banjaran villages use `POINT(0, 0)` placeholder

### Note on Geometry Placeholders:
- `POINT(0, 0)` is used as placeholder (Null Island location)
- Actual boundary geometries should be updated later with proper spatial data
- Does not affect administrative hierarchy or codes

## Verify Migrations

After application starts, check migration status:

```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

All migrations should show `success = 1` and no NULL descriptions.

## Troubleshooting

### Migration Still Fails?

1. **Check Flyway History:**
   ```sql
   SELECT version, description, type, script, checksum, installed_on, success
   FROM flyway_schema_history
   WHERE success = 0;
   ```

2. **Clear Failed Migration:**
   ```sql
   DELETE FROM flyway_schema_history WHERE success = 0;
   ```

3. **Reset Again:**
   ```bash
   ./reset_db.sh
   ```

### Application Won't Start?

Check logs for:
- Database connection errors
- Flyway validation errors
- SQL syntax errors

## Production Deployment

For production (via GitHub Actions):
- Database is already initialized on server
- Flyway runs migrations automatically on deployment
- Failed migrations will stop deployment
- Check deployment logs at: http://map.persislabs.my.id

## Database Configuration

### Local (default profile):
- Host: localhost
- Port: 13306
- Database: wilayah_indo3
- User: yu71
- Password: 53cret

### Dev Server (dev profile):
- Host: localhost (on server)
- Port: 3306
- Database: wilayah_indo
- Credentials: Set via environment variables (secrets)

## Additional Resources

- Flyway Documentation: https://flywaydb.org/documentation/
- Migration files: `src/main/resources/db/migration/`
- Application properties: `src/main/resources/application.properties`
