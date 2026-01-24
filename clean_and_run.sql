-- Clean failed migrations
DELETE FROM flyway_schema_history WHERE success = 0;

-- Show what will run next
SELECT
    COALESCE(MAX(CAST(SUBSTRING_INDEX(version, '.', 1) AS UNSIGNED)), 0) + 1 as next_migration_number,
    'V18 will run if not already applied' as status
FROM flyway_schema_history;

-- Check if V18 already exists
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN 'V18 already applied - will skip'
        ELSE 'V18 will be applied on next startup'
    END as v18_status
FROM flyway_schema_history
WHERE version = '18.24012026.1320';
