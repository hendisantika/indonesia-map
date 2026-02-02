# OpenStreetMap Boundary Update Guide

## What Was Done

Updated Kota Langsa (11.74) with correct boundary data from OpenStreetMap.

### Before (Wrong Data):
- Location: [4.555, 98.060]
- Source: Unknown/incorrect
- Shape: Wrong polygon

### After (Correct OSM Data):
- Location: [4.443, 97.897]
- Source: OpenStreetMap (ID: 8922311)
- Shape: Accurate MultiPolygon with 3 parts
- Detail: 714 coordinate points

---

## How to Update More Regions

### Manual Update Script

Use the provided script to update individual regions:

```bash
./scripts/update-boundary-from-osm.sh "Region Name" "Code"
```

**Examples:**
```bash
# Update Banda Aceh
./scripts/update-boundary-from-osm.sh "Banda Aceh" "11.71"

# Update Kabupaten Aceh Besar
./scripts/update-boundary-from-osm.sh "Kabupaten Aceh Besar" "11.06"

# Update any kabupaten
./scripts/update-boundary-from-osm.sh "Kabupaten Simeulue" "11.09"
```

### What the Script Does:

1. **Searches OpenStreetMap** using Nominatim API
2. **Downloads GeoJSON** boundary data
3. **Converts format** from [lng,lat] to [lat,lng]
4. **Updates database** with correct boundary
5. **Shows stats** (number of polygons and points)

---

## OpenStreetMap Data Quality

### Advantages:
- ✅ Community-maintained and regularly updated
- ✅ High accuracy for Indonesian administrative boundaries
- ✅ Free and open data (ODbL license)
- ✅ Detailed polygon coordinates
- ✅ Includes MultiPolygon for regions with multiple areas

### Coverage:
- **Provinsi**: Admin level 4
- **Kabupaten/Kota**: Admin level 5
- **Kecamatan**: Admin level 6
- **Desa/Kelurahan**: Admin level 7

---

## Bulk Update Process

To update all regions in a province:

### 1. Get List of Regions
```sql
SELECT kode, nama
FROM wilayah_level_1_2
WHERE kode LIKE '11.%'
  AND LENGTH(REPLACE(kode, '.', '')) = 4
ORDER BY kode;
```

### 2. Create Batch Script
```bash
#!/bin/bash
# Update all Aceh kabupaten

./scripts/update-boundary-from-osm.sh "Kabupaten Aceh Selatan" "11.01"
sleep 2  # Be nice to OSM servers

./scripts/update-boundary-from-osm.sh "Kabupaten Aceh Tenggara" "11.02"
sleep 2

./scripts/update-boundary-from-osm.sh "Kabupaten Aceh Timur" "11.03"
sleep 2

# ... continue for all kabupaten
```

### 3. Run with Delays
```bash
# Add delay between requests to respect OSM API rate limits
for i in {1..23}; do
  ./update-region.sh
  sleep 5  # 5 second delay
done
```

---

## API Rate Limits

### Nominatim API (OpenStreetMap):
- **Rate limit**: 1 request per second
- **Usage policy**: https://operations.osmfoundation.org/policies/nominatim/
- **Recommendation**: Add 2-5 second delays between requests

### Best Practices:
1. Always add delays between requests (`sleep 2`)
2. Set a User-Agent header (optional but polite)
3. Don't run bulk updates during peak hours
4. Consider caching results locally

---

## Data Format

### GeoJSON Format (OSM):
```json
{
  "type": "MultiPolygon",
  "coordinates": [
    [[[lng, lat], [lng, lat], ...]],
    [[[lng, lat], [lng, lat], ...]]
  ]
}
```

### Our Database Format:
```json
[
  [[lat, lng], [lat, lng], ...],
  [[lat, lng], [lat, lng], ...]
]
```

**Key Differences:**
- OSM uses [lng, lat] → We use [lat, lng]
- OSM has extra nesting level for rings → We only use outer ring
- MultiPolygon → Array of polygons

---

## Verification

After updating a region:

### 1. Check Database
```sql
SELECT
  kode,
  nama,
  JSON_LENGTH(path) as num_polygons,
  LEFT(path, 100) as preview
FROM wilayah_level_1_2
WHERE kode = '11.74';
```

### 2. Test on Interactive Map
1. Open http://localhost:3000/interactive
2. Select the province
3. Select the updated region
4. Verify boundary shape matches OSM/Wikipedia

### 3. Console Verification
Look for:
```
Created X polygon(s) for [Region Name]
Successfully added boundary layer with X polygon(s) to map
```

---

## Troubleshooting

### Region Not Found in OSM
Try variations of the name:
- "Kota Langsa" vs "Langsa"
- "Kabupaten Aceh Besar" vs "Aceh Besar"
- Add "Indonesia" to search query

### Wrong Region Returned
Check the OSM ID and verify on OpenStreetMap.org:
```
https://www.openstreetmap.org/relation/[OSM_ID]
```

### Coordinate Mismatch
Verify coordinate order:
- GeoJSON: [longitude, latitude]
- Our format: [latitude, longitude]

### Database Update Fails
Check:
- JSON is valid (use `jq` to validate)
- MySQL connection is working
- No SQL syntax errors

---

## Alternative Data Sources

If OSM doesn't have good coverage for a region:

1. **GADM** (gadm.org)
   - Global administrative boundaries
   - High quality for Indonesia
   - Downloadable shapefiles

2. **Indonesia Geospatial Portal**
   - Official government source
   - https://tanahair.indonesia.go.id/

3. **BPS (Statistics Indonesia)**
   - Official statistical boundaries
   - https://www.bps.go.id/

---

## Future Improvements

### Automated Updates
Create a service to:
- Periodically check OSM for boundary updates
- Auto-update database when changes detected
- Log all boundary modifications

### Data Validation
Before updating:
- Compare old vs new boundary
- Calculate area difference
- Flag suspicious changes for review
- Keep backup of old boundaries

### Batch Processing
- Update all regions in a province at once
- Progress tracking
- Error handling and retry logic
- Report generation

---

## Credits

- Boundary data: © OpenStreetMap contributors
- License: Open Database License (ODbL)
- More info: https://www.openstreetmap.org/copyright

---

## Summary

✅ **Kota Langsa updated** with accurate OSM boundary
✅ **Script created** for easy updates
✅ **Process documented** for bulk updates
✅ **API best practices** included

Now you can update any region with correct boundary data from OpenStreetMap! 🗺️✨
