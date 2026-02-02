-- Diagnostic query to find kabupaten/kota in Aceh with missing or invalid boundary data
-- Run this query against your database to identify problematic regions

-- 1. Find all kabupaten/kota in Aceh
SELECT
    kode,
    nama,
    CASE
        WHEN path IS NULL THEN 'NULL'
        WHEN TRIM(path) = '' THEN 'EMPTY'
        WHEN path = '[]' THEN 'EMPTY_ARRAY'
        WHEN JSON_VALID(path) = 0 THEN 'INVALID_JSON'
        WHEN JSON_LENGTH(path) = 0 THEN 'ZERO_LENGTH_ARRAY'
        ELSE 'HAS_DATA'
    END AS boundary_status,
    lat,
    lng,
    LENGTH(path) as path_length
FROM wilayah_level_1_2
WHERE kode LIKE '11.%'  -- Aceh province code is 11
  AND LENGTH(REPLACE(kode, '.', '')) = 4  -- Kabupaten level (4 digits without dots)
ORDER BY kode;

-- 2. Count of issues by type
SELECT
    CASE
        WHEN path IS NULL THEN 'NULL'
        WHEN TRIM(path) = '' THEN 'EMPTY'
        WHEN path = '[]' THEN 'EMPTY_ARRAY'
        WHEN JSON_VALID(path) = 0 THEN 'INVALID_JSON'
        WHEN JSON_LENGTH(path) = 0 THEN 'ZERO_LENGTH_ARRAY'
        ELSE 'HAS_DATA'
    END AS boundary_status,
    COUNT(*) as count
FROM wilayah_level_1_2
WHERE kode LIKE '11.%'
  AND LENGTH(REPLACE(kode, '.', '')) = 4
GROUP BY boundary_status;

-- 3. Specific problematic kabupaten with details
SELECT
    kode,
    nama,
    ibukota,
    lat,
    lng,
    SUBSTRING(path, 1, 100) as path_preview
FROM wilayah_level_1_2
WHERE kode LIKE '11.%'
  AND LENGTH(REPLACE(kode, '.', '')) = 4
  AND (path IS NULL OR TRIM(path) = '' OR path = '[]' OR JSON_VALID(path) = 0 OR JSON_LENGTH(path) = 0)
ORDER BY kode;
