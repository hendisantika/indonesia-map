# Fix Cangkuang Kecamatan - Step by Step Guide

## Problem
Kecamatan Cangkuang (split from Banjaran in 2003) doesn't appear in the kecamatan list because:
- V16 and V17 use format `32.04.44` instead of `ID320444`
- Previous normalization migrations only process codes with 'ID%' prefix
- So Cangkuang's `kode` field stays NULL
- `wilayah_level_3_4` table only includes records WHERE `kode IS NOT NULL`

## Solution
V18 migration will:
1. Convert `wilayah_level_3_4` to InnoDB (fix GTID consistency)
2. Normalize kode fields for Cangkuang and villages
3. Add Cangkuang to the kecamatan list
4. Add all villages to `wilayah_level_3_4`

## Steps to Fix

### Step 1: Clean Failed Migrations (in IntelliJ Database Console)

**Option A:** Use the prepared script
```bash
# Open this file in IntelliJ Database Console and execute:
RUN_IN_CONSOLE.sql
```

**Option B:** Run manually
```sql
-- Show failed migrations
SELECT version, description, success
FROM flyway_schema_history
WHERE success = 0;

-- Delete them
DELETE FROM flyway_schema_history WHERE success = 0;
```

### Step 2: Restart Application

```bash
mvn spring-boot:run
```

Watch the console output for:
```
Migrating schema `wilayah_indo3` to version "18.24012026.1320 - normalize cangkuang banjaran codes"
Successfully applied 1 migration to schema `wilayah_indo3`
```

### Step 3: Verify Success (in IntelliJ Database Console)

**Option A:** Use the prepared script
```bash
# Open this file in IntelliJ Database Console and execute:
VERIFY.sql
```

**Option B:** Run manual checks
```sql
-- Check V18 migration succeeded
SELECT version, description, success
FROM flyway_schema_history
WHERE version = '18.24012026.1320';

-- Verify Cangkuang appears in kecamatan list
SELECT kode, nama, parent_kode
FROM wilayah_level_3_4
WHERE kode = '32.04.44' AND level = 3;

-- Verify 7 Cangkuang villages
SELECT COUNT(*) as count
FROM wilayah_level_3_4
WHERE parent_kode = '32.04.44' AND level = 4;

-- Verify 11 Banjaran villages
SELECT COUNT(*) as count
FROM wilayah_level_3_4
WHERE parent_kode = '32.04.13' AND level = 4;
```

## Expected Results

### Cangkuang Kecamatan
- `kode`: 32.04.44
- `nama`: Cangkuang
- `parent_kode`: 32.04
- `level`: 3

### Cangkuang Villages (7)
1. Bandasari (32.04.44.2004)
2. Cangkuang (32.04.44.2001)
3. Ciluncat (32.04.44.2002)
4. Jatisari (32.04.44.2006)
5. Nagrak (32.04.44.2003)
6. Pananjung (32.04.44.2005)
7. Tanjungsari (32.04.44.2007)

### Banjaran Villages (11)
1. Banjaran Kulon (32.04.13.2003)
2. Banjaran Wetan (32.04.13.2002)
3. Ciapus (32.04.13.2005)
4. Kamasan (32.04.13.2001)
5. Kiangroke (32.04.13.2007)
6. Margahurip (32.04.13.2013)
7. Mekarjaya (32.04.13.2012)
8. Neglasari (32.04.13.2016)
9. Pasirmulya (32.04.13.2018)
10. Sindangpanon (32.04.13.2006)
11. Tarajusari (32.04.13.2008)

## Troubleshooting

### If V18 fails with GTID error
The migration now includes `ALTER TABLE wilayah_level_3_4 ENGINE=InnoDB;` to fix this.

### If migration checksum fails
```sql
DELETE FROM flyway_schema_history WHERE version = '18.24012026.1320';
```
Then restart the application.

### If you want a clean reset
```bash
./reset_db.sh
```

## Files Created

- `V18_24012026_1320__normalize_cangkuang_banjaran_codes.sql` - The migration
- `RUN_IN_CONSOLE.sql` - Cleanup script for Database Console
- `VERIFY.sql` - Verification script for Database Console
- `FIX_STEPS.md` - This guide

## References

- Peraturan Daerah Kabupaten Bandung No. 7 Tahun 2003
- Kecamatan Cangkuang split from Banjaran in 2003
- BPS Code: 32.04.44 (Jawa Barat.Bandung.Cangkuang)
