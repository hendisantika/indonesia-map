import axios from 'axios';
import { Wilayah, BoundaryData } from '@/types/wilayah';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v2/wilayah`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const wilayahApi = {
  // Get all provinces
  getAllProvinsi: async (): Promise<Wilayah[]> => {
    const response = await api.get<Wilayah[]>('/provinsi');
    return response.data;
  },

  // Get kabupaten by province code
  getKabupatenByProvinsi: async (provinsiKode: string): Promise<Wilayah[]> => {
    const response = await api.get<Wilayah[]>(`/provinsi/${provinsiKode}/kabupaten`);
    return response.data;
  },

  // Get kecamatan by kabupaten code
  getKecamatanByKabupaten: async (kabupatenKode: string): Promise<Wilayah[]> => {
    const response = await api.get<Wilayah[]>(`/kabupaten/${kabupatenKode}/kecamatan`);
    return response.data;
  },

  // Get desa by kecamatan code
  getDesaByKecamatan: async (kecamatanKode: string): Promise<Wilayah[]> => {
    const response = await api.get<Wilayah[]>(`/kecamatan/${kecamatanKode}/desa`);
    return response.data;
  },

  // Search wilayah
  search: async (keyword: string): Promise<Wilayah[]> => {
    const response = await api.get<Wilayah[]>('/search', {
      params: { keyword },
    });
    return response.data;
  },

  // Get wilayah by code
  getByKode: async (kode: string): Promise<Wilayah> => {
    const response = await api.get<Wilayah>(`/${kode}`);
    return response.data;
  },

  // Get boundaries by code
  getBoundaries: async (kode: string): Promise<Wilayah> => {
    const response = await api.get<Wilayah>(`/${kode}/boundaries`);
    return response.data;
  },

  // Get all with boundaries
  getAllWithBoundaries: async (): Promise<Wilayah[]> => {
    const response = await api.get<Wilayah[]>('/all');
    return response.data;
  },

  // Get boundary data with geometry
  getBoundaryData: async (kode: string): Promise<BoundaryData> => {
    const response = await api.get<BoundaryData>(`/${kode}/boundary`);
    return response.data;
  },
};
