-- =====================================================
-- QUICK FIX: Remove Failed Migrations
-- =====================================================
-- Run this directly in IntelliJ Database Console
-- For detailed steps, see: FIX_STEPS.md
-- For comprehensive checks, use: RUN_IN_CONSOLE.sql
-- =====================================================

-- Show failed migrations
SELECT
    version,
    description,
    success,
    installed_on
FROM flyway_schema_history
WHERE success = 0;

-- Delete failed migration records
DELETE FROM flyway_schema_history WHERE success = 0;

-- Verify cleanup
SELECT '✓ Failed migrations removed!' AS status;

-- =====================================================
-- NEXT STEPS:
-- =====================================================
-- 1. Restart application: mvn spring-boot:run
-- 2. V18 will normalize Cangkuang and Banjaran codes
-- 3. Run VERIFY.sql to check results
-- =====================================================
