#!/bin/bash
# =====================================================
# Quick Run V18 Migration (Default Profile)
# =====================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Running V18 Migration with Default Profile${NC}"
echo ""

# Clean failed migrations
echo -e "${YELLOW}1. Cleaning failed migrations...${NC}"
mysql -h localhost -P 13306 -u yu71 -p53cret wilayah_indo3 -e "DELETE FROM flyway_schema_history WHERE success = 0;" 2>/dev/null || true
echo -e "${GREEN}✓ Done${NC}"
echo ""

# Build
echo -e "${YELLOW}2. Building application...${NC}"
mvn clean package -DskipTests -q
echo -e "${GREEN}✓ Done${NC}"
echo ""

# Run
echo -e "${YELLOW}3. Starting application...${NC}"
echo -e "${YELLOW}   Watch for: 'Successfully applied 1 migration'${NC}"
echo ""
mvn spring-boot:run
