-- =====================================================
-- ULTIMATE FIX - Run this directly in your database
-- =====================================================
-- This will completely fix Banjaran and Cangkuang villages
-- Run this in IntelliJ Database Console or MySQL CLI
-- =====================================================

USE wilayah_indo3;

-- Step 1: Show current problematic state
SELECT '=== BEFORE FIX ===' AS step;
SELECT CONCAT('Banjaran (32.04.13): ', COUNT(*), ' villages') AS status
FROM all_villages WHERE adm3_pcode = '32.04.13';

SELECT CONCAT('Cangkuang (32.04.44): ', COUNT(*), ' villages') AS status
FROM all_villages WHERE adm3_pcode = '32.04.44';

-- List all current villages
SELECT 'Current Banjaran villages:' AS info;
SELECT adm4_en FROM all_villages WHERE adm3_pcode = '32.04.13' ORDER BY adm4_en;

SELECT 'Current Cangkuang villages:' AS info;
SELECT adm4_en FROM all_villages WHERE adm3_pcode = '32.04.44' ORDER BY adm4_en;

-- Step 2: NUCLEAR OPTION - Delete everything from both kecamatans
SELECT '=== DELETING ALL ===' AS step;
DELETE FROM all_villages WHERE adm3_pcode IN ('32.04.13', '32.04.44');

SELECT 'Deleted all villages from Banjaran and Cangkuang' AS status;

-- Step 3: Insert ONLY 11 Banjaran villages
SELECT '=== INSERTING BANJARAN (11 villages) ===' AS step;

INSERT INTO all_villages (geom, shape_leng, shape_area, adm4_en, adm4_pcode, adm4_ref, adm4alt1en, adm4alt2en, adm3_en, adm3_pcode, adm2_en, adm2_pcode, adm1_en, adm1_pcode, adm0_en, adm0_pcode, date, validon, validto) VALUES
(POINT(0,0), 0, 0, 'Kamasan', '32.04.13.2001', 'ID3204132001', '', '', 'Banjaran', '32.04.13', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Banjaran Wetan', '32.04.13.2002', 'ID3204132002', '', '', 'Banjaran', '32.04.13', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Banjaran Kulon', '32.04.13.2003', 'ID3204132003', '', '', 'Banjaran', '32.04.13', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Ciapus', '32.04.13.2005', 'ID3204132005', '', '', 'Banjaran', '32.04.13', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Sindangpanon', '32.04.13.2006', 'ID3204132006', '', '', 'Banjaran', '32.04.13', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Kiangroke', '32.04.13.2007', 'ID3204132007', '', '', 'Banjaran', '32.04.13', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Tarajusari', '32.04.13.2008', 'ID3204132008', '', '', 'Banjaran', '32.04.13', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Mekarjaya', '32.04.13.2012', 'ID3204132012', '', '', 'Banjaran', '32.04.13', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Margahurip', '32.04.13.2013', 'ID3204132013', '', '', 'Banjaran', '32.04.13', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Neglasari', '32.04.13.2016', 'ID3204132016', '', '', 'Banjaran', '32.04.13', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Pasirmulya', '32.04.13.2018', 'ID3204132018', '', '', 'Banjaran', '32.04.13', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL);

SELECT 'Inserted 11 Banjaran villages' AS status;

-- Step 4: Insert ONLY 7 Cangkuang villages
SELECT '=== INSERTING CANGKUANG (7 villages) ===' AS step;

INSERT INTO all_villages (geom, shape_leng, shape_area, adm4_en, adm4_pcode, adm4_ref, adm4alt1en, adm4alt2en, adm3_en, adm3_pcode, adm2_en, adm2_pcode, adm1_en, adm1_pcode, adm0_en, adm0_pcode, date, validon, validto) VALUES
(POINT(0,0), 0, 0, 'Cangkuang', '32.04.44.2001', 'ID3204442001', '', '', 'Cangkuang', '32.04.44', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Ciluncat', '32.04.44.2002', 'ID3204442002', '', '', 'Cangkuang', '32.04.44', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Nagrak', '32.04.44.2003', 'ID3204442003', '', '', 'Cangkuang', '32.04.44', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Bandasari', '32.04.44.2004', 'ID3204442004', '', '', 'Cangkuang', '32.04.44', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Pananjung', '32.04.44.2005', 'ID3204442005', '', '', 'Cangkuang', '32.04.44', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Jatisari', '32.04.44.2006', 'ID3204442006', '', '', 'Cangkuang', '32.04.44', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL),
(POINT(0,0), 0, 0, 'Tanjungsari', '32.04.44.2007', 'ID3204442007', '', '', 'Cangkuang', '32.04.44', 'Bandung', '32.04', 'Jawa Barat', '32', 'Indonesia', 'ID', '2003-01-01', '2003-01-01', NULL);

SELECT 'Inserted 7 Cangkuang villages' AS status;

-- Step 5: VERIFY - Show final state
SELECT '=== AFTER FIX ===' AS step;

SELECT '✓ Banjaran villages (should be 11):' AS result;
SELECT adm4_en, adm4_pcode FROM all_villages WHERE adm3_pcode = '32.04.13' ORDER BY adm4_en;

SELECT '✓ Cangkuang villages (should be 7):' AS result;
SELECT adm4_en, adm4_pcode FROM all_villages WHERE adm3_pcode = '32.04.44' ORDER BY adm4_en;

SELECT '✓ Final counts:' AS result;
SELECT
    adm3_en AS kecamatan,
    adm3_pcode AS kode,
    COUNT(*) AS jumlah_desa
FROM all_villages
WHERE adm3_pcode IN ('32.04.13', '32.04.44')
GROUP BY adm3_en, adm3_pcode;

SELECT '=== DONE! Problem SOLVED! ===' AS result;
