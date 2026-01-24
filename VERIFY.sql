-- =====================================================
-- VERIFICATION SCRIPT
-- =====================================================
-- Run this AFTER restarting your application
-- =====================================================

-- Step 1: Check V18 migration status
SELECT '=== V18 MIGRATION STATUS ===' AS step;
SELECT
    version,
    description,
    success,
    execution_time,
    installed_on
FROM flyway_schema_history
WHERE version = '18.24012026.1320';

-- Step 2: Verify table engine
SELECT '=== TABLE ENGINE (should be InnoDB) ===' AS step;
SELECT
    TABLE_NAME,
    ENGINE,
    TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'wilayah_indo3'
  AND TABLE_NAME = 'wilayah_level_3_4';

-- Step 3: Verify Cangkuang kecamatan
SELECT '=== CANGKUANG KECAMATAN ===' AS step;
SELECT
    adm3_pcode,
    kode,
    parent_kode,
    adm3_en
FROM idn_admbnda_adm3_bps_20200401
WHERE adm3_pcode = '32.04.44';

-- Step 4: Verify Cangkuang in wilayah_level_3_4
SELECT '=== CANGKUANG IN KECAMATAN LIST ===' AS step;
SELECT
    kode,
    nama,
    parent_kode,
    level
FROM wilayah_level_3_4
WHERE kode = '32.04.44';

-- Step 5: List ALL kecamatan in Kabupaten Bandung
SELECT '=== ALL KECAMATAN IN KABUPATEN BANDUNG (32.04) ===' AS step;
SELECT
    kode,
    nama,
    parent_kode
FROM wilayah_level_3_4
WHERE parent_kode = '32.04'
  AND level = 3
ORDER BY kode;

-- Step 6: Count villages
SELECT '=== VILLAGE COUNTS ===' AS step;

-- Cangkuang villages (should be 7)
SELECT 'Cangkuang villages (should be 7):' AS info;
SELECT
    COUNT(*) as count,
    GROUP_CONCAT(adm4_en ORDER BY adm4_en SEPARATOR ', ') as villages
FROM all_villages
WHERE adm3_pcode = '32.04.44'
  AND kode IS NOT NULL;

-- Banjaran villages (should be 11)
SELECT 'Banjaran villages (should be 11):' AS info;
SELECT
    COUNT(*) as count,
    GROUP_CONCAT(adm4_en ORDER BY adm4_en SEPARATOR ', ') as villages
FROM all_villages
WHERE adm3_pcode = '32.04.13'
  AND kode IS NOT NULL;

-- Step 7: List Cangkuang villages in wilayah_level_3_4
SELECT '=== CANGKUANG VILLAGES IN wilayah_level_3_4 ===' AS step;
SELECT
    kode,
    nama,
    parent_kode,
    level
FROM wilayah_level_3_4
WHERE parent_kode = '32.04.44'
  AND level = 4
ORDER BY nama;

-- Step 8: List Banjaran villages in wilayah_level_3_4
SELECT '=== BANJARAN VILLAGES IN wilayah_level_3_4 ===' AS step;
SELECT
    kode,
    nama,
    parent_kode,
    level
FROM wilayah_level_3_4
WHERE parent_kode = '32.04.13'
  AND level = 4
ORDER BY nama;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- ✓ V18 migration: success = 1
-- ✓ wilayah_level_3_4 ENGINE: InnoDB
-- ✓ Cangkuang kecamatan: kode = '32.04.44', parent_kode = '32.04'
-- ✓ Cangkuang in kecamatan list: 1 row found
-- ✓ Kabupaten Bandung kecamatan list includes both Banjaran and Cangkuang
-- ✓ Cangkuang villages: 7 (Bandasari, Cangkuang, Ciluncat, Jatisari, Nagrak, Pananjung, Tanjungsari)
-- ✓ Banjaran villages: 11 (Banjaran Kulon, Banjaran Wetan, Ciapus, Kamasan, Kiangroke, Margahurip, Mekarjaya, Neglasari, Pasirmulya, Sindangpanon, Tarajusari)
-- ✓ All villages appear in wilayah_level_3_4
-- =====================================================

SELECT '=== ✓ VERIFICATION COMPLETE ===' AS result;
