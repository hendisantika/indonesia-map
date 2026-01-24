-- =====================================================
-- Reset Database Script
-- =====================================================
-- This script will drop and recreate the database
-- to ensure clean Flyway migration execution
-- =====================================================

-- Drop the database if it exists
DROP DATABASE IF EXISTS `wilayah_indo3`;

-- Recreate the database
CREATE DATABASE `wilayah_indo3`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Use the database
USE `wilayah_indo3`;

-- =====================================================
-- NOTES:
-- =====================================================
-- After running this script:
-- 1. Restart your Spring Boot application
-- 2. Flyway will automatically run all migrations in order
-- 3. Check console for migration success messages
-- =====================================================
