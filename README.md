# Indonesia Map & Boundaries

[![Java CI with Maven](https://github.com/hendisantika/indonesia-map/actions/workflows/maven-build.yml/badge.svg)](https://github.com/hendisantika/indonesia-map/actions/workflows/maven-build.yml)
![Java](https://img.shields.io/badge/Java-25-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.1-brightgreen)
![MySQL](https://img.shields.io/badge/MySQL-9.5.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A comprehensive Spring Boot application for exploring Indonesia's administrative boundaries with interactive map visualization using Thymeleaf and HTMX.

## Features

- **4-Level Administrative Hierarchy**: Complete data for Provinsi → Kabupaten/Kota → Kecamatan → Desa/Kelurahan
- **Interactive Map with Boundaries**: Leaflet-based map showing GeoJSON boundary polygons for all levels
- **Cascading Dropdowns**: Dynamic HTMX-powered selectors that load dependent regions automatically
- **Boundary Visualization**: Real-time boundary display when selecting provinces, regencies, districts, or villages
- **W3.CSS Theme Switcher**: 12 color themes for customizable UI experience
- **Coordinate Format Conversion**: Automatic conversion between GeoJSON and Leaflet coordinate formats
- **RESTful API**: JSON endpoints for boundary data retrieval
- **Flyway Database Migrations**: Versioned schema management with Git LFS for large datasets
- **Responsive Design**: Mobile-friendly interface with W3.CSS framework

## Technology Stack

- **Backend**: Spring Boot 4.0.1, Spring Data JPA, Hibernate
- **Frontend**: Thymeleaf with Layout Dialect, HTMX 2.0.3, W3.CSS Framework
- **Map Library**: Leaflet 1.9.4 with boundary polygon support
- **Database**: MySQL 9.5.0 with spatial data (GeoJSON)
- **Migration**: Flyway with Git LFS for large SQL files
- **Build Tool**: Maven
- **Containerization**: Docker Compose

## Prerequisites

- **Java 25** (JDK 25 or higher)
- **MySQL 9.5.0** (or compatible version)
- **Maven 3.9+**
- **Docker & Docker Compose** (recommended)
- **Git LFS** (for cloning large migration files)

## Quick Start with Docker Compose

1. **Clone the repository** with Git LFS:
```bash
git clone https://github.com/hendisantika/indonesia-map.git
cd indonesia-map
git lfs pull
```

2. **Start MySQL container**:
```bash
docker compose up -d
```
This starts MySQL 9.5.0 on port **13306** with:
- Database: `wilayah_indo3`
- Username: `yu71`
- Password: `53cret`

3. **Build and run the application**:
```bash
mvn clean spring-boot:run
```

The first run will execute Flyway migrations to populate 87,068 administrative regions (this may take several minutes due to large datasets).

4. **Access the application**:
- **Home Page**: http://localhost:8080
- **Interactive Map with cascading selectors and boundary visualization**

## Database Setup (Manual)

If not using Docker Compose, set up MySQL manually:

1. **Install MySQL 9.5.0** or compatible version

2. **Create database and user**:
```sql
CREATE DATABASE wilayah_indo3;
CREATE USER 'yu71'@'localhost' IDENTIFIED BY '53cret';
GRANT ALL PRIVILEGES ON wilayah_indo3.* TO 'yu71'@'localhost';
FLUSH PRIVILEGES;
```

3. **Update database connection** in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/wilayah_indo3
spring.datasource.username=yu71
spring.datasource.password=53cret
```

Note: Change port from `13306` to `3306` if using local MySQL instead of Docker.

## Flyway Migrations

The project includes comprehensive Flyway migration scripts managed with **Git LFS** due to large file sizes:

### Migration Files Structure

- **V1**: Create `wilayah_level_1_2` table (for Provinsi and Kabupaten)
- **V2-V8**: Insert Level 1-2 data by region
  - V2: Sumatera (10 provinces, 126 regencies)
  - V3: Jawa-Bali (7 provinces, 120 regencies)
  - V4: Nusa Tenggara (3 provinces, 43 regencies)
  - V5: Kalimantan (5 provinces, 56 regencies)
  - V6: Sulawesi (6 provinces, 82 regencies)
  - V7: Maluku (2 provinces, 20 regencies)
  - V8: Papua (5 provinces, 66 regencies)

- **V9.0-V9.8**: Level 3 boundaries (Kecamatan - 4,606 districts)
  - V9.0: Create `wilayah_level_3_boundaries` table with geometry
  - V9.1-V9.7: Insert district GeoJSON data by region
  - V9.8: Normalize district codes

- **V10.0-V10.8**: Level 4 boundaries (Desa/Kelurahan - 81,911 villages)
  - V10.0: Create `wilayah_level_4_boundaries` table with geometry
  - V10.1-V10.7: Insert village GeoJSON data by region
  - V10.8: Normalize village codes

- **V11**: Create boundary verification views
- **V12**: Create unified `wilayah_level_3_4` table with JSON coordinate arrays
- **V13**: Populate Level 3 (Kecamatan) from geometry data - converts MySQL geometry to JSON
- **V14**: Populate Level 4 (Desa) from geometry data - extracts GeoJSON coordinates

### Data Statistics

- **38** Provinces (Provinsi)
- **513** Regencies/Cities (Kabupaten/Kota)
- **4,606** Districts (Kecamatan)
- **81,911** Villages/Sub-districts (Desa/Kelurahan)
- **Total**: 87,068 administrative regions with boundary data

## API Endpoints

### Web Pages

- `GET /` - Home page with interactive map and cascading selectors

### HTMX Endpoints (Fragment Rendering)

These endpoints return HTML fragments for dynamic content loading:

- `GET /wilayah/kabupaten-select/{provinsiKode}` - Load kabupaten dropdown for selected province
- `GET /wilayah/kecamatan-select/{kabupatenKode}` - Load kecamatan dropdown for selected kabupaten
- `GET /wilayah/desa-select/{kecamatanKode}` - Load desa dropdown for selected kecamatan

### REST API Endpoints

These endpoints return JSON data for boundary visualization:

- `GET /wilayah/api/boundary/{kode}` - Get GeoJSON boundary coordinates for a specific region
  - **Example**: `/wilayah/api/boundary/31` (DKI Jakarta province)
  - **Example**: `/wilayah/api/boundary/31.74` (Jakarta Selatan)
  - **Example**: `/wilayah/api/boundary/31.74.05` (Tambora kecamatan)
  - **Example**: `/wilayah/api/boundary/31.74.05.0001` (Kalianyar desa)
- Returns: `{ "coordinates": [...], "level": "Provinsi|Kabupaten|Kecamatan|Desa" }`

## Usage Guide

### Interactive Map with Cascading Selectors

1. **Select Province (Provinsi)**:
   - Choose a province from the first dropdown
   - The map automatically zooms to the province boundary
   - Province boundary polygon is displayed in blue

2. **Select Regency (Kabupaten/Kota)**:
   - After selecting a province, the kabupaten dropdown loads automatically
   - Choose a kabupaten to see its boundary on the map
   - The map zooms to the kabupaten area

3. **Select District (Kecamatan)**:
   - The kecamatan dropdown loads for the selected kabupaten
   - Select a kecamatan to view its boundary
   - Map updates to show the kecamatan polygon

4. **Select Village (Desa/Kelurahan)**:
   - The desa dropdown loads for the selected kecamatan
   - Select a desa to see its detailed boundary
   - Map centers on the village area

5. **Theme Customization**:
   - Click the theme button to choose from 12 color schemes
   - Themes persist across page reloads

### Map Features

- **Interactive Boundaries**: Click polygons for region information
- **Auto-zoom**: Map automatically centers on selected region
- **Coordinate Display**: View latitude/longitude for each region
- **GeoJSON Visualization**: All boundaries rendered from GeoJSON data

## HTMX Features

The application uses HTMX 2.0.3 for seamless, dynamic content updates:

- **Cascading Selectors**: Automatic loading of dependent dropdowns via `hx-get` and `hx-trigger`
- **Fragment Swapping**: Only updates necessary DOM sections (dropdowns, map boundaries)
- **Out-of-Band Swaps**: Multiple DOM updates from a single request
- **JavaScript Integration**: Custom handlers for province/kabupaten/kecamatan/desa selection
- **Loading States**: Visual feedback during HTMX requests

## Coordinate Format Conversion

The application handles two different coordinate formats from the database:

- **Provinsi/Kabupaten**: Stored as `[[[lat, lng]]]` (Leaflet format)
- **Kecamatan/Desa**: Stored as `[[[[lng, lat]]]]` (GeoJSON format from MySQL ST_AsGeoJSON)

JavaScript helper functions automatically:
1. Detect coordinate format by checking array depth
2. Identify if coordinates need swapping (longitude > 90 for Indonesia)
3. Convert GeoJSON `[lng, lat]` to Leaflet `[lat, lng]` format
4. Handle nested arrays for complex polygons

This ensures all boundary levels render correctly on the map.

## Project Structure

```
indonesia-map/
├── src/main/
│   ├── java/id/my/hendisantika/indonesiamap/
│   │   ├── controller/
│   │   │   ├── HomeController.java
│   │   │   └── WilayahController.java
│   │   ├── entity/
│   │   │   └── WilayahLevel12.java
│   │   ├── repository/
│   │   │   └── WilayahRepository.java
│   │   ├── service/
│   │   │   └── WilayahService.java
│   │   └── IndonesiaMapApplication.java
│   └── resources/
│       ├── db/migration/
│       │   ├── V1_*.sql through V11_*.sql
│       │   └── README files
│       ├── templates/
│       │   ├── fragments/
│       │   │   ├── wilayah-list.html
│       │   │   └── wilayah-detail.html
│       │   ├── index.html
│       │   ├── map.html
│       │   └── layout.html
│       └── application.properties
├── compose.yaml
└── pom.xml
```

## Development

### Continuous Integration

The project uses **GitHub Actions** for automated builds:

- **Workflow**: `.github/workflows/maven-build.yml`
- **Triggers**: Push to `main` branch and pull requests
- **Steps**:
  1. Checkout repository with Git LFS
  2. Set up JDK 25 (Temurin distribution)
  3. Verify compilation with Maven
  4. Package application (skip tests for CI speed)
  5. Verify JAR creation

### Git LFS (Large File Storage)

SQL migration files are tracked with Git LFS due to large sizes:

- **Total LFS data**: 832 MB across 31 SQL files
- **Tracked pattern**: `src/main/resources/db/migration/*.sql`
- **Setup**: `.gitattributes` configures LFS tracking
- **Clone**: Use `git lfs pull` after cloning to download large files

### Hot Reload

The project includes Spring Boot DevTools for automatic restart on code changes.

### Thymeleaf Cache

Thymeleaf cache is disabled in development for instant template updates:
```properties
spring.thymeleaf.cache=false
```

## Data Attribution

This project uses data from:
- **Humanitarian Data Exchange (HDX)**: Indonesia Administrative Boundaries (COD-AB)
- **BPS (Badan Pusat Statistik)**: Indonesian Central Statistics Agency
- Reference: Kepmendagri No 300.2.2-2138 Tahun 2025

## License

This project is licensed under the MIT License.

## Author

Created by Hendi Santika
- Email: hendisantika@gmail.com
- Telegram: @hendisantika34

## Support

For issues and feature requests, please create an issue in the repository.

## Performance Notes

- **First Run**: Flyway migrations may take 5-10 minutes to populate 87,068 administrative regions with boundary data
- **Database Size**: Approximately 2-3 GB after all migrations complete
- **Memory**: Recommend at least 2 GB RAM for MySQL container
- **Git LFS**: Ensure Git LFS is installed before cloning to download large SQL files (832 MB)

## Technical Highlights

✨ **Key Features**:
- 4-level cascading administrative hierarchy
- Real-time boundary visualization with GeoJSON
- Automatic coordinate format conversion (Leaflet ↔ GeoJSON)
- HTMX-powered dynamic UI without full page reloads
- W3.CSS responsive design with 12 themes
- Flyway versioned database migrations
- Git LFS for managing large datasets
- GitHub Actions CI/CD pipeline
- RESTful API for boundary data

---

**Repository**: https://github.com/hendisantika/indonesia-map
**Live Demo**: Run locally with Docker Compose at http://localhost:8080
