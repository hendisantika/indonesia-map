'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { wilayahApi } from '@/lib/api';
import { Wilayah } from '@/types/wilayah';
import WilayahCard from '@/components/WilayahCard';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import MapView from '@/components/MapView';
import Link from 'next/link';

export default function WilayahDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kode = params.kode as string;

  const [wilayah, setWilayah] = useState<Wilayah | null>(null);
  const [subWilayah, setSubWilayah] = useState<Wilayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subRegionType, setSubRegionType] = useState<string>('');

  useEffect(() => {
    if (kode) {
      loadWilayahDetail();
    }
  }, [kode]);

  const loadWilayahDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const detail = await wilayahApi.getByKode(kode);
      setWilayah(detail);

      const kodeLength = kode.length;
      let subData: Wilayah[] = [];
      let subType = '';

      if (kodeLength === 2) {
        subData = await wilayahApi.getKabupatenByProvinsi(kode);
        subType = 'Kabupaten/Kota';
      } else if (kodeLength === 4) {
        subData = await wilayahApi.getKecamatanByKabupaten(kode);
        subType = 'Kecamatan';
      } else if (kodeLength === 7) {
        subData = await wilayahApi.getDesaByKecamatan(kode);
        subType = 'Desa/Kelurahan';
      }

      setSubWilayah(subData);
      setSubRegionType(subType);
    } catch (err) {
      setError('Gagal memuat detail wilayah.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Loading />
      </div>
    );
  }

  if (error || !wilayah) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorMessage message={error || 'Wilayah tidak ditemukan'} />
        <Link href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          ← Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Kembali ke beranda
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{wilayah.nama}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="mb-2">
                <span className="font-semibold">Kode:</span> {wilayah.kode}
              </p>
              {wilayah.ibukota && (
                <p className="mb-2">
                  <span className="font-semibold">Ibukota:</span> {wilayah.ibukota}
                </p>
              )}
              {wilayah.luas && (
                <p className="mb-2">
                  <span className="font-semibold">Luas:</span> {wilayah.luas.toLocaleString()} km²
                </p>
              )}
              {wilayah.penduduk && (
                <p className="mb-2">
                  <span className="font-semibold">Penduduk:</span> {wilayah.penduduk.toLocaleString()} jiwa
                </p>
              )}
            </div>
            <div>
              {wilayah.lat !== null && wilayah.lat !== undefined && (
                <p className="mb-2">
                  <span className="font-semibold">Latitude:</span> {wilayah.lat.toFixed(6)}
                </p>
              )}
              {wilayah.lng !== null && wilayah.lng !== undefined && (
                <p className="mb-2">
                  <span className="font-semibold">Longitude:</span> {wilayah.lng.toFixed(6)}
                </p>
              )}
              {wilayah.elv !== undefined && wilayah.elv !== null && wilayah.elv !== 0 && (
                <p className="mb-2">
                  <span className="font-semibold">Elevasi:</span> {wilayah.elv} m
                </p>
              )}
              {wilayah.tz && (
                <p className="mb-2">
                  <span className="font-semibold">Zona Waktu:</span> UTC+{wilayah.tz}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Peta Wilayah</h2>
          <MapView wilayah={wilayah} height="500px" />
        </div>

        {subRegionType && subWilayah.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Daftar {subRegionType} ({subWilayah.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subWilayah.map((sub) => (
                <WilayahCard key={sub.kode} wilayah={sub} showDetails={false} />
              ))}
            </div>
          </div>
        )}

        {subWilayah.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              Ini adalah tingkat wilayah terkecil (Desa/Kelurahan).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
