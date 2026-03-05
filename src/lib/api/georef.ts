const BASE_URL = "https://apis.datos.gob.ar/georef/api";

export interface Provincia {
  id: string;
  nombre: string;
  centroide?: {
    lat: number;
    lon: number;
  };
}

export interface Departamento {
  id: string;
  nombre: string;
  provincia_id: string;
  centroide?: {
    lat: number;
    lon: number;
  };
}

export interface Localidad {
  id: string;
  nombre: string;
  provincia_id: string;
  departamento_id: string;
  centroide?: {
    lat: number;
    lon: number;
  };
}

interface GeorefResponse<T> {
  cantidad: number;
  total: number;
  inicio: number;
  parametros: Record<string, string>;
  resultados: T[];
}

async function fetchGeoref<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });
  
  url.searchParams.append("campos", "id,nombre");
  url.searchParams.append("max", "100");
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Error fetching ${endpoint}: ${response.statusText}`);
  }
  
  const data: GeorefResponse<T> = await response.json();
  return data.resultados;
}

export async function getProvincias(): Promise<Provincia[]> {
  return fetchGeoref<Provincia>("/provincias");
}

export async function getDepartamentos(provinciaId: string): Promise<Departamento[]> {
  if (!provinciaId) return [];
  return fetchGeoref<Departamento>("/departamentos", { provincia: provinciaId });
}

export async function getMunicipios(provinciaId: string): Promise<Departamento[]> {
  if (!provinciaId) return [];
  return fetchGeoref<Departamento>("/municipios", { provincia: provinciaId });
}

export async function getLocalidades(departamentoId: string): Promise<Localidad[]> {
  if (!departamentoId) return [];
  return fetchGeoref<Localidad>("/localidades", { departamento: departamentoId });
}

export async function searchUbicacion(query: string): Promise<{
  provincias: Provincia[];
  departamentos: Departamento[];
  localidades: Localidad[];
}> {
  const results = await Promise.all([
    fetchGeoref<Provincia>("/provincias", { nombre: query }),
    fetchGeoref<Departamento>("/departamentos", { nombre: query }),
    fetchGeoref<Localidad>("/localidades", { nombre: query }),
  ]);
  
  return {
    provincias: results[0],
    departamentos: results[1],
    localidades: results[2],
  };
}
