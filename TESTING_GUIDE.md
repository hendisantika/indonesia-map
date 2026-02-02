# Interactive Map Testing Guide

## Test the Boundary Fix

The boundary data format has been fixed for all 513 kabupaten/kota across Indonesia. Follow these steps to verify the fix works correctly.

---

## Access the Interactive Map

Open your browser and navigate to:
**http://localhost:3000/interactive**

---

## Test 1: Previously Problematic Regions in Aceh

These 9 kabupaten had wrong format and are now fixed:

### Steps:
1. Select **Provinsi**: `11 - Aceh`
2. Test each of the following kabupaten:

| Code | Name | What to Check |
|------|------|---------------|
| **11.02** | Kabupaten Aceh Tenggara | ✅ Boundary renders, no errors |
| **11.04** | Kabupaten Aceh Tengah | ✅ Boundary renders, no errors |
| **11.05** | Kabupaten Aceh Barat | ✅ Boundary renders, no errors |
| **11.13** | Kabupaten Gayo Lues | ✅ Boundary renders, no errors |
| **11.17** | Kabupaten Bener Meriah | ✅ Boundary renders, no errors |
| **11.18** | Kabupaten Pidie Jaya | ✅ Boundary renders, no errors |
| **11.73** | Kota Lhokseumawe | ✅ Boundary renders, no errors |
| **11.74** | Kota Langsa | ✅ Boundary renders, no errors (smallest path data) |
| **11.75** | Kota Subulussalam | ✅ Boundary renders, no errors |

### Expected Results:
- ✅ Blue boundary polygon appears on the map
- ✅ Map auto-zooms to the region
- ✅ Center marker appears
- ✅ No console errors
- ✅ No yellow warning banner
- ❌ No "No valid polygons created" error

---

## Test 2: Heavily Affected Provinces

### Jawa Timur (33) - 30 kabupaten fixed
1. Select **Provinsi**: `33 - Jawa Timur`
2. Try multiple kabupaten randomly
3. All should render boundaries correctly

### Jawa Tengah (35) - 27 kabupaten fixed
1. Select **Provinsi**: `35 - Jawa Tengah`
2. Try multiple kabupaten randomly
3. All should render boundaries correctly

### Sumatera Barat (13) - 18 kabupaten fixed
1. Select **Provinsi**: `13 - Sumatera Barat`
2. Try multiple kabupaten randomly
3. All should render boundaries correctly

---

## Test 3: Already Correct Regions (Verification)

Test a few regions that already had correct format to ensure nothing broke:

| Province | Code | Region | Expected |
|----------|------|--------|----------|
| DKI Jakarta | 31.71 | Kota Jakarta Pusat | ✅ Works correctly |
| Bali | 51.01 | Kabupaten Jembrana | ✅ Works correctly |
| Papua | 91.01 | Kabupaten Merauke | ✅ Works correctly |

---

## Test 4: Multi-Polygon Regions

Some regions have multiple polygons (islands). Test these to ensure all polygons render:

| Province | Code | Region | Polygons |
|----------|------|--------|----------|
| Aceh | 11.09 | Kabupaten Simeulue | 52 polygons |
| Aceh | 11.06 | Kabupaten Aceh Besar | 20 polygons |
| Aceh | 11.10 | Kabupaten Aceh Singkil | 46 polygons |

**Expected**: All island polygons should render, map should zoom to encompass all of them.

---

## Browser Console Checks

### Open Browser DevTools
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12`
- **Safari**: Press `Cmd+Option+C`

### What to Look For

#### ✅ Success Indicators:
```
Boundary data received: {kode: "11.74", nama: "Kota Langsa", hasCoords: true}
Creating 1 polygon(s) for Kota Langsa
Kode: 11.74, Digits: 4, IsKecamatanOrDesa: false
Polygon 0: 7 points, first point: [4.5552802085876, 98.06056213378906]
Successfully added 1 polygon(s) to map
Fitting map to bounds of 1 polygon(s): ...
```

#### ❌ Should NOT Appear:
```
❌ No valid polygons created for ...
⚠️ No boundary coordinates and no lat/lng available for ...
Error parsing boundary coordinates: ...
```

#### ℹ️ Yellow Warning Banner
If you see a yellow warning banner:
- ⚠️ Data batas wilayah tidak tersedia - Means boundary data is missing
- This should NOT appear for any Aceh kabupaten after the fix

---

## Network Tab Verification

### Check API Responses:
1. Open DevTools → Network tab
2. Select a kabupaten (e.g., 11.74 Kota Langsa)
3. Look for request to: `/api/v2/wilayah/11.74/boundary`

### Expected Response Format:
```json
{
  "kode": "11.74",
  "nama": "Kota Langsa",
  "level": "Kabupaten/Kota",
  "lat": 4.46948210581997,
  "lng": 97.96644605234316,
  "coordinates": "[[[4.555...,98.060...],[4.558...,98.055...],...]]]"
}
```

**Key Check**: `coordinates` should start with `[[[` (three opening brackets)

---

## Visual Verification

### What the Map Should Show:

1. **Before selecting region**:
   - Indonesia overview with province markers

2. **After selecting provinsi**:
   - Province boundary (if available)
   - Province center marker

3. **After selecting kabupaten**:
   - Blue boundary polygon showing kabupaten outline
   - Map auto-zooms to fit the boundary
   - Center marker on the kabupaten

4. **Interactive features**:
   - Click polygon → Popup shows name and code
   - Click marker → Popup shows name and code
   - "Reset View" button → Returns to Indonesia overview
   - "Tampilkan Provinsi" button → Shows all provinces

---

## Common Issues & Solutions

### Issue: Yellow warning appears
**Cause**: Boundary data missing or invalid
**Solution**: Check if that specific region has data in database

### Issue: Map doesn't zoom to region
**Cause**: Boundary rendering failed
**Solution**: Check console for errors, verify coordinates format

### Issue: Polygon appears but in wrong location
**Cause**: Coordinate order is swapped
**Solution**: Check if [lat,lng] vs [lng,lat] format is correct

### Issue: 500 Error on page load
**Cause**: Syntax error in TypeScript code
**Solution**: Already fixed! Refresh the page.

---

## Success Criteria

✅ **Test Passed** if ALL of these are true:
1. All 9 Aceh kabupaten render boundaries correctly
2. No console errors appear
3. No yellow warning banners appear
4. Boundaries auto-zoom correctly
5. Multi-polygon regions show all islands
6. API returns coordinates starting with `[[[`

---

## Report Issues

If you find any kabupaten that still fails:
1. Note the province code and kabupaten code
2. Check browser console for errors
3. Check Network tab for API response
4. Check database:
   ```sql
   SELECT kode, nama, LEFT(path, 100)
   FROM wilayah_level_1_2
   WHERE kode = 'XX.YY';
   ```

---

## Summary

- **Total kabupaten**: 513
- **Fixed by migration**: 235
- **Expected success rate**: 100%
- **Test duration**: ~10-15 minutes for comprehensive testing

Happy testing! 🗺️✨
