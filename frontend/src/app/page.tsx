'use client';

import { useState, useEffect } from 'react';
import { wilayahApi } from '@/lib/api';
import { Wilayah } from '@/types/wilayah';
import WilayahCard from '@/components/WilayahCard';
import SearchBar from '@/components/SearchBar';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import Link from 'next/link';

export default function Home() {
  const [provinsiList, setProvinsiList] = useState<Wilayah[]>([]);
  const [filteredList, setFilteredList] = useState<Wilayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState(false);

  useEffect(() => {
    loadProvinsi();
  }, []);

  const loadProvinsi = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wilayahApi.getAllProvinsi();
      setProvinsiList(data);
      setFilteredList(data);
      setSearchMode(false);
    } catch (err) {
      setError('Gagal memuat data provinsi. Pastikan backend sudah berjalan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await wilayahApi.search(keyword);
      setFilteredList(data);
      setSearchMode(true);
    } catch (err) {
      setError('Gagal melakukan pencarian.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Data Wilayah Indonesia
              </h1>
              <p className="text-gray-600">
                Jelajahi data provinsi, kabupaten, kecamatan, dan desa di Indonesia
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/interactive"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                🎯 Interactive Map
              </Link>
              <Link
                href="/map"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                🗺️ Lihat Peta
              </Link>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
          {searchMode && (
            <button
              onClick={loadProvinsi}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              ← Kembali ke daftar provinsi
            </button>
          )}
        </div>

        {loading && <Loading />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {searchMode ? `Hasil Pencarian (${filteredList.length})` : `Provinsi (${filteredList.length})`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredList.map((wilayah) => (
                <WilayahCard key={wilayah.kode} wilayah={wilayah} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
