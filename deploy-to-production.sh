#!/bin/bash
set -e

echo "🚀 Deploying Indonesia Map Application to Dev Server"
echo "====================================================="
echo ""

# Configuration
IMAGE="hendisantika/indonesia-map:16"
CONTAINER_NAME="indonesia-map"
PORT="2000"
DB_HOST="103.31.204.189"  # Dev server - database is on same server
DB_USER="deployer"
DB_PASS="0nePiece2025!"
DB_NAME="wilayah_indo"

echo "📋 Configuration:"
echo "  - Image: $IMAGE"
echo "  - Container: $CONTAINER_NAME"
echo "  - Port: $PORT"
echo "  - Database: $DB_HOST:3306/$DB_NAME (local database)"
echo ""

# STEP 1: Clean failed migrations first
echo "🧹 Step 1: Cleaning failed migrations from database..."
mysql -h $DB_HOST -u$DB_USER -p$DB_PASS $DB_NAME -e "DELETE FROM flyway_schema_history WHERE success = 0;" 2>/dev/null || echo "No failed migrations or couldn't connect to clean"
echo "✅ Database cleanup attempted"
echo ""

# STEP 2: Stop and remove existing container
echo "🛑 Step 2: Stopping existing container (if any)..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true
echo "✅ Old container removed"
echo ""

# STEP 3: Pull latest image
echo "📥 Step 3: Pulling latest image from ECR..."
docker pull $IMAGE
echo "✅ Image pulled successfully"
echo ""

# STEP 4: Start container with CORRECT database URL
echo "🎬 Step 4: Starting new container..."
echo "  ⚠️  Using DB_URL: jdbc:mysql://${DB_HOST}:3306/${DB_NAME}"
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:$PORT \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e DB_URL="jdbc:mysql://${DB_HOST}:3306/${DB_NAME}?createDatabaseIfNotExist=true&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=Asia/Jakarta&useSSL=false&allowPublicKeyRetrieval=true" \
  -e DB_USERNAME=$DB_USER \
  -e DB_PASSWORD=$DB_PASS \
  -e SERVER_PORT=$PORT \
  $IMAGE

echo "✅ Container started!"
echo ""

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check container status
echo ""
echo "📊 Container Status:"
docker ps | grep $CONTAINER_NAME || echo "❌ Container not running!"
echo ""

# Show recent logs
echo "📝 Recent logs:"
docker logs --tail 50 $CONTAINER_NAME
echo ""

# Check health
echo "🏥 Checking application health..."
sleep 5
curl -s http://localhost:$PORT/actuator/health || echo "❌ Health check failed"
echo ""
echo ""

echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "🌐 Application URL: http://103.31.204.189:$PORT"
echo "🏥 Health Check: http://103.31.204.189:$PORT/actuator/health"
echo ""
echo "📖 Useful Commands:"
echo "  - View logs: docker logs -f $CONTAINER_NAME"
echo "  - Stop app: docker stop $CONTAINER_NAME"
echo "  - Restart: docker restart $CONTAINER_NAME"
echo "  - Remove: docker rm -f $CONTAINER_NAME"
echo ""
echo "📊 Monitor migrations:"
echo "  docker logs $CONTAINER_NAME | grep -E 'Migrating schema|Successfully applied'"
echo ""
