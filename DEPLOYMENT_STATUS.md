# Indonesia Map - Deployment Status

**Date:** 2026-01-25
**Time:** 11:30 WIB
**Status:** ✅ Ready for Deployment

---

## Build Status ✅

### Docker Image
- **Image ID:** eb2f2d73b141
- **Size:** 1.94 GB (883 MB compressed)
- **Tag:** 16, latest
- **Registry:** Docker Hub (hendisantika/indonesia-map)

### Docker Hub Repository
- **Repository:** hendisantika/indonesia-map
- **URL:** https://hub.docker.com/r/hendisantika/indonesia-map
- **Status:** Ready ✅
- **Images:**
  - ✅ hendisantika/indonesia-map:16
  - ✅ hendisantika/indonesia-map:latest

---

## Deployment Targets

### Production Server
- **Host:** 103.31.204.189
- **Port:** 2000
- **Database:** 103.31.204.189:3306/wilayah_indo
- **Profile:** dev
- **Status:** Ready for deployment

### Dev Server (Alternative)
- **Host:** 165.22.246.205
- **Port:** 2000
- **Database:** 165.22.246.205:3306/wilayah_indo
- **Profile:** dev
- **Database Status:** Cleaned and ready ✅

---

## Deployment Instructions

### Quick Deployment (Recommended)

SSH to production server (103.31.204.189) and run:

```bash
# 1. Copy the deployment script to server
scp deploy-to-production.sh mhdcdev@103.31.204.189:~/

# 2. SSH to server and run
ssh mhdcdev@103.31.204.189
chmod +x deploy-to-production.sh
./deploy-to-production.sh
```

### Manual Deployment

If you prefer to deploy manually:

```bash
# SSH to server
ssh mhdcdev@103.31.204.189

# Pull image
docker pull hendisantika/indonesia-map:16

# Stop old container (if exists)
docker stop indonesia-map 2>/dev/null || true
docker rm indonesia-map 2>/dev/null || true

# Run new container
docker run -d \
  --name indonesia-map \
  --restart unless-stopped \
  -p 2000:2000 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e DB_URL='jdbc:mysql://103.31.204.189:3306/wilayah_indo?createDatabaseIfNotExist=true&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=Asia/Jakarta&useSSL=false&allowPublicKeyRetrieval=true' \
  -e DB_USERNAME=deployer \
  -e DB_PASSWORD='0nePiece2025!' \
  -e SERVER_PORT=2000 \
  hendisantika/indonesia-map:16

# Monitor logs
docker logs -f indonesia-map
```

---

## Post-Deployment Verification

### 1. Check Container Status
```bash
docker ps | grep indonesia-map
```

Expected:
```
CONTAINER ID   IMAGE            STATUS       PORTS                    NAMES
xxxxx          indonesia-map:16 Up X minutes 0.0.0.0:2000->2000/tcp   indonesia-map
```

### 2. Monitor Migration Progress
```bash
docker logs -f indonesia-map | grep -E "Migrating|Successfully applied"
```

Expected to see all 37 migrations complete:
```
✅ Migrating schema `wilayah_indo` to version "1.22012026.2300 - create wilayah level 1 2 table"
...
✅ Successfully applied 37 migrations to schema `wilayah_indo`
```

Migration timing:
- V1-V8 (Level 1-2): ~30 seconds
- V9.0-V9.8 (Level 3): ~2-3 minutes
- V10.0-V10.8 (Level 4): ~5-8 minutes
- V11-V21: ~1-2 minutes
- **Total**: 10-15 minutes

### 3. Check Application Startup
```bash
docker logs indonesia-map | tail -30
```

Expected:
```
✅ Started IndonesiaMapApplication in X.XX seconds
```

### 4. Test Health Endpoint
```bash
curl http://localhost:2000/actuator/health
```

Expected:
```json
{"status":"UP"}
```

### 5. Test Application Homepage
```bash
curl http://localhost:2000/ | head -20
```

Should return HTML with "Data Wilayah Indonesia"

### 6. Verify Database Migrations
```bash
docker exec indonesia-map mysql -h 103.31.204.189 -udeployer -p0nePiece2025! wilayah_indo \
  -e "SELECT COUNT(*) FROM flyway_schema_history WHERE success = 1;"
```

Expected: **37** (all migrations successful)

### 7. Check Data Loaded
```bash
docker exec indonesia-map mysql -h 103.31.204.189 -udeployer -p0nePiece2025! wilayah_indo \
  -e "SELECT COUNT(*) FROM wilayah_level_1_2; SELECT COUNT(*) FROM wilayah_level_3_4;"
```

Expected:
- wilayah_level_1_2: 551 records
- wilayah_level_3_4: 86,518 records

---

## Access URLs

Once deployed:

- **Homepage:** http://103.31.204.189:2000
- **Health:** http://103.31.204.189:2000/actuator/health
- **API Boundary Example:** http://103.31.204.189:2000/wilayah/api/boundary/31

---

## Troubleshooting

### If Container Won't Start
```bash
# Check logs
docker logs indonesia-map

# Check if port is in use
netstat -tuln | grep 2000

# Test database connectivity
docker exec indonesia-map ping -c 3 103.31.204.189
```

### If Migrations Fail
```bash
# Check for failed migrations
docker exec indonesia-map mysql -h 103.31.204.189 -udeployer -p0nePiece2025! wilayah_indo \
  -e "SELECT * FROM flyway_schema_history WHERE success = 0;"

# Clean failed migrations
docker exec indonesia-map mysql -h 103.31.204.189 -udeployer -p0nePiece2025! wilayah_indo \
  -e "DELETE FROM flyway_schema_history WHERE success = 0;"

# Restart container
docker restart indonesia-map
```

### If Application Not Accessible
```bash
# Check if running
docker ps | grep indonesia-map

# Check firewall
sudo ufw status
sudo ufw allow 2000/tcp

# Test from server
curl http://localhost:2000/actuator/health
```

---

## Rollback Procedure

If you need to rollback to a previous version:

```bash
# Stop current container
docker stop indonesia-map
docker rm indonesia-map

# Pull previous version (adjust tag as needed)
docker pull hendisantika/indonesia-map:15

# Run previous version
docker run -d \
  --name indonesia-map \
  --restart unless-stopped \
  -p 2000:2000 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e DB_URL='jdbc:mysql://103.31.204.189:3306/wilayah_indo?...' \
  -e DB_USERNAME=deployer \
  -e DB_PASSWORD='0nePiece2025!' \
  -e SERVER_PORT=2000 \
  hendisantika/indonesia-map:15
```

---

## Build Information

### Local Build
- **Date:** 2026-01-25 11:26
- **Build Time:** ~3 minutes
- **Maven:** Clean package with tests skipped
- **JDK:** Eclipse Temurin 25 (Alpine)
- **Base Image:** eclipse-temurin:25-jre-alpine

### Files Included
- Application JAR: indonesia-map-0.0.1-SNAPSHOT.jar
- 37 Flyway migration files (832 MB total)
- Spring Boot configuration
- Static resources

### Configuration
- **Spring Profile:** dev
- **Server Port:** 2000
- **Database:** MySQL 8.0/9.0
- **JVM Options:** Default with security RNG optimization

---

## Next Steps

1. ✅ Copy `deploy-to-production.sh` to production server
2. ⏳ Run deployment script
3. ⏳ Monitor migration progress (10-15 minutes)
4. ⏳ Verify application startup
5. ⏳ Test endpoints
6. ⏳ Configure reverse proxy (nginx) if needed
7. ⏳ Set up SSL certificate for HTTPS
8. ⏳ Configure monitoring/alerting

---

**Ready to Deploy!** 🚀

Run the deployment script on 103.31.204.189 to start the application.
