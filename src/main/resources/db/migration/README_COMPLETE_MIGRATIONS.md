# Complete Flyway Migrations for Indonesia Administrative Boundaries

## Overview

This directory contains **27 Flyway migration files** covering all 4 administrative levels with complete boundary data for Indonesia.

**Total Coverage:**
- 38 Provinces (Level 1)
- 513 Regencies/Cities (Level 2)
- 7,069 Sub-districts (Level 3)
- 81,911 Villages (Level 4)
- **Total: 89,531 administrative units with geographic boundaries**

## Migration Structure

### Level 1-2: Provinces & Regencies (V1-V8)

| Version | File | Size | Records | Description |
|---------|------|------|---------|-------------|
| V1 | `V1_22012026_2300__create_wilayah_level_1_2_table.sql` | 1.9KB | 0 | Create table schema |
| V2 | `V2_22012026_2301__insert_wilayah_sumatera.sql` | 5.7MB | 164 | Sumatera region |
| V3 | `V3_22012026_2302__insert_wilayah_jawa_bali.sql` | 2.5MB | 134 | Jawa-Bali region |
| V4 | `V4_22012026_2303__insert_wilayah_nusa_tenggara.sql` | 2.5MB | 34 | Nusa Tenggara region |
| V5 | `V5_22012026_2304__insert_wilayah_kalimantan.sql` | 2.9MB | 61 | Kalimantan region |
| V6 | `V6_22012026_2305__insert_wilayah_sulawesi.sql` | 5.2MB | 87 | Sulawesi region |
| V7 | `V7_22012026_2306__insert_wilayah_maluku.sql` | 1.9MB | 23 | Maluku region |
| V8 | `V8_22012026_2307__insert_wilayah_papua.sql` | 2.0MB | 48 | Papua region |
| **Subtotal** | | **~23MB** | **551** | |

### Level 3: Sub-districts (V9-V9.8)

| Version | File | Size | Records | Description |
|---------|------|------|---------|-------------|
| V9 | `V9_23012026_1000__create_wilayah_level_3_boundaries_table.sql` | 3.2KB | 0 | Create table schema |
| V9.1 | `V9.1_23012026_1010__insert_wilayah_level_3_sumatera.sql` | 39MB | 1,955 | Sumatera region |
| V9.2 | `V9.2_23012026_1020__insert_wilayah_level_3_jawa_bali.sql` | 83MB | 2,153 | Jawa-Bali region |
| V9.3 | `V9.3_23012026_1030__insert_wilayah_level_3_nusa_tenggara.sql` | 28MB | 480 | Nusa Tenggara region |
| V9.4 | `V9.4_23012026_1040__insert_wilayah_level_3_kalimantan.sql` | 26MB | 618 | Kalimantan region |
| V9.5 | `V9.5_23012026_1050__insert_wilayah_level_3_sulawesi.sql` | 33MB | 1,026 | Sulawesi region |
| V9.6 | `V9.6_23012026_1060__insert_wilayah_level_3_maluku.sql` | 17MB | 236 | Maluku region |
| V9.7 | `V9.7_23012026_1070__insert_wilayah_level_3_papua.sql` | 6.5MB | 601 | Papua region |
| V9.8 | `V9.8_23012026_1080__normalize_level_3_codes.sql` | 1.8KB | - | Normalize codes |
| **Subtotal** | | **~233MB** | **7,069** | |

### Level 4: Villages (V10-V10.8)

| Version | File | Size | Records | Description |
|---------|------|------|---------|-------------|
| V10 | `V10_23012026_1001__create_wilayah_level_4_boundaries_table.sql` | 3.8KB | 0 | Create table schema |
| V10.1 | `V10.1_23012026_1110__insert_wilayah_level_4_sumatera.sql` | 88MB | 25,571 | Sumatera region |
| V10.2 | `V10.2_23012026_1120__insert_wilayah_level_4_jawa_bali.sql` | 231MB | 25,376 | Jawa-Bali region |
| V10.3 | `V10.3_23012026_1130__insert_wilayah_level_4_nusa_tenggara.sql` | 64MB | 5,183 | Nusa Tenggara region |
| V10.4 | `V10.4_23012026_1140__insert_wilayah_level_4_kalimantan.sql` | 40MB | 7,228 | Kalimantan region |
| V10.5 | `V10.5_23012026_1150__insert_wilayah_level_4_sulawesi.sql` | 65MB | 10,648 | Sulawesi region |
| V10.6 | `V10.6_23012026_1160__insert_wilayah_level_4_maluku.sql` | 22MB | 2,473 | Maluku region |
| V10.7 | `V10.7_23012026_1170__insert_wilayah_level_4_papua.sql` | 14MB | 5,432 | Papua region |
| V10.8 | `V10.8_23012026_1180__normalize_level_4_codes.sql` | 2.2KB | - | Normalize codes |
| **Subtotal** | | **~524MB** | **81,911** | |

### Views & Verification (V11)

| Version | File | Size | Description |
|---------|------|------|-------------|
| V11 | `V11_23012026_1200__create_boundary_verification_views.sql` | 4.3KB | Create verification views |

---

## Total Summary

| Category | Migrations | Total Size | Total Records |
|----------|-----------|-----------|---------------|
| Level 1-2 | 8 files | 23MB | 551 |
| Level 3 | 9 files | 233MB | 7,069 |
| Level 4 | 9 files | 524MB | 81,911 |
| Views | 1 file | 4KB | - |
| **TOTAL** | **27 files** | **~780MB** | **89,531** |

---

## Execution Order

The migrations will execute in this order:

1. **V1** - Create `wilayah_level_1_2` table
2. **V2-V8** - Insert Level 1-2 data (provinces & regencies)
3. **V9** - Create `idn_admbnda_adm3_bps_20200401` table
4. **V9.1-V9.7** - Insert Level 3 data (sub-districts) by region
5. **V9.8** - Normalize Level 3 codes (ID110101 → 11.01.01)
6. **V10** - Create `all_villages` table
7. **V10.1-V10.7** - Insert Level 4 data (villages) by region
8. **V10.8** - Normalize Level 4 codes (ID11010120001 → 11.01.01.2001)
9. **V11** - Create verification views

---

## Usage

### Quick Start

```bash
# Configure Flyway
cd /Users/hendisantika/Desktop/wilayah-indonesia
cp flyway.conf.example flyway.conf
# Edit flyway.conf with your database credentials

# Run all migrations
flyway migrate
```

### Selective Migration

```bash
# Run only up to a specific version
flyway migrate -target=V8         # Only Level 1-2
flyway migrate -target=V9.8       # Up to Level 3
flyway migrate -target=V10.8      # Up to Level 4
flyway migrate                     # All migrations including views
```

### Regional Deployment

Deploy only specific regions:

```bash
# Deploy only Sumatera data
flyway migrate -target=V2         # Level 1-2 Sumatera
flyway migrate -target=V9.1       # Level 3 Sumatera
flyway migrate -target=V10.1      # Level 4 Sumatera

# Deploy only Jawa-Bali
flyway migrate -target=V3         # Level 1-2 Jawa-Bali
flyway migrate -target=V9.2       # Level 3 Jawa-Bali
flyway migrate -target=V10.2      # Level 4 Jawa-Bali
```

---

## Database Tables Created

### `wilayah_level_1_2`
- Contains: Provinces (38) and Regencies/Cities (513)
- Has boundaries: ✅ YES (GeoJSON format in `path` field)
- Key fields: `kode`, `nama`, `lat`, `lng`, `path`

### `idn_admbnda_adm3_bps_20200401`
- Contains: Sub-districts (7,069)
- Has boundaries: ✅ YES (PostGIS GEOMETRY)
- Key fields: `adm3_pcode`, `adm3_en`, `kode`, `parent_kode`, `geom`
- Normalized `kode`: Matches `wilayah` table format (11.01.01)

### `all_villages`
- Contains: Villages (81,911)
- Has boundaries: ✅ YES (PostGIS GEOMETRY)
- Key fields: `adm4_pcode`, `adm4_en`, `kode`, `parent_kode`, `geom`
- Normalized `kode`: Matches `wilayah` table format (11.01.01.2001)

---

## Code Normalization

HDX data uses different code format than the `wilayah` table:

| Level | HDX Format | Normalized Format | Example |
|-------|-----------|------------------|---------|
| 1 | `ID11` | `11` | Aceh |
| 2 | `ID1101` | `11.01` | Kab. Aceh Selatan |
| 3 | `ID110101` | `11.01.01` | Bakongan |
| 4 | `ID11010120001` | `11.01.01.2001` | Keude Bakongan |

**V9.8 and V10.8** automatically populate the `kode` field with normalized values using:

```sql
-- Level 3 normalization (V9.8)
UPDATE idn_admbnda_adm3_bps_20200401
SET kode = CONCAT(
    SUBSTRING(adm3_pcode, 3, 2), '.',
    SUBSTRING(adm3_pcode, 5, 2), '.',
    SUBSTRING(adm3_pcode, 7, 2)
);

-- Level 4 normalization (V10.8)
UPDATE all_villages
SET kode = CONCAT(
    SUBSTRING(adm4_pcode, 3, 2), '.',
    SUBSTRING(adm4_pcode, 5, 2), '.',
    SUBSTRING(adm4_pcode, 7, 2), '.',
    SUBSTRING(adm4_pcode, 9, 4)
);
```

---

## Verification Views (V11)

After all migrations complete, you'll have these views:

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
Summary statistics for all levels.

```sql
SELECT * FROM v_boundary_statistics;
```

### `v_complete_hierarchy`
Complete administrative hierarchy with boundaries.

```sql
SELECT * FROM v_complete_hierarchy
WHERE province_code = '11';
```

---

## Performance Considerations

### Import Time Estimates

| Level | Size | Estimated Time |
|-------|------|----------------|
| V1-V8 (Level 1-2) | 23MB | 1-2 minutes |
| V9.1-V9.8 (Level 3) | 233MB | 5-10 minutes |
| V10.1-V10.8 (Level 4) | 524MB | 15-30 minutes |
| V11 (Views) | 4KB | < 1 second |
| **Total** | **780MB** | **20-45 minutes** |

### Database Optimization

Before running migrations:

```sql
-- Increase packet size for large geometries
SET GLOBAL max_allowed_packet=1073741824;

-- Increase buffer pool for better performance
SET GLOBAL innodb_buffer_pool_size=4294967296;
```

### Disk Space Requirements

- **Minimum**: 1GB free space
- **Recommended**: 2-3GB free space (including indexes and temp files)

---

## Flyway Configuration Example

```properties
# flyway.conf
flyway.url=jdbc:mysql://localhost:3306/wilayah_indonesia?allowPublicKeyRetrieval=true&useSSL=false
flyway.user=root
flyway.password=your_password
flyway.locations=filesystem:db/migration
flyway.connectRetries=3
flyway.connectRetriesInterval=10

# Allow out-of-order execution if needed
flyway.outOfOrder=false

# Validate migrations before running
flyway.validateOnMigrate=true
```

---

## Verification Queries

After all migrations complete:

```sql
-- Check all tables exist
SHOW TABLES;

-- Verify record counts
SELECT 'Level 1-2' as level, COUNT(*) as records
FROM wilayah_level_1_2
UNION ALL
SELECT 'Level 3', COUNT(*)
FROM idn_admbnda_adm3_bps_20200401
UNION ALL
SELECT 'Level 4', COUNT(*)
FROM all_villages;

-- Expected output:
-- Level 1-2: 551
-- Level 3: 7,069
-- Level 4: 81,911

-- Check normalization
SELECT
    COUNT(*) as total,
    COUNT(kode) as normalized,
    COUNT(DISTINCT kode) as unique_codes
FROM idn_admbnda_adm3_bps_20200401;

-- Test boundary join
SELECT w.kode, w.nama, b.adm3_en, ST_AsGeoJSON(b.geom) as boundary
FROM wilayah w
JOIN idn_admbnda_adm3_bps_20200401 b USING (kode)
WHERE LENGTH(w.kode) = 8
LIMIT 5;
```

---

## Troubleshooting

### Issue: Migration fails with "Packet too large"
```sql
SET GLOBAL max_allowed_packet=1073741824;
```
Then restart Flyway.

### Issue: Out of memory during import
- Import Level 3 and Level 4 separately
- Restart MySQL between Level 3 and Level 4
- Increase system swap space

### Issue: Views fail to create (V11)
- Ensure `wilayah` table exists first
- Import `wilayah.sql` before running migrations

### Issue: Slow query performance
```sql
-- Create additional indexes if needed
CREATE INDEX idx_province ON idn_admbnda_adm3_bps_20200401(adm1_pcode);
CREATE SPATIAL INDEX idx_geom ON idn_admbnda_adm3_bps_20200401(geom);
```

---

## Regional Coverage

| Region | Provinces | Level 1-2 | Level 3 | Level 4 |
|--------|-----------|-----------|---------|---------|
| Sumatera | 10 | V2 | V9.1 | V10.1 |
| Jawa-Bali | 7 | V3 | V9.2 | V10.2 |
| Nusa Tenggara | 2 | V4 | V9.3 | V10.3 |
| Kalimantan | 5 | V5 | V9.4 | V10.4 |
| Sulawesi | 6 | V6 | V9.5 | V10.5 |
| Maluku | 2 | V7 | V9.6 | V10.6 |
| Papua | 6 | V8 | V9.7 | V10.7 |

---

## Data Sources

- **Level 1-2**: cahyadsn/wilayah_boundaries (GitHub)
- **Level 3-4**: HDX Indonesia COD-AB (Humanitarian Data Exchange)
- **Date**: 2020-04-01 (BPS Data)
- **License**: Open Data

---

## Additional Documentation

- `FLYWAY_MIGRATIONS_README.md` - Original Level 1-2 guide
- `README_LEVEL_3_4_MIGRATIONS.md` - Level 3-4 details (deprecated by this file)
- `../FINAL_SUMMARY.md` - Complete project overview
- `../hdx_download/HDX_DOWNLOAD_SUMMARY.md` - HDX data details
- `../hdx_download/NORMALIZATION_GUIDE.md` - Code normalization guide

---

## Success Criteria

After running all 27 migrations, you should have:

- ✅ 89,531 administrative units in database
- ✅ All units have geographic boundaries
- ✅ Normalized codes matching `wilayah` table format
- ✅ 4 verification views for easy querying
- ✅ Spatial indexes for performance
- ✅ Complete administrative hierarchy

---

**Status**: ✅ Ready for Production

**Last Updated**: 2026-01-23

**Total Migrations**: 27 files

**Total Data**: ~780MB

**Total Records**: 89,531 administrative boundaries
