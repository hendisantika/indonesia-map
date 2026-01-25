# 🚨 CRITICAL FIX - Database Connection Issue

## Problem Identified ❌

Your application is connecting to the **WRONG DATABASE SERVER**:

```
Current (Wrong): jdbc:mysql://165.22.246.205:3306/wilayah_indo
Expected (Correct): jdbc:mysql://103.31.204.189:3306/wilayah_indo
```

The application is deployed on **103.31.204.189** but trying to connect to **165.22.246.205**.

## Root Cause

The environment variable `DB_URL` is not being set correctly, so it's using the default fallback value from `application-dev.properties`:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:13306/wilayah_indo...}
```

The fallback defaults to `localhost:13306` which doesn't match the actual database on 103.31.204.189:3306.

## Solution ✅

### Option 1: Use the Fixed Deployment Script (Recommended)

I've created `deploy-to-dev-server.sh` which:
1. ✅ Cleans failed migrations
2. ✅ Sets correct DB_URL to 103.31.204.189:3306
3. ✅ Deploys with proper configuration

**Run on dev server (103.31.204.189):**
```bash
./deploy-to-dev-server.sh
```

### Option 2: Manual Fix (If script doesn't work)

**Step 1: Clean Failed Migrations**
```bash
mysql -h 103.31.204.189 -udeployer -p0nePiece2025! wilayah_indo \
  -e "DELETE FROM flyway_schema_history WHERE success = 0;"
```

**Step 2: Stop Old Container**
```bash
docker stop indonesia-map
docker rm indonesia-map
```

**Step 3: Start with Correct Configuration**
```bash
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

**IMPORTANT:** Note the DB_URL now points to **103.31.204.189:3306** (not 165.22.246.205)

## Verification

After starting, you should see in the logs:

```
✅ Database: jdbc:mysql://103.31.204.189:3306/wilayah_indo (MySQL 8.0)
✅ Migrating schema `wilayah_indo` to version "1.22012026.2300 - create wilayah level 1 2 table"
```

NOT:
```
❌ Database: jdbc:mysql://165.22.246.205:3306/wilayah_indo
```

## Why This Happens

The `application-dev.properties` file has:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:13306/wilayah_indo3...}
```

When `DB_URL` environment variable is **not set** or **empty**, it uses the fallback value which references `localhost:13306`.

But on the dev server:
- The database is on **103.31.204.189:3306** (standard MySQL port)
- NOT on **localhost:13306**

## Prevention

Always explicitly set `DB_URL` when running the container:

```bash
-e DB_URL='jdbc:mysql://103.31.204.189:3306/wilayah_indo?...'
```

Don't rely on the default fallback value in application-dev.properties.

## Quick Test

After deployment, verify the correct database is being used:

```bash
# Check logs
docker logs indonesia-map | grep "Database:"

# Should show:
# Database: jdbc:mysql://103.31.204.189:3306/wilayah_indo (MySQL 8.0)
```

---

**Use the `deploy-to-dev-server.sh` script to deploy correctly!** 🚀
