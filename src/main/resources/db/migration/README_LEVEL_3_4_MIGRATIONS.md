# Flyway Migrations for Level 3 & 4 Boundaries

## Overview

Migrations V9-V13 handle Level 3 (sub-districts) and Level 4 (villages) boundary data from HDX.

## Migration Files

| Version | File | Size | Purpose |
|---------|------|------|---------|
| V9 | `V9_23012026_1000__create_wilayah_level_3_boundaries_table.sql` | 3.2KB | Create Level 3 table structure |
| V10 | `V10_23012026_1001__create_wilayah_level_4_boundaries_table.sql` | 3.8KB | Create Level 4 table structure |
| V11 | `V11_23012026_1002__normalize_level_3_codes.sql` | 1.8KB | Normalize Level 3 codes |
| V12 | `V12_23012026_1003__normalize_level_4_codes.sql` | 2.2KB | Normalize Level 4 codes |
| V13 | `V13_23012026_1004__create_boundary_verification_views.sql` | 4.3KB | Create verification views |

## Important Notes

### Data Import Required

⚠️ **V9 and V10 create table structures only** - they do NOT import the actual boundary data.

The boundary data files are too large for Flyway migrations:
- Level 3: 232MB (7,069 records)
- Level 4: 524MB (81,911 records)

### Migration Workflow

```
V9  → Creates Level 3 table (idn_admbnda_adm3_bps_20200401)
      ↓
   [MANUAL: Import Level 3 data - see options below]
      ↓
V11 → Normalizes Level 3 codes (ID110101 → 11.01.01)
      ↓
V10 → Creates Level 4 table (all_villages)
      ↓
   [MANUAL: Import Level 4 data - see options below]
      ↓
V12 → Normalizes Level 4 codes (ID11010120001 → 11.01.01.2001)
      ↓
V13 → Creates verification views
```

## Data Import Options

### Option A: Automated Import Script (Recommended)

```bash
cd /Users/hendisantika/Desktop/wilayah-indonesia/hdx_download

# Test with sample data first
./test_import.sh

# Full production import
./import_with_normalization.sh
```

### Option B: Manual Import

```bash
# 1. Run Flyway migrations V9
flyway migrate

# 2. Import Level 3 data
mysql -u user -p database < hdx_download/wilayah_level_3_boundaries.sql

# 3. Run Flyway migration V11
flyway migrate

# 4. Run Flyway migration V10
flyway migrate

# 5. Import Level 4 data
mysql -u user -p database < hdx_download/wilayah_level_4_boundaries_complete.sql

# 6. Run Flyway migrations V12-V13
flyway migrate
```

### Option C: Skip Flyway V11-V12, Use Normalization Scripts

```bash
# 1. Run Flyway V9-V10 (table creation)
flyway migrate

# 2. Import data manually
mysql -u user -p database < hdx_download/wilayah_level_3_boundaries.sql
mysql -u user -p database < hdx_download/wilayah_level_4_boundaries_complete.sql

# 3. Normalize codes
mysql -u user -p database < hdx_download/normalize_level3_codes.sql
mysql -u user -p database < hdx_download/normalize_level4_codes.sql

# 4. Skip V11-V12, run V13 only
# Edit flyway.conf to skip V11-V12 or mark them as executed:
# flyway migrate -ignoreMissingMigrations=true
```

## Flyway Configuration

Update your `flyway.conf`:

```properties
# JDBC URL
flyway.url=jdbc:mysql://localhost:3306/wilayah_indonesia?allowPublicKeyRetrieval=true&useSSL=false

# Database credentials
flyway.user=your_username
flyway.password=your_password

# Migration locations
flyway.locations=filesystem:db/migration

# Allow out-of-order execution (for manual data imports)
flyway.outOfOrder=true

# Increase timeout for large imports
flyway.connectRetries=3
flyway.connectRetriesInterval=10
```

## Verification

After running all migrations and importing data:

```sql
-- Check boundary statistics
SELECT * FROM v_boundary_statistics;

-- Expected output:
-- Level 3 (Sub-districts) | 7,069  | 7,069 | 7,069 | 38
-- Level 4 (Villages)      | 81,911 | 81,911| 81,911| 38

-- Check Level 3 normalization
SELECT COUNT(*) as total,
       COUNT(kode) as normalized,
       COUNT(DISTINCT kode) as unique_codes
FROM idn_admbnda_adm3_bps_20200401;

-- Check Level 4 normalization
SELECT COUNT(*) as total,
       COUNT(kode) as normalized,
       COUNT(DISTINCT kode) as unique_codes
FROM all_villages;

-- Test join with wilayah table
SELECT w.kode, w.nama, b.adm3_en, ST_AsGeoJSON(b.geom) as boundary
FROM wilayah w
JOIN idn_admbnda_adm3_bps_20200401 b USING (kode)
WHERE LENGTH(w.kode) = 8
LIMIT 5;
```

## Views Created by V13

### `v_wilayah_level_3_boundaries`
Joins Level 3 boundaries with `wilayah` table names.

```sql
SELECT * FROM v_wilayah_level_3_boundaries
WHERE kode = '11.01.01';
```

### `v_wilayah_level_4_boundaries`
Joins Level 4 boundaries with `wilayah` table names.

```sql
SELECT * FROM v_wilayah_level_4_boundaries
WHERE parent_kode = '11.01.01';
```

### `v_boundary_statistics`
Shows summary statistics for both levels.

```sql
SELECT * FROM v_boundary_statistics;
```

### `v_complete_hierarchy`
Complete administrative hierarchy with boundaries at all levels.

```sql
SELECT * FROM v_complete_hierarchy
WHERE village_code LIKE '11.01.01.%';
```

## Troubleshooting

### Issue: V11 or V12 fails with "Table not found"
**Cause**: Data hasn't been imported yet.
**Solution**: Import boundary data before running V11/V12.

### Issue: Normalized codes are NULL
**Cause**: Data import failed or incomplete.
**Solution**: Verify data import, then re-run V11/V12.

### Issue: View creation fails in V13
**Cause**: `wilayah` table doesn't exist.
**Solution**: Import `wilayah.sql` first, then run V13.

### Issue: Import too slow
**Cause**: Large file size (756MB total).
**Solution**:
```sql
SET GLOBAL max_allowed_packet=1073741824;
SET GLOBAL innodb_buffer_pool_size=4294967296;
```

## Performance Tips

1. **Run imports during off-peak hours** - Level 4 import can take 10-30 minutes
2. **Create spatial indexes** - Already included in table definitions
3. **Use views for common queries** - V13 creates optimized views
4. **Consider partitioning** - For very large databases, partition Level 4 by province

## Complete Migration Sequence

```bash
# 1. Run all Flyway migrations (V1-V13)
flyway migrate

# 2. Import HDX boundary data (between V9-V11 and V10-V12)
cd hdx_download
./import_with_normalization.sh

# 3. Verify
mysql -u user -p database < hdx_download/verify_normalization.sql
```

## Documentation References

- Main guide: `../FINAL_SUMMARY.md`
- HDX details: `../hdx_download/HDX_DOWNLOAD_SUMMARY.md`
- Normalization: `../hdx_download/NORMALIZATION_GUIDE.md`
- Original migrations: `FLYWAY_MIGRATIONS_README.md`

## Summary

| Migration | Creates | Records | Import Required | Normalization |
|-----------|---------|---------|-----------------|---------------|
| V1-V8 | Level 1-2 | 551 | ✅ Included | N/A |
| V9 | Level 3 schema | 0 | ⚠️ Manual | Via V11 |
| V10 | Level 4 schema | 0 | ⚠️ Manual | Via V12 |
| V11 | Normalize L3 | - | - | ✅ Automatic |
| V12 | Normalize L4 | - | - | ✅ Automatic |
| V13 | Views | - | - | - |

**Total Records After Import**: 89,531 administrative boundaries with geometry
