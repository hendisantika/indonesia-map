#!/bin/bash
# =====================================================
# Start Application - V18 Migration
# =====================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║  Indonesia Map - V18 Migration Ready to Run      ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Check MySQL
echo -e "${YELLOW}Checking MySQL container...${NC}"
if docker ps | grep -q indonesia-map-mysql; then
    echo -e "${GREEN}✓ MySQL is running on port 13306${NC}"
else
    echo -e "${YELLOW}⚠ MySQL not running. Starting...${NC}"
    docker-compose up -d mysql
    echo "  Waiting for MySQL to be healthy..."
    sleep 10
    echo -e "${GREEN}✓ MySQL started${NC}"
fi
echo ""

# Show configuration
echo -e "${YELLOW}Configuration:${NC}"
echo "  Profile: default"
echo "  Database: localhost:13306/wilayah_indo3"
echo "  Docker Compose: disabled"
echo "  Flyway: enabled (DEBUG logging)"
echo ""

# Show what will happen
echo -e "${YELLOW}V18 Migration will:${NC}"
echo "  1. Convert wilayah_level_3_4 to InnoDB"
echo "  2. Normalize Cangkuang kecamatan code"
echo "  3. Normalize village codes"
echo "  4. Add Cangkuang to kecamatan list"
echo "  5. Add all villages to wilayah_level_3_4"
echo ""

echo "═══════════════════════════════════════════════════"
echo -e "${GREEN}Starting application...${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Watch for:"
echo "  ✓ 'Migrating schema ... to version 18.24012026.1320'"
echo "  ✓ 'Successfully applied 1 migration'"
echo "  ✓ 'Started IndonesiaMapApplication'"
echo ""
echo "After startup, verify with: VERIFY.sql"
echo ""
echo "═══════════════════════════════════════════════════"
echo ""

# Start the app
mvn spring-boot:run
