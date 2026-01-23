# Startup Verification Guide

## Current Configuration

### MySQL Database
- **Version**: MySQL 9.5.0
- **Container**: indonesia-map-mysql
- **Host Port**: 13306
- **Container Port**: 3306
- **Database**: wilayah_indo3
- **Username**: yu71
- **Password**: 53cret
- **Root Password**: 53cret

### Application
- **Port**: 8080
- **Framework**: Spring Boot 4.0.1
- **Java**: 25

## Pre-Flight Checklist

### 1. Verify Docker is Running
```bash
docker --version
docker-compose --version
```

### 2. Start MySQL Container
```bash
# Start MySQL
docker-compose up -d

# Verify it's running and healthy
docker-compose ps

# Expected output:
# NAME                  IMAGE         STATUS
# indonesia-map-mysql   mysql:9.5.0   Up XX seconds (healthy)
```

### 3. Verify MySQL Connection
```bash
# Test database connection
docker exec indonesia-map-mysql mysql -uyu71 -p53cret -e "SHOW DATABASES;"

# Expected output should include:
# wilayah_indo3
```

### 4. Check MySQL Logs (if issues)
```bash
docker logs indonesia-map-mysql

# Should see:
# "ready for connections. Version: '9.5.0'"
```

## Application Startup

### Method 1: Maven Spring Boot Plugin (Recommended for Development)
```bash
# Clean build and run
mvn clean spring-boot:run

# Expected behavior:
# 1. Maven downloads dependencies
# 2. Compiles application
# 3. Flyway runs migrations (first time will take 5-10 minutes)
# 4. Application starts on port 8080
```

### Method 2: Build JAR and Run
```bash
# Build JAR
mvn clean package -DskipTests

# Run the JAR
java -jar target/indonesia-map-0.0.1-SNAPSHOT.jar
```

### Method 3: IDE (IntelliJ IDEA)
1. Open project in IntelliJ
2. Wait for Maven indexing
3. Find `IndonesiaMapApplication.java`
4. Right-click → Run 'IndonesiaMapApplication'

## First Startup (Flyway Migrations)

### What Happens
On first startup, Flyway will execute 28 migration files:

1. **V1**: Create base table (wilayah_level_1_2)
2. **V2-V8**: Insert provinces and regencies data
3. **V9.0**: Create Level 3 table (districts)
4. **V9.1-V9.8**: Insert districts data and normalize codes
5. **V10.0**: Create Level 4 table (villages)
6. **V10.1-V10.8**: Insert villages data and normalize codes
7. **V11**: Create verification views

### Timeline
- **Initial migration**: 5-10 minutes (inserts 89,532 records)
- **Subsequent starts**: 10-20 seconds (no migrations needed)

### Watch for These Log Messages
```
Flyway Community Edition by Redgate
Database: jdbc:mysql://localhost:13306/wilayah_indo3
Schema version: << Empty Schema >>
Successfully validated 28 migrations
Creating Schema History table: `wilayah_indo3`.`flyway_schema_history`
Current version of schema `wilayah_indo3`: << Empty Schema >>
Migrating schema `wilayah_indo3` to version "1 - create wilayah level 1 2 table"
...
Successfully applied 28 migrations to schema `wilayah_indo3`
```

## Verify Application is Running

### 1. Check Console Output
Look for:
```
Started IndonesiaMapApplication in XX.XXX seconds
Tomcat started on port 8080
```

### 2. Access Web Interface
```bash
# Open browser to:
http://localhost:8080
```

You should see:
- Header: "DATA WILAYAH INDONESIA"
- Theme selector dropdown
- Province dropdown with 38 provinces
- Interactive map centered on Indonesia
- Statistics cards showing:
  - 38 Provinsi
  - 514 Kabupaten/Kota
  - 7,069 Kecamatan
  - 81,911 Desa/Kelurahan

### 3. Test API Endpoints
```bash
# Get all regions (first few)
curl http://localhost:8080/wilayah/api/all | jq '.[0:3]'

# Get provinces only
curl http://localhost:8080/wilayah/api/all | jq '.[] | select(.kode | length == 2)'

# Get specific region (Jakarta)
curl http://localhost:8080/wilayah/api/boundaries/31 | jq

# Expected response includes:
# {
#   "kode": "31",
#   "nama": "DKI JAKARTA",
#   "ibukota": "Jakarta Pusat",
#   "lat": -6.2088,
#   "lng": 106.8456,
#   ...
# }
```

### 4. Test UI Functionality

#### Cascading Dropdowns
1. Select a Province → Regencies dropdown populates
2. Select a Regency → Districts dropdown populates
3. Select a District → Villages dropdown populates
4. Each selection updates detail panel and map

#### Theme Switcher
1. Click "Tema" dropdown in navbar
2. Click any color circle
3. UI colors change immediately
4. Refresh page → theme persists (localStorage)

#### Map Interaction
1. Click "Tampilkan Provinsi" → See 38 province markers
2. Click "Reset View" → Returns to Indonesia overview
3. Click any marker → Popup shows region details
4. Select region from dropdown → Map centers on location

## Troubleshooting

### Issue: Port 13306 Already in Use
```bash
# Check what's using the port
lsof -i :13306

# Kill the process or change port in compose.yaml
ports:
  - '13307:3306'  # Use different host port

# Update application.properties accordingly
spring.datasource.url=jdbc:mysql://localhost:13307/...
```

### Issue: MySQL Container Won't Start
```bash
# Clean up and restart
docker-compose down -v
docker-compose up -d

# Check logs
docker logs indonesia-map-mysql
```

### Issue: Application Can't Connect to MySQL
```bash
# Verify MySQL is healthy
docker-compose ps

# Check application.properties port matches compose.yaml
grep "datasource.url" src/main/resources/application.properties
# Should show: jdbc:mysql://localhost:13306/...

# Test connection from host
docker exec indonesia-map-mysql mysql -uyu71 -p53cret -e "SELECT 1;"
```

### Issue: Flyway Migration Fails
```bash
# Check Flyway schema history
docker exec indonesia-map-mysql mysql -uyu71 -p53cret wilayah_indo3 -e "SELECT * FROM flyway_schema_history;"

# If corrupted, reset database
docker-compose down -v
docker-compose up -d
# Restart application
```

### Issue: Application Starts but No Data
```bash
# Check if tables exist
docker exec indonesia-map-mysql mysql -uyu71 -p53cret wilayah_indo3 -e "SHOW TABLES;"

# Should see:
# - flyway_schema_history
# - wilayah_level_1_2
# - idn_admbnda_adm3_bps_20200401 (if V9 migrations ran)
# - all_villages (if V10 migrations ran)

# Check record count
docker exec indonesia-map-mysql mysql -uyu71 -p53cret wilayah_indo3 -e "SELECT COUNT(*) FROM wilayah_level_1_2;"

# Should see thousands of records
```

### Issue: UI Not Loading Properly
1. Check browser console (F12) for JavaScript errors
2. Verify CDN resources are loading:
   - W3.CSS: https://www.w3schools.com/w3css/4/w3.css
   - Font Awesome: https://cdnjs.cloudflare.com/...
3. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
4. Clear browser cache

### Issue: Theme Not Changing
1. Check browser LocalStorage (F12 → Application → Local Storage)
2. Look for 'selectedTheme' key
3. Clear if corrupted: `localStorage.removeItem('selectedTheme')`
4. Refresh page

### Issue: Dropdowns Not Cascading
1. Check HTMX is loaded: Browser Console → Type `htmx`
2. Check network tab for failed AJAX requests
3. Verify endpoints are responding:
   ```bash
   curl http://localhost:8080/wilayah/kabupaten-select/31
   ```

## Performance Metrics

### Expected Load Times
- **First Startup**: 5-10 minutes (Flyway migrations)
- **Subsequent Startups**: 10-20 seconds
- **Page Load**: 1-2 seconds
- **Dropdown Population**: 100-500ms
- **Map Marker Rendering**: 500-1000ms (38 provinces)

### Database Stats After Full Migration
```sql
-- Check table sizes
SELECT
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'wilayah_indo3'
ORDER BY (data_length + index_length) DESC;
```

## Success Indicators

✅ MySQL container is healthy
✅ Database `wilayah_indo3` exists
✅ 28 Flyway migrations applied successfully
✅ Application starts without errors
✅ Web UI loads at http://localhost:8080
✅ 38 provinces appear in dropdown
✅ Map shows Indonesia with province markers
✅ Cascading dropdowns work (Province → Regency → District → Village)
✅ Detail panel updates on selection
✅ Theme switcher changes colors
✅ API endpoints return JSON data

## Next Steps

Once verified:
1. Test all 4 levels of hierarchy
2. Try different provinces and regions
3. Experiment with theme colors
4. Check map interactions
5. Test API endpoints with different regions
6. Review Flyway migration logs
7. Monitor application logs for errors

## Support

If issues persist:
1. Check logs: `docker logs indonesia-map-mysql`
2. Check application logs in console
3. Review `target/surefire-reports` for test details
4. Check `IMPLEMENTATION_SUMMARY.md` for architecture details
5. Review `UI_CHANGES.md` for UI-specific issues

---

**Configuration Summary:**
- MySQL 9.5.0 on port 13306
- Spring Boot 4.0.1 on port 8080
- Flyway migrations enabled
- W3.CSS framework with 12 themes
- HTMX for dynamic interactions
- Leaflet for map visualization
