#!/bin/bash

# =====================================================
# Database Reset Script
# =====================================================
# This script will:
# 1. Stop the Spring Boot application if running
# 2. Drop and recreate the database
# 3. Restart the application to run Flyway migrations
# =====================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}====================================================${NC}"
echo -e "${YELLOW}Database Reset Script${NC}"
echo -e "${YELLOW}====================================================${NC}"

# Database credentials
DB_HOST="localhost"
DB_PORT="13306"
DB_NAME="wilayah_indo3"
DB_USER="yu71"
DB_PASS="53cret"

echo -e "${YELLOW}Database: ${DB_NAME}${NC}"
echo -e "${YELLOW}Host: ${DB_HOST}:${DB_PORT}${NC}"
echo ""

# Confirm before proceeding
read -p "This will DROP and RECREATE the database. Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 1: Dropping and recreating database...${NC}"

# Run the reset SQL script
mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} < reset_database.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database reset successful${NC}"
else
    echo -e "${RED}✗ Database reset failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Building application...${NC}"

# Build the application
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}Database reset complete!${NC}"
echo -e "${GREEN}====================================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run the application: mvn spring-boot:run"
echo "2. Flyway will automatically execute all migrations"
echo "3. Check logs for migration success"
echo ""
