# Quick Start Guide

## Step 1: Start Database

Using Docker Compose (recommended):
```bash
docker-compose up -d
```

Or use your local MySQL server and create the database:
```sql
CREATE DATABASE wilayah_indo3;
```

## Step 2: Configure Database Connection

The application is pre-configured to connect to:
- **Host**: localhost:3306
- **Database**: wilayah_indo3
- **Username**: root
- **Password**: root

To change these, edit `src/main/resources/application.properties`

## Step 3: Build & Run

```bash
# Clean build
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will:
1. Connect to MySQL
2. Run Flyway migrations (this may take a few minutes on first run)
3. Start the web server on port 8080

## Step 4: Access the Application

Open your browser and navigate to:

### Main Application
- **Home Page**: http://localhost:8080
  - Browse provinces, regencies, districts, and villages
  - Search for regions
  - View detailed information

- **Interactive Map**: http://localhost:8080/map
  - View Indonesia map with markers
  - Click markers for region details
  - Explore boundary overlays

### API Endpoints

Test the REST API:

```bash
# Get all provinces
curl http://localhost:8080/wilayah/api/all | jq '.[] | select(.kode | length == 2)'

# Get specific region by code
curl http://localhost:8080/wilayah/api/boundaries/11 | jq

# Search regions
curl "http://localhost:8080/wilayah/search?keyword=Jakarta"
```

## What to Expect

### First Run
- Flyway will execute 28 migration files
- This creates tables and inserts data for:
  - 38 Provinces
  - 514 Regencies/Cities
  - 7,069 Districts
  - 81,911 Villages
- Initial migration may take 5-10 minutes depending on your system

### User Interface

1. **Home Page Features**:
   - Search box with real-time results (500ms debounce)
   - Province list that expands to show regencies
   - Click through hierarchy: Province → Regency → District → Village
   - Detail panel showing coordinates, area, population
   - Statistics cards showing counts at each level

2. **Map Page Features**:
   - Centered on Indonesia (-2.5489, 118.0149)
   - Province markers with popup information
   - Controls to reset view, load boundaries, filter levels
   - Zoom and pan capabilities
   - Scale indicator

## Troubleshooting

### Database Connection Failed
- Check if MySQL is running: `docker-compose ps` or `mysql -u root -p`
- Verify credentials in application.properties
- Ensure port 3306 is not in use

### Flyway Migration Errors
- Check MySQL version (8.0+ required)
- Verify database character set is UTF-8
- Review logs in console output

### Port Already in Use
Change the port in application.properties:
```properties
server.port=8081
```

### Slow Initial Load
This is normal for first run. Subsequent starts will be much faster as data is already in the database.

## Next Steps

1. Explore the interactive UI with HTMX
2. Try the search functionality
3. View different administrative levels
4. Check the map visualization
5. Test the REST API endpoints

## HTMX in Action

The application uses HTMX for dynamic content:
- Click on a province → HTMX loads regencies without page reload
- Type in search → HTMX updates results after 500ms
- Click "Show Details" → HTMX swaps detail panel content
- All without writing JavaScript!

## Technologies Demonstrated

✅ Spring Boot 4.0.1 with Java 25
✅ Flyway database migrations
✅ Spring Data JPA with MySQL
✅ Thymeleaf server-side templating
✅ HTMX for dynamic UI updates
✅ Leaflet for map visualization
✅ Bootstrap 5 for responsive design
✅ RESTful API design
✅ Docker Compose for dependencies

Enjoy exploring Indonesia's administrative boundaries! 🗺️🇮🇩
