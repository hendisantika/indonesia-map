# Database Fix Log - Aceh Boundary Data

## Date: 2026-02-02

## Issue
9 out of 23 kabupaten/kota in Aceh province had incorrect boundary data format in the `wilayah_level_1_2` table.

## Problem Details
- **Expected format**: `[[[lat,lng], [lat,lng], ...]]` - Array of polygons
- **Actual format**: `[[lat,lng], [lat,lng], ...]]` - Single polygon without outer array wrapper

This caused the frontend interactive map to fail rendering boundaries with the error:
> "No valid polygons created from boundary data"

## Affected Regions (Fixed)
The following 9 kabupaten/kota had their `path` field corrected:

1. **11.02** - Kabupaten Aceh Tenggara
2. **11.04** - Kabupaten Aceh Tengah
3. **11.05** - Kabupaten Aceh Barat
4. **11.13** - Kabupaten Gayo Lues
5. **11.17** - Kabupaten Bener Meriah
6. **11.18** - Kabupaten Pidie Jaya
7. **11.73** - Kota Lhokseumawe
8. **11.74** - Kota Langsa
9. **11.75** - Kota Subulussalam

## Fix Applied
```sql
UPDATE wilayah_level_1_2
SET path = CONCAT('[', path, ']')
WHERE kode IN ('11.02', '11.04', '11.05', '11.13', '11.17', '11.18', '11.73', '11.74', '11.75')
  AND path NOT LIKE '[[[%';
```

## Result
- ✅ 9 rows updated successfully
- ✅ All 23 Aceh kabupaten/kota now have CORRECT_FORMAT
- ✅ Boundary data now renders correctly in the interactive map

## Verification
Run this query to verify the fix:
```sql
SELECT
    CASE
        WHEN path LIKE '[[%' AND path NOT LIKE '[[[%' THEN 'WRONG_FORMAT'
        WHEN path LIKE '[[[%' THEN 'CORRECT_FORMAT'
        ELSE 'UNKNOWN'
    END as format_status,
    COUNT(*) as count
FROM wilayah_level_1_2
WHERE kode LIKE '11.%'
  AND LENGTH(REPLACE(kode, '.', '')) = 4
GROUP BY format_status;
```

Expected result: All 23 should show `CORRECT_FORMAT`

## Notes
- The fix wrapped each single polygon in an extra array layer
- No coordinate data was modified, only the JSON structure
- This makes the data format consistent across all provinces
- The frontend code now works correctly with all Aceh regions

## Testing
To test the fix:
1. Navigate to http://localhost:3000/interactive
2. Select "11 - Aceh" from the Provinsi dropdown
3. Try selecting each of the 9 fixed kabupaten/kota
4. Verify that boundaries render correctly without console errors
5. Specifically test Kota Langsa (11.74) which had the smallest path data

## Recommendation
Consider running a similar diagnostic check on other provinces to ensure consistent data format across the entire database:

```sql
SELECT
    SUBSTRING(kode, 1, 2) as province_code,
    CASE
        WHEN path LIKE '[[%' AND path NOT LIKE '[[[%' THEN 'WRONG_FORMAT'
        WHEN path LIKE '[[[%' THEN 'CORRECT_FORMAT'
        ELSE 'UNKNOWN'
    END as format_status,
    COUNT(*) as count
FROM wilayah_level_1_2
WHERE LENGTH(REPLACE(kode, '.', '')) = 4  -- Kabupaten level only
GROUP BY province_code, format_status
HAVING format_status = 'WRONG_FORMAT'
ORDER BY province_code;
```
