#!/bin/bash
# =====================================================
# Test V18 Migration with Default Profile
# =====================================================
# This script ensures the migration runs successfully
# with Spring Boot default profile
# =====================================================

set -e  # Exit on error

echo "=============================================="
echo "Testing V18 Migration - Default Profile"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database credentials
DB_HOST="localhost"
DB_PORT="13306"
DB_NAME="wilayah_indo3"
DB_USER="yu71"
DB_PASS="53cret"

# Step 1: Check database connection
echo -e "${YELLOW}Step 1: Checking database connection...${NC}"
if mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection OK${NC}"
else
    echo -e "${RED}✗ Cannot connect to database${NC}"
    echo "Please ensure MySQL is running on ${DB_HOST}:${DB_PORT}"
    exit 1
fi
echo ""

# Step 2: Check current Flyway status
echo -e "${YELLOW}Step 2: Checking Flyway migration status...${NC}"
FAILED_COUNT=$(mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -N -e "SELECT COUNT(*) FROM flyway_schema_history WHERE success = 0;" 2>/dev/null || echo "0")
echo "Failed migrations: ${FAILED_COUNT}"

if [ "${FAILED_COUNT}" -gt "0" ]; then
    echo -e "${YELLOW}Found ${FAILED_COUNT} failed migration(s). Cleaning...${NC}"
    mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -e "DELETE FROM flyway_schema_history WHERE success = 0;"
    echo -e "${GREEN}✓ Failed migrations cleaned${NC}"
fi
echo ""

# Step 3: Check if V18 already exists
echo -e "${YELLOW}Step 3: Checking V18 migration status...${NC}"
V18_EXISTS=$(mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -N -e "SELECT COUNT(*) FROM flyway_schema_history WHERE version = '18.24012026.1320';" 2>/dev/null || echo "0")

if [ "${V18_EXISTS}" -gt "0" ]; then
    echo -e "${GREEN}✓ V18 already applied${NC}"
    V18_SUCCESS=$(mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -N -e "SELECT success FROM flyway_schema_history WHERE version = '18.24012026.1320';" 2>/dev/null)
    if [ "${V18_SUCCESS}" = "1" ]; then
        echo -e "${GREEN}✓ V18 migration successful${NC}"
    else
        echo -e "${RED}✗ V18 migration failed previously${NC}"
        echo "Removing failed V18 record..."
        mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -e "DELETE FROM flyway_schema_history WHERE version = '18.24012026.1320';"
    fi
else
    echo -e "${YELLOW}V18 not yet applied${NC}"
fi
echo ""

# Step 4: Build the application
echo -e "${YELLOW}Step 4: Building application...${NC}"
if mvn clean package -DskipTests -q; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Step 5: Check migration file exists
echo -e "${YELLOW}Step 5: Verifying V18 migration file...${NC}"
if [ -f "target/classes/db/migration/V18_24012026_1320__normalize_cangkuang_banjaran_codes.sql" ]; then
    echo -e "${GREEN}✓ V18 migration file found${NC}"
    FILE_SIZE=$(wc -c < "target/classes/db/migration/V18_24012026_1320__normalize_cangkuang_banjaran_codes.sql")
    echo "  File size: ${FILE_SIZE} bytes"
else
    echo -e "${RED}✗ V18 migration file not found${NC}"
    exit 1
fi
echo ""

# Step 6: Verify current state before migration
echo -e "${YELLOW}Step 6: Checking current database state...${NC}"
echo "Cangkuang kecamatan status:"
mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -e "
SELECT
    adm3_pcode,
    kode,
    parent_kode,
    adm3_en
FROM idn_admbnda_adm3_bps_20200401
WHERE adm3_pcode = '32.04.44';" 2>/dev/null || echo "Not found or error"

echo ""
echo "Cangkuang in wilayah_level_3_4:"
CANGKUANG_IN_LIST=$(mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -N -e "SELECT COUNT(*) FROM wilayah_level_3_4 WHERE kode = '32.04.44';" 2>/dev/null || echo "0")
if [ "${CANGKUANG_IN_LIST}" -gt "0" ]; then
    echo -e "${GREEN}✓ Cangkuang already in kecamatan list${NC}"
else
    echo -e "${YELLOW}⚠ Cangkuang NOT in kecamatan list (will be added by V18)${NC}"
fi
echo ""

# Step 7: Check Flyway configuration
echo -e "${YELLOW}Step 7: Verifying Flyway configuration in application.properties...${NC}"
if grep -q "spring.flyway.enabled=true" src/main/resources/application.properties; then
    echo -e "${GREEN}✓ Flyway enabled${NC}"
else
    echo -e "${RED}✗ Flyway not enabled${NC}"
    exit 1
fi

if grep -q "spring.flyway.baseline-on-migrate=true" src/main/resources/application.properties; then
    echo -e "${GREEN}✓ Baseline on migrate enabled${NC}"
fi

if grep -q "spring.flyway.out-of-order=true" src/main/resources/application.properties; then
    echo -e "${GREEN}✓ Out-of-order migrations allowed${NC}"
fi

if grep -q "logging.level.org.flywaydb=DEBUG" src/main/resources/application.properties; then
    echo -e "${GREEN}✓ Flyway DEBUG logging enabled${NC}"
fi
echo ""

# Step 8: Instructions for running
echo "=============================================="
echo -e "${GREEN}Pre-flight checks PASSED!${NC}"
echo "=============================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start the application with default profile:"
echo -e "   ${YELLOW}mvn spring-boot:run${NC}"
echo ""
echo "2. Watch for these log messages:"
echo "   - 'Migrating schema \`wilayah_indo3\` to version \"18.24012026.1320\"'"
echo "   - 'Successfully applied 1 migration'"
echo ""
echo "3. After application starts, verify with:"
echo -e "   ${YELLOW}mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < VERIFY.sql${NC}"
echo ""
echo "   Or in IntelliJ Database Console, run: VERIFY.sql"
echo ""
echo "=============================================="

# Step 9: Ask if user wants to run now
echo ""
read -p "Do you want to start the application now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Starting application with default profile...${NC}"
    echo ""
    mvn spring-boot:run
else
    echo ""
    echo "You can start the application manually when ready:"
    echo "  mvn spring-boot:run"
    echo ""
fi
