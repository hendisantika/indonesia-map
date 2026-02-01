export interface Wilayah {
  kode: string;
  nama: string;
  ibukota?: string;
  lat: number;
  lng: number;
  elv?: number;
  tz?: number;
  luas?: number;
  penduduk?: number;
  path?: string;
  status?: string;
}

export interface BoundaryData {
  kode: string;
  nama: string;
  level: string;
  lat: number;
  lng: number;
  coordinates: string | any[][];
  geometry?: {
    lat: number;
    lng: number;
    coordinates: string | any[][];
  };
}

export interface WilayahSelectOption {
  value: string;
  label: string;
}
