'use client';

import { useState, useEffect, useRef } from 'react';
import { wilayahApi } from '@/lib/api';
import { Wilayah, BoundaryData } from '@/types/wilayah';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import Link from 'next/link';
import type L from 'leaflet';

export default function InteractivePage() {
  // State for dropdown selections
  const [provinsiList, setProvinsiList] = useState<Wilayah[]>([]);
  const [kabupatenList, setKabupatenList] = useState<Wilayah[]>([]);
  const [kecamatanList, setKecamatanList] = useState<Wilayah[]>([]);
  const [desaList, setDesaList] = useState<Wilayah[]>([]);

  const [selectedProvinsi, setSelectedProvinsi] = useState<string>('');
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>('');
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('');
  const [selectedDesa, setSelectedDesa] = useState<string>('');

  const [detailWilayah, setDetailWilayah] = useState<Wilayah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boundaryWarning, setBoundaryWarning] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.LayerGroup | null>(null);
  const LeafletRef = useRef<typeof L | null>(null);
  const [containerReady, setContainerReady] = useState(false);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize map (client-side only)
  useEffect(() => {
    console.log('Map useEffect triggered', { isClient, containerReady, hasContainer: !!mapContainerRef.current });

    if (!isClient || !containerReady || !mapContainerRef.current) {
      console.log('Skipping map init - waiting for client/container', { isClient, containerReady });
      return;
    }

    const initMap = async () => {
      console.log('Starting map initialization...');
      try {
        // Dynamic import of Leaflet (CSS is loaded via CDN in layout.tsx)
        const LeafletModule = await import('leaflet');
        console.log('Leaflet module imported');

        const { fixLeafletIcon } = await import('@/lib/leaflet-icon-fix');
        console.log('Icon fix imported');

        const L = LeafletModule.default;
        LeafletRef.current = L;
        console.log('Leaflet loaded successfully');

        fixLeafletIcon();
        console.log('Icon fix applied');

        if (!mapRef.current && mapContainerRef.current) {
          console.log('Creating map instance...');
          mapRef.current = L.map(mapContainerRef.current).setView([-2.5489, 118.0149], 5);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
          }).addTo(mapRef.current);
          console.log('Tile layer added');

          markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
          console.log('Markers layer added');

          boundaryLayerRef.current = L.layerGroup().addTo(mapRef.current);
          console.log('Boundary layer added');

          // Mark map as ready
          setMapReady(true);
          console.log('Map initialization complete - all refs ready');
        } else {
          console.log('Map already exists or container missing', {
            hasMap: !!mapRef.current,
            hasContainer: !!mapContainerRef.current
          });
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to initialize map. Please refresh the page.');
        setMapReady(false);
      }
    };

    initMap();

    return () => {
      console.log('Map cleanup running');
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, [isClient, containerReady]);

  // Load provinsi list on mount
  useEffect(() => {
    loadProvinsi();
  }, []);

  const loadProvinsi = async () => {
    try {
      setLoading(true);
      const data = await wilayahApi.getAllProvinsi();
      setProvinsiList(data);

      // Show all provinces on map
      showProvincesOnMap(data);
    } catch (err) {
      setError('Gagal memuat data provinsi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showProvincesOnMap = (provinces: Wilayah[]) => {
    if (!mapRef.current || !markersLayerRef.current || !LeafletRef.current) return;

    // Clear all layers
    markersLayerRef.current.clearLayers();

    // Remove all boundary layers completely
    if (boundaryLayerRef.current && mapRef.current) {
      try {
        // Remove the entire layer group from the map
        if (mapRef.current.hasLayer(boundaryLayerRef.current)) {
          mapRef.current.removeLayer(boundaryLayerRef.current);
        }
        // Clear the layer group's contents
        boundaryLayerRef.current.clearLayers();
      } catch (e) {
        // Layer might not be on map
      }
      boundaryLayerRef.current = null;
    }

    const L = LeafletRef.current;

    // Show province markers only when no specific region is selected
    provinces.forEach((prov) => {
      if (prov.lat && prov.lng && markersLayerRef.current) {
        L.marker([prov.lat, prov.lng])
          .bindPopup(`
            <b>${prov.nama}</b><br>
            Kode: ${prov.kode}<br>
            ${prov.ibukota ? 'Ibukota: ' + prov.ibukota : ''}
          `)
          .addTo(markersLayerRef.current);
      }
    });

    mapRef.current.setView([-2.5489, 118.0149], 5);
  };

  const handleProvinsiChange = async (kode: string) => {
    console.log('handleProvinsiChange called with:', kode);
    setSelectedProvinsi(kode);
    setSelectedKabupaten('');
    setSelectedKecamatan('');
    setSelectedDesa('');
    setKabupatenList([]);
    setKecamatanList([]);
    setDesaList([]);

    if (kode) {
      try {
        console.log('Fetching detail and kabupaten for:', kode);
        const [detail, kabupatenData] = await Promise.all([
          wilayahApi.getByKode(kode),
          wilayahApi.getKabupatenByProvinsi(kode),
        ]);

        setDetailWilayah(detail);
        setKabupatenList(kabupatenData);
        console.log('About to call loadBoundary for:', kode);
        await loadBoundary(kode);
      } catch (err) {
        console.error('Error loading provinsi:', err);
      }
    }
  };

  const handleKabupatenChange = async (kode: string) => {
    setSelectedKabupaten(kode);
    setSelectedKecamatan('');
    setSelectedDesa('');
    setKecamatanList([]);
    setDesaList([]);

    if (kode) {
      try {
        const [detail, kecamatanData] = await Promise.all([
          wilayahApi.getByKode(kode),
          wilayahApi.getKecamatanByKabupaten(kode),
        ]);

        setDetailWilayah(detail);
        setKecamatanList(kecamatanData);
        await loadBoundary(kode);
      } catch (err) {
        console.error('Error loading kabupaten:', err);
      }
    }
  };

  const handleKecamatanChange = async (kode: string) => {
    setSelectedKecamatan(kode);
    setSelectedDesa('');
    setDesaList([]);

    if (kode) {
      try {
        const [detail, desaData] = await Promise.all([
          wilayahApi.getByKode(kode),
          wilayahApi.getDesaByKecamatan(kode),
        ]);

        setDetailWilayah(detail);
        setDesaList(desaData);
        await loadBoundary(kode);
      } catch (err) {
        console.error('Error loading kecamatan:', err);
      }
    }
  };

  const handleDesaChange = async (kode: string) => {
    setSelectedDesa(kode);

    if (kode) {
      try {
        const detail = await wilayahApi.getByKode(kode);
        setDetailWilayah(detail);
        await loadBoundary(kode);
      } catch (err) {
        console.error('Error loading desa:', err);
      }
    }
  };

  const loadBoundary = async (kode: string) => {
    // Clear previous boundary warning
    setBoundaryWarning(null);

    if (!mapReady) {
      console.warn('Map not ready yet, skipping boundary load');
      return;
    }

    console.log('loadBoundary called with kode:', kode);

    if (!mapRef.current || !markersLayerRef.current || !LeafletRef.current) {
      console.error('Map refs are null despite mapReady being true');
      return;
    }

    const L = LeafletRef.current;
    const markersLayer = markersLayerRef.current; // Store reference to prevent null during async
    const map = mapRef.current; // Store map reference

    try {
      const data = await wilayahApi.getBoundaryData(kode);
      console.log('Boundary data received:', { kode: data.kode, nama: data.nama, hasCoords: !!data.coordinates });

      // Double-check layers and map are still valid after async operation
      if (!markersLayer || !map) {
        console.error('Layers or map became null during async operation');
        return;
      }

      // Clear all previous markers and boundaries to show only selected region
      markersLayer.clearLayers();

      // Remove old boundary layer completely
      if (boundaryLayerRef.current) {
        console.log('Removing old boundary layer...');
        try {
          // First, remove the entire layer group from the map
          // This should remove all child layers automatically
          if (map.hasLayer(boundaryLayerRef.current)) {
            map.removeLayer(boundaryLayerRef.current);
            console.log('Old boundary layer removed from map');
          }
          // Also clear the layer group's contents to be safe
          boundaryLayerRef.current.clearLayers();
        } catch (e) {
          console.warn('Error removing old boundary layer:', e);
        }
        boundaryLayerRef.current = null;
      }

      // Add marker for center point using lat/lng from root level
      if (data.lat != null && data.lng != null &&
          !isNaN(data.lat) && !isNaN(data.lng)) {
        L.marker([data.lat, data.lng])
          .bindPopup(`<b>${data.nama}</b><br>Kode: ${data.kode}`)
          .addTo(markersLayer);
      } else {
        console.warn(`No valid center coordinates for ${data.nama} (${data.kode})`);
      }

      // Display boundary polygon
      if (data.coordinates) {
        try {
          let coordsArray;

          if (typeof data.coordinates === 'string') {
            // Handle empty string or whitespace
            if (!data.coordinates.trim()) {
              console.warn('Empty coordinates string for', data.kode);
              throw new Error('Empty coordinates string');
            }
            coordsArray = JSON.parse(data.coordinates);
          } else {
            coordsArray = data.coordinates;
          }

          // coordsArray structure differs by level:
          // - Provinsi/Kabupaten: array of polygons, each is array of [lat,lng] pairs
          // - Kecamatan/Desa: array of polygons, each has rings, each ring is array of [lng,lat] pairs
          if (!Array.isArray(coordsArray)) {
            console.warn('Coordinates is not an array for', data.kode, typeof coordsArray);
            throw new Error('Invalid coordinates format');
          }

          if (coordsArray.length === 0) {
            console.warn('Empty coordinates array for', data.kode);
            throw new Error('Empty coordinates array');
          }

          if (Array.isArray(coordsArray) && coordsArray.length > 0) {
            console.log(`Creating ${coordsArray.length} polygon(s) for ${data.nama}`);
            console.log('First element type:', typeof coordsArray[0], 'isArray:', Array.isArray(coordsArray[0]));
            if (coordsArray[0]) {
              console.log('First element length:', coordsArray[0].length);
              console.log('First element sample:', coordsArray[0].slice(0, 2));
            }

            const createdPolygons: L.Polygon[] = [];

            // Determine coordinate format based on kode length (more reliable than level string)
            const kodeDigits = data.kode.replace(/\./g, '').length;
            const isKecamatanOrDesa = kodeDigits > 5; // 6 digits (kecamatan) or 10 digits (desa)
            console.log(`Kode: ${data.kode}, Digits: ${kodeDigits}, IsKecamatanOrDesa: ${isKecamatanOrDesa}`);

            coordsArray.forEach((polygon: any, index: number) => {
              console.log(`Polygon ${index}: type=${typeof polygon}, isArray=${Array.isArray(polygon)}, length=${polygon?.length}`);

              // Skip invalid polygon entries
              if (!Array.isArray(polygon) || polygon.length === 0) {
                console.warn(`Skipping polygon ${index}: not an array or empty`);
                return;
              }

              let processedPolygon;

              if (isKecamatanOrDesa) {
                // Kecamatan/Desa have extra nesting: polygon[ring][points]
                // Use first ring (polygon[0]) and swap [lng,lat] to [lat,lng]
                const ring = polygon[0];
                if (!ring || !Array.isArray(ring) || ring.length === 0) {
                  console.warn(`Skipping polygon ${index}: invalid ring data`);
                  return;
                }

                console.log(`Polygon ${index}: ${ring.length} points (from ring 0)`);

                // Filter out invalid coordinates
                const validCoords = ring.filter(([lng, lat]: [number, number]) => {
                  return lng != null && lat != null &&
                         typeof lng === 'number' && typeof lat === 'number' &&
                         !isNaN(lng) && !isNaN(lat);
                });

                if (validCoords.length === 0) {
                  console.warn(`Skipping polygon ${index}: no valid coordinates after filtering`);
                  return;
                }

                processedPolygon = validCoords.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);

                if (processedPolygon.length > 0 && processedPolygon[0]) {
                  console.log(`First point after swap: [${processedPolygon[0][0]}, ${processedPolygon[0][1]}]`);
                }
              } else {
                // Provinsi/Kabupaten: polygon is already array of [lat,lng] pairs
                // Validate that polygon contains coordinate pairs
                const isValidPolygon = polygon.every((coord: any) =>
                  Array.isArray(coord) && coord.length >= 2 &&
                  typeof coord[0] === 'number' && typeof coord[1] === 'number' &&
                  !isNaN(coord[0]) && !isNaN(coord[1])
                );

                if (!isValidPolygon) {
                  console.warn(`Skipping polygon ${index}: contains invalid coordinate pairs`);
                  return;
                }

                if (polygon[0]) {
                  console.log(`Polygon ${index}: ${polygon.length} points, first point:`, polygon[0]);
                }
                processedPolygon = polygon;
              }

              console.log(`Polygon ${index} - processedPolygon: length=${processedPolygon?.length}, valid=${!!(processedPolygon && processedPolygon.length > 0)}`);

              // Validate processed polygon has coordinates (need at least 3 points for a polygon)
              if (processedPolygon && processedPolygon.length >= 3) {
                try {
                  // Create Leaflet polygon with enhanced visibility
                  const leafletPolygon = L.polygon(processedPolygon, {
                    color: '#2563eb',        // Darker blue border for better visibility
                    fillColor: '#3b82f6',    // Lighter blue fill
                    fillOpacity: 0.35,       // 35% opacity for good visibility
                    weight: 3,               // 3px border
                  });
                  leafletPolygon.bindPopup(`<b>${data.nama}</b><br>Kode: ${data.kode}`);
                  createdPolygons.push(leafletPolygon);
                } catch (err) {
                  console.error(`Error creating polygon ${index}:`, err);
                }
              } else {
                console.warn(`Skipping polygon ${index}: no valid coordinates`);
              }
            });

            console.log(`Created ${createdPolygons.length} polygon(s) for ${data.nama}`);

            // Create a layer group and add all polygons to it, then add to map
            if (createdPolygons.length > 0) {
              const newBoundaryLayer = L.layerGroup(createdPolygons);
              newBoundaryLayer.addTo(map);
              boundaryLayerRef.current = newBoundaryLayer;
              console.log(`Successfully added boundary layer with ${createdPolygons.length} polygon(s) to map`);
              console.log('Layer is on map:', map.hasLayer(newBoundaryLayer));
              console.log('Number of layers on map:', Object.keys((map as any)._layers || {}).length);
            }

            // Fit map to polygon bounds - include all polygons, not just the first one
            if (createdPolygons.length > 0 && map) {
              try {
                // Create bounds that encompass all polygons (handles multi-polygon regions like islands)
                let bounds = createdPolygons[0].getBounds();
                for (let i = 1; i < createdPolygons.length; i++) {
                  bounds.extend(createdPolygons[i].getBounds());
                }

                console.log(`Fitting map to bounds of ${createdPolygons.length} polygon(s):`, bounds);
                console.log('Bounds details:', {
                  north: bounds.getNorth(),
                  south: bounds.getSouth(),
                  east: bounds.getEast(),
                  west: bounds.getWest()
                });
                map.fitBounds(bounds, { padding: [50, 50] });
                console.log('Map view after fitBounds:', map.getCenter(), 'zoom:', map.getZoom());

                // If lat/lng are missing, add marker at polygon center
                if ((!data.lat || !data.lng) && markersLayer) {
                  const center = bounds.getCenter();
                  console.log('Adding marker at polygon center:', center);
                  L.marker([center.lat, center.lng])
                    .bindPopup(`<b>${data.nama}</b><br>Kode: ${data.kode}`)
                    .addTo(markersLayer);
                }
              } catch (err) {
                console.error('Error fitting bounds:', err);
              }
            } else if (createdPolygons.length === 0) {
              console.warn(`❌ No valid polygons created for ${data.nama} (${data.kode})`);
              console.warn('This usually means boundary data is missing or malformed in the database');

              // Show warning to user
              setBoundaryWarning(`⚠️ Data batas wilayah untuk ${data.nama} tidak tersedia atau tidak valid. Hanya menampilkan titik pusat.`);

              // Fallback to center point if available
              if (data.lat && data.lng && map) {
                console.log('Falling back to center point view');
                map.setView([data.lat, data.lng], 10);
              }
            }
          }
        } catch (e) {
          console.error(`Error parsing boundary coordinates for ${data.nama} (${data.kode}):`, e);

          // Show warning to user
          setBoundaryWarning(`⚠️ Error memproses data batas wilayah untuk ${data.nama}. ${data.lat && data.lng ? 'Menampilkan titik pusat.' : 'Wilayah tidak dapat ditampilkan.'}`);

          // Fallback to center point if boundary parsing fails
          if (data.lat && data.lng && map) {
            console.log('Falling back to center point view');
            map.setView([data.lat, data.lng], 10);
          } else {
            console.warn(`⚠️ No boundary coordinates and no lat/lng available for ${data.nama} (${data.kode})`);
            console.warn('The region cannot be displayed on the map');
          }
        }
      } else if (data.lat && data.lng && map) {
        // No boundary coordinates, but we have lat/lng - just zoom to center point
        console.log('No boundary data, zooming to center point');
        setBoundaryWarning(`ℹ️ Data batas wilayah untuk ${data.nama} tidak tersedia. Menampilkan titik pusat.`);
        map.setView([data.lat, data.lng], 10);
      } else {
        console.warn(`⚠️ No boundary or coordinate data available for ${data.nama} (${data.kode})`);
        console.warn('The region cannot be displayed on the map');
        setBoundaryWarning(`❌ Data untuk ${data.nama} tidak lengkap dan tidak dapat ditampilkan di peta.`);
      }
    } catch (err) {
      console.error('Error loading boundary:', err);
    }
  };

  const resetMapView = () => {
    if (mapRef.current && markersLayerRef.current) {
      // Clear all selections and reset to Indonesia overview
      markersLayerRef.current.clearLayers();

      // Remove all boundary layers completely
      if (boundaryLayerRef.current) {
        try {
          // Remove the entire layer group from the map
          if (mapRef.current.hasLayer(boundaryLayerRef.current)) {
            mapRef.current.removeLayer(boundaryLayerRef.current);
          }
          // Clear the layer group's contents
          boundaryLayerRef.current.clearLayers();
        } catch (e) {
          // Layer might not be on map
        }
        boundaryLayerRef.current = null;
      }

      // Reset view and show all provinces
      mapRef.current.setView([-2.5489, 118.0149], 5);
      showProvincesOnMap(provinsiList);
    }

    // Clear all selections
    setSelectedProvinsi('');
    setSelectedKabupaten('');
    setSelectedKecamatan('');
    setSelectedDesa('');
    setDetailWilayah(null);
    setKabupatenList([]);
    setKecamatanList([]);
    setDesaList([]);
    setBoundaryWarning(null);
  };

  if (loading && provinsiList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Kembali ke beranda
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Interactive Map - Wilayah Indonesia
          </h1>
          <p className="text-gray-600">
            Pilih Provinsi, Kabupaten/Kota, Kecamatan, dan Desa/Kelurahan untuk melihat peta dan boundary
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        {boundaryWarning && (
          <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
            <p className="text-sm">{boundaryWarning}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Selectors */}
          <div className="lg:col-span-1">
            {/* Selectors Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Pilih Wilayah</h3>

              {/* Provinsi Select */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi {!mapReady && <span className="text-xs text-gray-500">(Loading map...)</span>}
                </label>
                <select
                  value={selectedProvinsi}
                  onChange={(e) => handleProvinsiChange(e.target.value)}
                  disabled={!mapReady}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Pilih Provinsi</option>
                  {provinsiList.map((prov) => (
                    <option key={prov.kode} value={prov.kode}>
                      {prov.kode} - {prov.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kabupaten Select */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kabupaten/Kota
                </label>
                <select
                  value={selectedKabupaten}
                  onChange={(e) => handleKabupatenChange(e.target.value)}
                  disabled={!selectedProvinsi || kabupatenList.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Pilih Kabupaten/Kota</option>
                  {kabupatenList.map((kab) => (
                    <option key={kab.kode} value={kab.kode}>
                      {kab.kode} - {kab.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kecamatan Select */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kecamatan
                </label>
                <select
                  value={selectedKecamatan}
                  onChange={(e) => handleKecamatanChange(e.target.value)}
                  disabled={!selectedKabupaten || kecamatanList.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Pilih Kecamatan</option>
                  {kecamatanList.map((kec) => (
                    <option key={kec.kode} value={kec.kode}>
                      {kec.kode} - {kec.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desa Select */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desa/Kelurahan
                </label>
                <select
                  value={selectedDesa}
                  onChange={(e) => handleDesaChange(e.target.value)}
                  disabled={!selectedKecamatan || desaList.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Pilih Desa/Kelurahan</option>
                  {desaList.map((desa) => (
                    <option key={desa.kode} value={desa.kode}>
                      {desa.kode} - {desa.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detail Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Detail Wilayah</h3>
              {detailWilayah ? (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Nama:</span> {detailWilayah.nama}
                  </p>
                  <p>
                    <span className="font-semibold">Kode:</span> {detailWilayah.kode}
                  </p>
                  {detailWilayah.ibukota && (
                    <p>
                      <span className="font-semibold">Ibukota:</span> {detailWilayah.ibukota}
                    </p>
                  )}
                  {detailWilayah.luas && (
                    <p>
                      <span className="font-semibold">Luas:</span>{' '}
                      {detailWilayah.luas.toLocaleString()} km²
                    </p>
                  )}
                  {detailWilayah.penduduk && (
                    <p>
                      <span className="font-semibold">Penduduk:</span>{' '}
                      {detailWilayah.penduduk.toLocaleString()} jiwa
                    </p>
                  )}
                  {detailWilayah.lat && detailWilayah.lng && (
                    <p>
                      <span className="font-semibold">Koordinat:</span> {detailWilayah.lat.toFixed(4)},{' '}
                      {detailWilayah.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center">
                  Pilih wilayah untuk melihat detail
                </p>
              )}
            </div>

            {/* Statistics */}
            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Statistik Indonesia</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Provinsi:</span>
                  <span className="font-semibold">38</span>
                </div>
                <div className="flex justify-between">
                  <span>Kabupaten/Kota:</span>
                  <span className="font-semibold">514</span>
                </div>
                <div className="flex justify-between">
                  <span>Kecamatan:</span>
                  <span className="font-semibold">7,069</span>
                </div>
                <div className="flex justify-between">
                  <span>Desa/Kelurahan:</span>
                  <span className="font-semibold">81,911</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-blue-600 text-white">
                <h3 className="text-xl font-semibold">
                  {detailWilayah ? `Peta: ${detailWilayah.nama}` : 'Peta Wilayah Indonesia'}
                </h3>
                <p className="text-sm">
                  {!mapReady ? 'Sedang memuat peta...' :
                   detailWilayah ? `Menampilkan batas wilayah ${detailWilayah.nama}` :
                   'Menampilkan semua provinsi - Pilih wilayah untuk melihat detail'}
                </p>
              </div>
              <div className="relative">
                <div
                  ref={(el) => {
                    mapContainerRef.current = el;
                    if (el && !containerReady) {
                      console.log('Map container mounted');
                      setContainerReady(true);
                    }
                  }}
                  style={{ height: '600px', width: '100%' }}
                />
                {!mapReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-700 font-medium">Memuat peta...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t">
                <button
                  onClick={resetMapView}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-2"
                >
                  🔄 Reset View
                </button>
                <button
                  onClick={() => showProvincesOnMap(provinsiList)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  📍 Tampilkan Provinsi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
