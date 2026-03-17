import { cache } from "react";

const BASE_URL_V1 = "https://apis.datos.gob.ar/georef/api";
const BASE_URL_V2 = "https://apis.datos.gob.ar/georef/api/v2.0";

export interface Provincia {
  id: string;
  nombre: string;
}

export interface Municipio {
  id: string;
  nombre: string;
}

export interface Departamento {
  id: string;
  nombre: string;
}

export interface Localidad {
  id: string;
  nombre: string;
}

interface GeorefV1Response<T> {
  cantidad: number;
  total: number;
  inicio: number;
  parametros: Record<string, string>;
  resultados: T[];
}

interface GeorefV2Response<T> {
  cantidad: number;
  total: number;
  inicio: number;
  [key: string]: T[] | number | Record<string, string>;
}

async function fetchGeorefV1<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  const url = new URL(`${BASE_URL_V1}${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });
  
  url.searchParams.append("campos", "id,nombre");
  url.searchParams.append("max", "2000");
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Error fetching ${endpoint}: ${response.statusText}`);
  }
  
  const data: GeorefV1Response<T> = await response.json();
  return data.resultados || [];
}

async function fetchGeorefV2<T>(endpoint: string, key: string, params: Record<string, string> = {}): Promise<T[]> {
  const url = new URL(`${BASE_URL_V2}${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });
  
  url.searchParams.append("campos", "id,nombre");
  url.searchParams.append("max", "500");
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Error fetching ${endpoint}: ${response.statusText}`);
  }
  
  const data: GeorefV2Response<T> = await response.json();
  return (data[key] as T[]) || [];
}

export const getProvincias = cache(async (): Promise<Provincia[]> => {
  try {
    const url = new URL(`${BASE_URL_V2}/provincias`);
    url.searchParams.append("campos", "id,nombre");
    url.searchParams.append("max", "100");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Error fetching provincias: ${response.statusText}`);
    }

    const data = await response.json();
    return ((data.provincias as Provincia[]) || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error("Error fetching provincias:", error);
    return [];
  }
});

export const getMunicipios = cache(async (provinciaId: string): Promise<Municipio[]> => {
  if (!provinciaId) return [];
  
  try {
    const url = new URL(`${BASE_URL_V2}/municipios`);
    url.searchParams.append("provincia", provinciaId);
    url.searchParams.append("campos", "id,nombre");
    url.searchParams.append("max", "500");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Error fetching municipios: ${response.statusText}`);
    }

    const data = await response.json();
    return ((data.municipios as Municipio[]) || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error("Error fetching municipios:", error);
    return [];
  }
});

export const getDepartamentos = cache(async (provinciaId: string): Promise<Departamento[]> => {
  if (!provinciaId) return [];
  
  try {
    const url = new URL(`${BASE_URL_V2}/departamentos`);
    url.searchParams.append("provincia", provinciaId);
    url.searchParams.append("campos", "id,nombre");
    url.searchParams.append("max", "500");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Error fetching departamentos: ${response.statusText}`);
    }

    const data = await response.json();
    return ((data.departamentos as Departamento[]) || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error("Error fetching departamentos:", error);
    return [];
  }
});

export const getMunicipiosLocalidad = cache(async (provinciaId: string, departamentoId?: string): Promise<Localidad[]> => {
  if (!provinciaId) return [];
  
  try {
    const url = new URL(`${BASE_URL_V1}/localidades`);
    url.searchParams.append("provincia", provinciaId);
    url.searchParams.append("campos", "id,nombre");
    url.searchParams.append("max", "2000");
    
    if (departamentoId) {
      url.searchParams.append("departamento", departamentoId);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Error fetching localidades: ${response.statusText}`);
    }
    
    const data = await response.json();
    return (data.localidades || []).sort((a: Localidad, b: Localidad) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error("Error fetching localidades:", error);
    return [];
  }
});
