-- =====================================================
-- QUICK FIX: Remove Failed Migration and Retry
-- =====================================================
-- Run this directly in IntelliJ Database Console
-- =====================================================

-- Step 1: Check current status
SELECT '=== Current Flyway History ===' AS info;
SELECT
    installed_rank,
    version,
    description,
    success,
    execution_time,
    installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;

-- Step 2: Show failed migrations
SELECT '=== Failed Migrations ===' AS info;
SELECT
    version,
    description,
    script,
    installed_on
FROM flyway_schema_history
WHERE success = 0;

-- Step 3: Delete failed migration records
SELECT '=== Removing Failed Migrations ===' AS info;
DELETE FROM flyway_schema_history WHERE success = 0;

-- Step 4: Verify cleanup
SELECT '=== After Cleanup ===' AS info;
SELECT
    installed_rank,
    version,
    description,
    success
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 10;

-- =====================================================
-- NEXT STEPS:
-- =====================================================
-- 1. Stop your Spring Boot application
-- 2. Restart it: mvn spring-boot:run
-- 3. Watch the console for migration success
-- 4. Flyway will retry V16, V17, V18 with fixed SQL
-- =====================================================

SELECT '=== DONE! Now restart your application ===' AS info;
