'use client';

import { useState, useEffect, useRef } from 'react';
import { wilayahApi } from '@/lib/api';
import { Wilayah } from '@/types/wilayah';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import Link from 'next/link';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fixLeafletIcon } from '@/lib/leaflet-icon-fix';

export default function MapPage() {
  const [provinsiList, setProvinsiList] = useState<Wilayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvinsi, setSelectedProvinsi] = useState<Wilayah | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProvinsi();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || provinsiList.length === 0) return;

    // Fix Leaflet icon issue
    fixLeafletIcon();

    // Initialize map centered on Indonesia
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-2.5, 118], 5);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Add markers and polygons for each province
    provinsiList.forEach((provinsi) => {
      if (!mapRef.current) return;

      // Add marker
      const marker = L.marker([provinsi.lat, provinsi.lng])
        .addTo(mapRef.current)
        .bindPopup(`
          <div class="p-2">
            <b>${provinsi.nama}</b><br>
            <small>Kode: ${provinsi.kode}</small><br>
            ${provinsi.ibukota ? `Ibukota: ${provinsi.ibukota}<br>` : ''}
            ${provinsi.penduduk ? `Penduduk: ${provinsi.penduduk.toLocaleString()}<br>` : ''}
            <a href="/wilayah/${provinsi.kode}" class="text-blue-600 hover:underline">Lihat Detail →</a>
          </div>
        `);

      marker.on('click', () => {
        setSelectedProvinsi(provinsi);
      });

      // Add boundary polygon if available
      if (provinsi.path) {
        try {
          const pathData = JSON.parse(provinsi.path);

          if (Array.isArray(pathData)) {
            pathData.forEach((polygon) => {
              if (Array.isArray(polygon) && polygon.length > 0) {
                const latLngs = polygon.map((coord: number[]) => [coord[1], coord[0]]);

                L.polygon(latLngs, {
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                  weight: 1,
                })
                  .addTo(mapRef.current!)
                  .bindTooltip(provinsi.nama, { permanent: false, direction: 'center' })
                  .on('click', () => {
                    setSelectedProvinsi(provinsi);
                  });
              }
            });
          }
        } catch (error) {
          console.error(`Error parsing boundary for ${provinsi.nama}:`, error);
        }
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [provinsiList]);

  const loadProvinsi = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wilayahApi.getAllProvinsi();
      setProvinsiList(data);
    } catch (err) {
      setError('Gagal memuat data provinsi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Kembali ke beranda
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Peta Indonesia</h1>
          <p className="text-gray-600">Peta interaktif provinsi-provinsi di Indonesia</p>
        </div>

        {loading && <Loading />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div ref={mapContainerRef} style={{ height: '700px', width: '100%' }} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                {selectedProvinsi ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      {selectedProvinsi.nama}
                    </h2>
                    <div className="space-y-2 text-gray-700">
                      <p>
                        <span className="font-semibold">Kode:</span> {selectedProvinsi.kode}
                      </p>
                      {selectedProvinsi.ibukota && (
                        <p>
                          <span className="font-semibold">Ibukota:</span> {selectedProvinsi.ibukota}
                        </p>
                      )}
                      {selectedProvinsi.luas && (
                        <p>
                          <span className="font-semibold">Luas:</span>{' '}
                          {selectedProvinsi.luas.toLocaleString()} km²
                        </p>
                      )}
                      {selectedProvinsi.penduduk && (
                        <p>
                          <span className="font-semibold">Penduduk:</span>{' '}
                          {selectedProvinsi.penduduk.toLocaleString()} jiwa
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Koordinat:</span>{' '}
                        {selectedProvinsi.lat.toFixed(4)}, {selectedProvinsi.lng.toFixed(4)}
                      </p>
                    </div>
                    <Link
                      href={`/wilayah/${selectedProvinsi.kode}`}
                      className="mt-4 block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <h2 className="text-xl font-semibold mb-2">Info Provinsi</h2>
                    <p>Klik pada marker atau wilayah di peta untuk melihat informasi provinsi.</p>
                    <div className="mt-4 text-sm">
                      <p className="font-semibold mb-2">Total: {provinsiList.length} Provinsi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
