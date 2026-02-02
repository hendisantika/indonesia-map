#!/bin/bash

# Script to update boundary data from OpenStreetMap
# Usage: ./update-boundary-from-osm.sh "Kota Langsa" "11.74"

REGION_NAME="$1"
REGION_CODE="$2"

if [ -z "$REGION_NAME" ] || [ -z "$REGION_CODE" ]; then
    echo "Usage: $0 <region_name> <region_code>"
    echo "Example: $0 'Kota Langsa' '11.74'"
    exit 1
fi

echo "Fetching boundary for: $REGION_NAME (code: $REGION_CODE)"

# Create temp directory
TEMP_DIR="/tmp/osm_boundary_$$"
mkdir -p "$TEMP_DIR"

# Query Nominatim for the region
echo "1. Searching OpenStreetMap..."
curl -s "https://nominatim.openstreetmap.org/search?q=${REGION_NAME},Aceh,Indonesia&format=json&polygon_geojson=1&limit=1" \
  > "$TEMP_DIR/nominatim.json"

# Check if found
OSM_ID=$(cat "$TEMP_DIR/nominatim.json" | jq -r '.[0].osm_id // empty')
if [ -z "$OSM_ID" ]; then
    echo "ERROR: Region not found in OpenStreetMap"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "   Found OSM ID: $OSM_ID"

# Extract GeoJSON
cat "$TEMP_DIR/nominatim.json" | jq '.[0].geojson' > "$TEMP_DIR/geojson.json"

# Convert to our format
echo "2. Converting coordinates..."
node << 'EOJS' > "$TEMP_DIR/converted.json"
const fs = require('fs');
const geojson = JSON.parse(fs.readFileSync('$TEMP_DIR/geojson.json', 'utf8'));

const polygons = [];

if (geojson.type === 'MultiPolygon') {
  geojson.coordinates.forEach(polygon => {
    const outerRing = polygon[0];
    const convertedRing = outerRing.map(coord => [coord[1], coord[0]]);
    polygons.push(convertedRing);
  });
} else if (geojson.type === 'Polygon') {
  const outerRing = geojson.coordinates[0];
  const convertedRing = outerRing.map(coord => [coord[1], coord[0]]);
  polygons.push(convertedRing);
}

console.log(JSON.stringify(polygons));
EOJS

# Get stats
NUM_POLYGONS=$(cat "$TEMP_DIR/converted.json" | jq 'length')
NUM_POINTS=$(cat "$TEMP_DIR/converted.json" | jq '.[0] | length')
echo "   $NUM_POLYGONS polygon(s), $NUM_POINTS points in main polygon"

# Update database
echo "3. Updating database..."
BOUNDARY_JSON=$(cat "$TEMP_DIR/converted.json" | jq -c .)

mysql -h localhost -u root -proot wilayah_indo << EOSQL
UPDATE wilayah_level_1_2
SET path = '$BOUNDARY_JSON'
WHERE kode = '$REGION_CODE';

SELECT
  CONCAT('✅ Updated: ', kode, ' - ', nama,
         ' (', JSON_LENGTH(path), ' polygons)') as result
FROM wilayah_level_1_2
WHERE kode = '$REGION_CODE';
EOSQL

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Boundary update complete!"
echo "   Test at: http://localhost:3000/interactive"
