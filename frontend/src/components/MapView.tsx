'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Wilayah } from '@/types/wilayah';
import { fixLeafletIcon } from '@/lib/leaflet-icon-fix';

interface MapViewProps {
  wilayah: Wilayah;
  height?: string;
}

export default function MapView({ wilayah, height = '500px' }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix Leaflet icon issue
    fixLeafletIcon();

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [wilayah.lat, wilayah.lng],
        wilayah.kode.length === 2 ? 8 : wilayah.kode.length === 4 ? 10 : 12
      );

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Add marker for the location
    const marker = L.marker([wilayah.lat, wilayah.lng])
      .addTo(mapRef.current)
      .bindPopup(`<b>${wilayah.nama}</b><br>Kode: ${wilayah.kode}`)
      .openPopup();

    // Parse and display boundary path if available
    if (wilayah.path) {
      try {
        const pathData = JSON.parse(wilayah.path);

        if (Array.isArray(pathData)) {
          // Handle multiple polygons
          pathData.forEach((polygon) => {
            if (Array.isArray(polygon) && polygon.length > 0) {
              // Convert [lng, lat] to [lat, lng] for Leaflet
              const latLngs = polygon.map((coord: number[]) => [coord[1], coord[0]]);

              L.polygon(latLngs, {
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
                weight: 2,
              }).addTo(mapRef.current!);
            }
          });

          // Fit map to show all boundaries
          const allCoords = pathData.flat().map((coord: number[]) => [coord[1], coord[0]]);
          if (allCoords.length > 0) {
            const bounds = L.latLngBounds(allCoords);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          }
        }
      } catch (error) {
        console.error('Error parsing boundary path:', error);
      }
    } else {
      // If no boundary path, center on marker
      mapRef.current.setView([wilayah.lat, wilayah.lng],
        wilayah.kode.length === 2 ? 8 : wilayah.kode.length === 4 ? 10 : 12
      );
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [wilayah]);

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
    </div>
  );
}
