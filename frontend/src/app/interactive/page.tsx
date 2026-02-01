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
  const [isClient, setIsClient] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.LayerGroup | null>(null);
  const LeafletRef = useRef<typeof L | null>(null);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize map (client-side only)
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    const initMap = async () => {
      try {
        // Dynamic import of Leaflet
        const LeafletModule = await import('leaflet');
        const { fixLeafletIcon } = await import('@/lib/leaflet-icon-fix');
        await import('leaflet/dist/leaflet.css');

        const L = LeafletModule.default;
        LeafletRef.current = L;

        fixLeafletIcon();

        if (!mapRef.current && mapContainerRef.current) {
          mapRef.current = L.map(mapContainerRef.current).setView([-2.5489, 118.0149], 5);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
          }).addTo(mapRef.current);

          markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
          boundaryLayerRef.current = L.layerGroup().addTo(mapRef.current);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to initialize map');
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isClient]);

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

    markersLayerRef.current.clearLayers();
    boundaryLayerRef.current?.clearLayers();

    const L = LeafletRef.current;

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
    setSelectedProvinsi(kode);
    setSelectedKabupaten('');
    setSelectedKecamatan('');
    setSelectedDesa('');
    setKabupatenList([]);
    setKecamatanList([]);
    setDesaList([]);

    if (kode) {
      try {
        const [detail, kabupatenData] = await Promise.all([
          wilayahApi.getByKode(kode),
          wilayahApi.getKabupatenByProvinsi(kode),
        ]);

        setDetailWilayah(detail);
        setKabupatenList(kabupatenData);
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
    if (!mapRef.current || !markersLayerRef.current || !boundaryLayerRef.current || !LeafletRef.current) return;

    const L = LeafletRef.current;

    try {
      const data = await wilayahApi.getBoundaryData(kode);

      markersLayerRef.current.clearLayers();
      boundaryLayerRef.current.clearLayers();

      // Add marker for center point
      if (data.geometry && typeof data.geometry === 'object' && 'lat' in data.geometry && 'lng' in data.geometry) {
        L.marker([data.geometry.lat as number, data.geometry.lng as number])
          .bindPopup(`<b>${data.nama}</b><br>Kode: ${data.kode}`)
          .addTo(markersLayerRef.current);
      }

      // Display boundary polygon
      if (data.geometry) {
        try {
          let geoJsonData;

          if (typeof data.geometry === 'string') {
            geoJsonData = JSON.parse(data.geometry);
          } else {
            geoJsonData = data.geometry;
          }

          // Check if it's GeoJSON format
          if (geoJsonData.type && geoJsonData.coordinates) {
            const geoJsonLayer = L.geoJSON(
              {
                type: 'Feature',
                geometry: geoJsonData,
                properties: {},
              },
              {
                style: {
                  color: '#3388ff',
                  fillColor: '#3388ff',
                  fillOpacity: 0.2,
                  weight: 2,
                },
              }
            )
              .bindPopup(`<b>${data.nama}</b><br>Kode: ${data.kode}`)
              .addTo(boundaryLayerRef.current);

            mapRef.current.fitBounds(geoJsonLayer.getBounds(), { padding: [50, 50] });
          }
        } catch (e) {
          console.error('Error parsing boundary:', e);
        }
      }
    } catch (err) {
      console.error('Error loading boundary:', err);
    }
  };

  const resetMapView = () => {
    if (mapRef.current && markersLayerRef.current && boundaryLayerRef.current) {
      mapRef.current.setView([-2.5489, 118.0149], 5);
      markersLayerRef.current.clearLayers();
      boundaryLayerRef.current.clearLayers();
      showProvincesOnMap(provinsiList);
    }

    setSelectedProvinsi('');
    setSelectedKabupaten('');
    setSelectedKecamatan('');
    setSelectedDesa('');
    setDetailWilayah(null);
    setKabupatenList([]);
    setKecamatanList([]);
    setDesaList([]);
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Selectors */}
          <div className="lg:col-span-1">
            {/* Selectors Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Pilih Wilayah</h3>

              {/* Provinsi Select */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi
                </label>
                <select
                  value={selectedProvinsi}
                  onChange={(e) => handleProvinsiChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <p>
                    <span className="font-semibold">Koordinat:</span> {detailWilayah.lat.toFixed(4)},{' '}
                    {detailWilayah.lng.toFixed(4)}
                  </p>
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
                <h3 className="text-xl font-semibold">Peta Wilayah Indonesia</h3>
                <p className="text-sm">Pilih wilayah untuk melihat boundary</p>
              </div>
              <div ref={mapContainerRef} style={{ height: '600px', width: '100%' }} />
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
