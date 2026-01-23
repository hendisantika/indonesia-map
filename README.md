# Indonesia Map & Boundaries

A comprehensive Spring Boot application for exploring Indonesia's administrative boundaries with interactive map visualization using Thymeleaf and HTMX.

## Features

- **Multi-Level Administrative Data**: Province, Regency, District, and Village levels
- **Interactive UI**: Dynamic content loading with HTMX
- **Map Visualization**: Leaflet-based interactive map with boundary overlays
- **Search Functionality**: Real-time search across all administrative levels
- **Detailed Information**: View coordinates, area, population, and more
- **Flyway Migrations**: Database schema and data managed through versioned migrations

## Technology Stack

- **Backend**: Spring Boot 4.0.1, Spring Data JPA
- **Frontend**: Thymeleaf, HTMX 2.0.3, Bootstrap 5.3.3
- **Map Library**: Leaflet 1.9.4
- **Database**: MySQL 8.0+
- **Migration**: Flyway
- **Build Tool**: Maven

## Prerequisites

- Java 25
- MySQL 8.0 or higher
- Maven 3.6+
- Docker & Docker Compose (optional)

## Quick Start with Docker Compose

1. Start MySQL container:
```bash
docker-compose up -d
```

2. Build and run the application:
```bash
mvn clean install
mvn spring-boot:run
```

3. Access the application:
- Home: http://localhost:8080
- Interactive Map: http://localhost:8080/map

## Database Setup (Manual)

If not using Docker Compose:

1. Create MySQL database:
```sql
CREATE DATABASE wilayah_indo3;
```

2. Update database credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=root
```

## Flyway Migrations

The project includes comprehensive Flyway migration scripts:

### Migration Files Structure

- **V1-V8**: Level 1-2 tables (Provinces and Regencies)
  - V1: Create base table structure
  - V2-V8: Insert data for different regions (Sumatera, Jawa-Bali, Nusa Tenggara, Kalimantan, Sulawesi, Maluku, Papua)

- **V9.0-V9.8**: Level 3 boundaries (Districts/Kecamatan)
  - V9.0: Create level 3 table with geometry support
  - V9.1-V9.7: Insert district data by region
  - V9.8: Normalize district codes

- **V10.0-V10.8**: Level 4 boundaries (Villages/Desa & Kelurahan)
  - V10.0: Create village table with geometry support
  - V10.1-V10.7: Insert village data by region
  - V10.8: Normalize village codes

- **V11**: Create boundary verification views

### Data Statistics

- 38 Provinces
- 514 Regencies
- 7,069 Districts
- 81,911 Villages

## API Endpoints

### Web Pages

- `GET /` - Home page with wilayah list
- `GET /map` - Interactive map view

### HTMX Endpoints (Fragment Rendering)

- `GET /wilayah/provinsi` - Load province list
- `GET /wilayah/kabupaten/{provinsiKode}` - Load regencies by province
- `GET /wilayah/kecamatan/{kabupatenKode}` - Load districts by regency
- `GET /wilayah/desa/{kecamatanKode}` - Load villages by district
- `GET /wilayah/search?keyword={keyword}` - Search wilayah
- `GET /wilayah/detail/{kode}` - Load detail panel

### REST API Endpoints

- `GET /wilayah/api/boundaries/{kode}` - Get boundary data for specific region
- `GET /wilayah/api/all` - Get all regions with boundaries

## Usage Guide

### Home Page

1. **Browse by Level**: Click on provinces to drill down to regencies, districts, and villages
2. **Search**: Type in the search box to find regions by name
3. **View Details**: Click on any region to see detailed information in the side panel
4. **Statistics**: View quick stats for all administrative levels

### Map View

1. **Interactive Markers**: Hover over markers to see region information
2. **Controls**:
   - **Reset View**: Return to Indonesia overview
   - **Load All Boundaries**: Show all available boundaries
   - **Show Provinces**: Display only provincial markers
3. **Popup Details**: Click markers for detailed information

## HTMX Features

The application uses HTMX for seamless, dynamic content updates:

- **Lazy Loading**: Content loads on-demand when exploring regions
- **Search Debouncing**: Search triggers after 500ms of typing inactivity
- **Fragment Swapping**: Only updates necessary DOM sections
- **Loading Indicators**: Visual feedback during data fetching

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

---

**Note**: The initial data load via Flyway migrations may take several minutes due to the large dataset (especially Level 3 and Level 4 boundaries with geometry data).
