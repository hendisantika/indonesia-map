# Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Start MySQL
docker-compose up -d

# Start Application (automatic script)
./start.sh

# OR manually
mvn spring-boot:run

# Stop MySQL
docker-compose down
```

## 🔗 URLs

| Service | URL |
|---------|-----|
| **Web Interface** | http://localhost:8080 |
| **MySQL** | localhost:13306 |
| **API - All Regions** | http://localhost:8080/wilayah/api/all |
| **API - Province by Code** | http://localhost:8080/wilayah/api/boundaries/31 |

## 🔑 Credentials

| Service | Username | Password | Database |
|---------|----------|----------|----------|
| **MySQL** | yu71 | 53cret | wilayah_indo3 |
| **MySQL Root** | root | 53cret | - |

## 📊 Database Stats

| Level | Count | Table |
|-------|-------|-------|
| **Provinsi** | 38 | wilayah_level_1_2 (LENGTH(kode)=2) |
| **Kabupaten/Kota** | 514 | wilayah_level_1_2 (LENGTH(kode)=5) |
| **Kecamatan** | 7,069 | wilayah_level_1_2 (LENGTH(kode)=8) |
| **Desa/Kelurahan** | 81,911 | wilayah_level_1_2 (LENGTH(kode)=13) |
| **TOTAL** | 89,532 | |

## 🛠️ Useful Commands

### Docker Commands
```bash
# View MySQL logs
docker logs indonesia-map-mysql

# Check container status
docker-compose ps

# Connect to MySQL CLI
docker exec -it indonesia-map-mysql mysql -uyu71 -p53cret wilayah_indo3

# Stop and remove everything (including data!)
docker-compose down -v
```

### Database Queries
```sql
-- Count provinces
SELECT COUNT(*) FROM wilayah_level_1_2 WHERE LENGTH(kode) = 2;

-- List all provinces
SELECT kode, nama, ibukota FROM wilayah_level_1_2 WHERE LENGTH(kode) = 2 ORDER BY nama;

-- Get Jakarta data
SELECT * FROM wilayah_level_1_2 WHERE kode = '31';

-- Check Flyway migration status
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- Table sizes
SELECT
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'wilayah_indo3';
```

### Maven Commands
```bash
# Clean build
mvn clean install

# Run without tests
mvn clean install -DskipTests

# Run application
mvn spring-boot:run

# Package JAR
mvn clean package

# Run JAR
java -jar target/indonesia-map-0.0.1-SNAPSHOT.jar
```

### API Testing
```bash
# Get all data
curl http://localhost:8080/wilayah/api/all | jq

# Get only provinces
curl http://localhost:8080/wilayah/api/all | jq '.[] | select(.kode | length == 2)'

# Get Jakarta details
curl http://localhost:8080/wilayah/api/boundaries/31 | jq

# Get regencies for Aceh (province code: 11)
curl http://localhost:8080/wilayah/kabupaten-select/11

# Search for regions
curl "http://localhost:8080/wilayah/search?keyword=Jakarta"
```

## 🎨 Available Themes

Click "Tema" dropdown in navbar to select:

- **Black** (Dark)
- **Brown** (Earth)
- **Pink** (Bright)
- **Orange** (Warm)
- **Amber** (Gold)
- **Lime** (Fresh)
- **Green** (Nature)
- **Teal** (Ocean)
- **Purple** (Royal)
- **Indigo** (Default)
- **Blue** (Sky)
- **Cyan** (Cool)

## 📱 UI Features

### Cascading Dropdowns
1. **Provinsi** → Select to load Kabupaten/Kota
2. **Kabupaten/Kota** → Select to load Kecamatan
3. **Kecamatan** → Select to load Desa/Kelurahan
4. **Desa/Kelurahan** → Final level

### Map Controls
- **Reset View** - Return to Indonesia overview
- **Tampilkan Provinsi** - Show all 38 province markers

### Detail Panel
Shows for selected region:
- Kode (Code)
- Level (Administrative level)
- Ibukota (Capital city, if applicable)
- Koordinat (Coordinates)
- Luas (Area in km²)
- Penduduk (Population)
- Elevasi (Elevation in meters)
- Zona Waktu (Time zone)

## 🐛 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Port 13306 in use | `lsof -i :13306` then kill process or change port |
| MySQL won't start | `docker-compose down -v && docker-compose up -d` |
| App won't connect | Check port 13306 in application.properties |
| No data showing | Wait for Flyway migrations (5-10 min first run) |
| Dropdowns not working | Check browser console, verify HTMX loaded |
| Theme not saving | Clear browser LocalStorage |
| Map not showing | Check internet connection (needs CDN) |

## 📂 Project Structure

```
indonesia-map/
├── src/main/java/.../
│   ├── controller/        # Web & API controllers
│   ├── entity/            # JPA entities
│   ├── repository/        # Data access
│   └── service/           # Business logic
├── src/main/resources/
│   ├── db/migration/      # 28 Flyway SQL files
│   └── templates/         # Thymeleaf HTML
├── compose.yaml           # Docker configuration
├── pom.xml               # Maven dependencies
└── start.sh              # Auto-start script
```

## 🔍 Health Checks

```bash
# Is MySQL healthy?
docker-compose ps | grep healthy

# Is app running?
curl -s http://localhost:8080 | grep "DATA WILAYAH"

# Can connect to DB?
docker exec indonesia-map-mysql mysql -uyu71 -p53cret -e "SELECT 1;"

# Are migrations done?
docker exec indonesia-map-mysql mysql -uyu71 -p53cret wilayah_indo3 -e "SELECT COUNT(*) FROM flyway_schema_history;"
# Should return 28

# How many records?
docker exec indonesia-map-mysql mysql -uyu71 -p53cret wilayah_indo3 -e "SELECT COUNT(*) FROM wilayah_level_1_2;"
```

## 📊 Performance Benchmarks

| Metric | Expected Value |
|--------|---------------|
| First startup | 5-10 minutes |
| Normal startup | 10-20 seconds |
| Page load | 1-2 seconds |
| Dropdown load | 100-500ms |
| API response | 50-200ms |
| Map render (38 markers) | 500-1000ms |

## 📞 Support Files

| File | Purpose |
|------|---------|
| **README.md** | Full documentation |
| **QUICKSTART.md** | Basic setup guide |
| **STARTUP_VERIFICATION.md** | Detailed verification steps |
| **UI_CHANGES.md** | UI redesign details |
| **IMPLEMENTATION_SUMMARY.md** | Technical overview |
| **QUICK_REFERENCE.md** | This file |

## ⚡ Power User Tips

1. **Faster restarts**: Keep MySQL running, only restart Spring Boot
2. **Skip tests**: Use `-DskipTests` flag with Maven
3. **Theme persistence**: Uses browser localStorage
4. **API pagination**: Not implemented (returns all ~89k records)
5. **Map performance**: Showing all villages at once may be slow
6. **Browser cache**: Hard refresh with Ctrl+F5 after updates
7. **Log level**: Adjust in application.properties for debugging
8. **Hot reload**: DevTools included, code changes auto-restart

---

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Spring Boot**: 4.0.1
**MySQL**: 9.5.0
**Java**: 25
