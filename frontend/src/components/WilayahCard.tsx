import { Wilayah } from '@/types/wilayah';
import Link from 'next/link';

interface WilayahCardProps {
  wilayah: Wilayah;
  onSelect?: (kode: string) => void;
  showDetails?: boolean;
}

export default function WilayahCard({ wilayah, onSelect, showDetails = true }: WilayahCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{wilayah.nama}</h3>
          <p className="text-sm text-gray-500">Kode: {wilayah.kode}</p>

          {showDetails && (
            <div className="mt-3 space-y-1 text-sm">
              {wilayah.ibukota && (
                <p className="text-gray-600">
                  <span className="font-medium">Ibukota:</span> {wilayah.ibukota}
                </p>
              )}
              {wilayah.luas && (
                <p className="text-gray-600">
                  <span className="font-medium">Luas:</span> {wilayah.luas.toLocaleString()} km²
                </p>
              )}
              {wilayah.penduduk && (
                <p className="text-gray-600">
                  <span className="font-medium">Penduduk:</span> {wilayah.penduduk.toLocaleString()} jiwa
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">Koordinat:</span> {wilayah.lat.toFixed(4)}, {wilayah.lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {onSelect && (
          <button
            onClick={() => onSelect(wilayah.kode)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Lihat Detail
          </button>
        )}
        <Link
          href={`/wilayah/${wilayah.kode}`}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
        >
          Detail
        </Link>
      </div>
    </div>
  );
}
