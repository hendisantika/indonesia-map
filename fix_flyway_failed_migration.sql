-- =====================================================
-- Fix Failed Flyway Migration
-- =====================================================
-- This script removes failed migration records from
-- flyway_schema_history to allow Flyway to retry
-- =====================================================

-- Show current flyway history
SELECT
    installed_rank,
    version,
    description,
    type,
    script,
    installed_on,
    execution_time,
    success
FROM flyway_schema_history
ORDER BY installed_rank;

-- Show only failed migrations
SELECT
    installed_rank,
    version,
    description,
    script,
    success
FROM flyway_schema_history
WHERE success = 0;

-- Delete failed migration records
-- This allows Flyway to retry the migration
DELETE FROM flyway_schema_history
WHERE success = 0;

-- Verify cleanup
SELECT
    installed_rank,
    version,
    description,
    success
FROM flyway_schema_history
ORDER BY installed_rank;

-- =====================================================
-- AFTER RUNNING THIS SCRIPT:
-- =====================================================
-- 1. Restart your Spring Boot application
-- 2. Flyway will retry the failed migrations
-- 3. Check console for success messages
-- =====================================================
