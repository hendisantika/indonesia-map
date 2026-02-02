'use client';

import { useEffect, useRef, useState } from 'react';
import type L from 'leaflet';
import { Wilayah } from '@/types/wilayah';

interface MapViewProps {
  wilayah: Wilayah;
  height?: string;
}

export default function MapView({ wilayah, height = '500px' }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize map with dynamic import
  useEffect(() => {
    if (!isClient || !mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      try {
        // Dynamic import of Leaflet
        const LeafletModule = await import('leaflet');
        const { fixLeafletIcon } = await import('@/lib/leaflet-icon-fix');

        const L = LeafletModule.default;
        fixLeafletIcon();

        if (!mapRef.current && mapContainerRef.current) {
          const zoomLevel = wilayah.kode.length === 2 ? 8 : wilayah.kode.length === 4 ? 10 : 12;

          // Default center (Indonesia center) if lat/lng not available
          const centerLat = wilayah.lat ?? -2.5;
          const centerLng = wilayah.lng ?? 118.0;

          mapRef.current = L.map(mapContainerRef.current).setView(
            [centerLat, centerLng],
            zoomLevel
          );

          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(mapRef.current);

          // Add marker only if lat/lng are available
          if (wilayah.lat !== null && wilayah.lat !== undefined &&
              wilayah.lng !== null && wilayah.lng !== undefined) {
            L.marker([wilayah.lat, wilayah.lng])
              .addTo(mapRef.current)
              .bindPopup(`<b>${wilayah.nama}</b><br>Kode: ${wilayah.kode}`)
              .openPopup();
          }

          // Parse and display boundary path if available
          if (wilayah.path) {
            try {
              const pathData = JSON.parse(wilayah.path);

              if (Array.isArray(pathData) && mapRef.current) {
                // Determine if we need coordinate transformation based on kode length
                const kodeLen = wilayah.kode.replace(/\./g, '').length;
                const isKecamatanOrDesa = kodeLen > 5; // > 5 digits = kecamatan or desa

                // Handle multiple polygons
                pathData.forEach((polygon) => {
                  if (!Array.isArray(polygon) || polygon.length === 0 || !mapRef.current) return;

                  try {
                    let coords;

                    if (isKecamatanOrDesa) {
                      // Kecamatan/Desa: Extract first ring and swap [lng,lat] to [lat,lng]
                      const ring = polygon[0];
                      if (!Array.isArray(ring) || ring.length === 0) return;
                      coords = ring.map((coord: number[]) => [coord[1], coord[0]]);
                    } else {
                      // Provinsi/Kabupaten: Already in [lat,lng] format
                      coords = polygon;
                    }

                    if (coords && coords.length > 0 && mapRef.current) {
                      L.polygon(coords, {
                        color: '#3b82f6',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.2,
                        weight: 2,
                      }).addTo(mapRef.current);
                    }
                  } catch (err) {
                    console.error('Error creating polygon:', err);
                  }
                });

                // Fit map to show all boundaries
                try {
                  let allCoords;
                  if (isKecamatanOrDesa) {
                    allCoords = pathData
                      .filter((p: any) => Array.isArray(p) && Array.isArray(p[0]))
                      .map((p: any) => p[0].map((c: number[]) => [c[1], c[0]]))
                      .flat();
                  } else {
                    allCoords = pathData.flat();
                  }

                  if (allCoords && allCoords.length > 0 && mapRef.current) {
                    const bounds = L.latLngBounds(allCoords);
                    mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                  }
                } catch (err) {
                  console.error('Error fitting bounds:', err);
                }
              }
            } catch (error) {
              console.error('Error parsing boundary path:', error);
            }
          }

          setMapReady(true);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, [isClient, wilayah]);

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div
        ref={(el) => {
          mapContainerRef.current = el;
        }}
        style={{ height, width: '100%' }}
        className="relative"
      >
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700">Memuat peta...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
