#!/bin/bash

echo "======================================"
echo "Indonesia Map Application Startup"
echo "======================================"
echo ""

# Check Docker
echo "1. Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi
echo "✅ Docker is installed"

# Check Docker Compose
echo ""
echo "2. Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi
echo "✅ Docker Compose is installed"

# Start MySQL
echo ""
echo "3. Starting MySQL 9.5.0..."
docker-compose up -d

# Wait for MySQL to be healthy
echo ""
echo "4. Waiting for MySQL to be ready..."
for i in {1..30}; do
    if docker exec indonesia-map-mysql mysql -uyu71 -p53cret -e "SELECT 1;" &>/dev/null; then
        echo "✅ MySQL is ready!"
        break
    fi
    echo -n "."
    sleep 2
done

# Verify database
echo ""
echo "5. Verifying database..."
docker exec indonesia-map-mysql mysql -uyu71 -p53cret -e "SHOW DATABASES;" | grep wilayah_indo3 &>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Database 'wilayah_indo3' exists"
else
    echo "❌ Database not found!"
    exit 1
fi

# Start Application
echo ""
echo "6. Starting Spring Boot application..."
echo "   This will take 5-10 minutes on first run (Flyway migrations)"
echo "   Subsequent runs will be much faster (10-20 seconds)"
echo ""
echo "======================================"
echo "Starting application..."
echo "======================================"
echo ""

mvn spring-boot:run
