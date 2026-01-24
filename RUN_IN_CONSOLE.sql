-- =====================================================
-- RUN THIS IN INTELLIJ DATABASE CONSOLE
-- =====================================================
-- This will clean failed migrations and verify setup
-- =====================================================

-- Step 1: Check current Flyway status
SELECT '=== CURRENT FLYWAY STATUS ===' AS step;
SELECT
    installed_rank,
    version,
    description,
    success,
    installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;

-- Step 2: Show failed migrations
SELECT '=== FAILED MIGRATIONS (will be deleted) ===' AS step;
SELECT
    version,
    description,
    script,
    success
FROM flyway_schema_history
WHERE success = 0;

-- Step 3: Delete failed migrations
SELECT '=== DELETING FAILED MIGRATIONS ===' AS step;
DELETE FROM flyway_schema_history WHERE success = 0;

SELECT 'Failed migrations removed!' AS status;

-- Step 4: Check table engine for wilayah_level_3_4
SELECT '=== TABLE ENGINE CHECK ===' AS step;
SELECT
    TABLE_NAME,
    ENGINE,
    TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'wilayah_indo3'
  AND TABLE_NAME = 'wilayah_level_3_4';

-- Step 5: Verify current state
SELECT '=== CURRENT DATA STATE ===' AS step;

-- Check Cangkuang kecamatan
SELECT 'Cangkuang kecamatan:' AS info;
SELECT
    adm3_pcode,
    kode,
    parent_kode,
    adm3_en
FROM idn_admbnda_adm3_bps_20200401
WHERE adm3_pcode = '32.04.44';

-- Check if Cangkuang is in wilayah_level_3_4
SELECT 'Cangkuang in wilayah_level_3_4:' AS info;
SELECT
    kode,
    nama,
    parent_kode,
    level
FROM wilayah_level_3_4
WHERE kode = '32.04.44';

-- Check Cangkuang villages count
SELECT 'Cangkuang villages count:' AS info;
SELECT
    COUNT(*) as total,
    COUNT(kode) as with_kode
FROM all_villages
WHERE adm3_pcode = '32.04.44';

-- Check Banjaran villages count
SELECT 'Banjaran villages count:' AS info;
SELECT
    COUNT(*) as total,
    COUNT(kode) as with_kode
FROM all_villages
WHERE adm3_pcode = '32.04.13';

-- =====================================================
-- AFTER RUNNING THIS:
-- =====================================================
-- 1. Restart your Spring Boot application
-- 2. V18 will run and fix everything
-- 3. Come back here and run VERIFY.sql
-- =====================================================

SELECT '=== READY! Now restart your application ===' AS result;
