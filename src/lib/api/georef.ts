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

async function fetchJson<T>(url: string, resource: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const statusText = response.statusText || `HTTP ${response.status}`;
    throw new Error(`Error fetching ${resource}: ${statusText}`);
  }

  return (await response.json()) as T;
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

  const data = await fetchJson<GeorefV1Response<T>>(url.toString(), endpoint);
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

  const data = await fetchJson<GeorefV2Response<T>>(url.toString(), endpoint);
  return (data[key] as T[]) || [];
}

export const getProvincias = async (): Promise<Provincia[]> => {
  try {
    const data = await fetchGeorefV2<Provincia>("/provincias", "provincias", {});
    return data.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.warn("Error fetching provincias:", error);
    return [];
  }
};

export const getMunicipios = async (provinciaId: string): Promise<Municipio[]> => {
  if (!provinciaId) return [];

  try {
    const data = await fetchGeorefV2<Municipio>("/municipios", "municipios", {
      provincia: provinciaId,
    });
    return data.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.warn("Error fetching municipios:", error);
    return [];
  }
};

export const getDepartamentos = async (provinciaId: string): Promise<Departamento[]> => {
  if (!provinciaId) return [];

  try {
    const data = await fetchGeorefV2<Departamento>("/departamentos", "departamentos", {
      provincia: provinciaId,
    });
    return data.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.warn("Error fetching departamentos:", error);
    return [];
  }
};

export const getLocalidadesByProvincia = async (
  provinciaId: string,
): Promise<Localidad[]> => {
  if (!provinciaId) return [];

  try {
    const data = await fetchGeorefV1<Localidad>("/localidades", {
      provincia: provinciaId,
    });
    return data.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.warn("Error fetching localidades by provincia:", error);
    return [];
  }
};

export const getMunicipiosLocalidad = async (provinciaId: string, departamentoId?: string): Promise<Localidad[]> => {
  if (!provinciaId) return [];
  if (!departamentoId) return [];

  try {
    const params: Record<string, string> = {
      provincia: provinciaId,
      departamento: departamentoId,
    };

    const data = await fetchGeorefV1<Localidad>("/localidades", params);
    return data.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.warn("Error fetching localidades:", error);
    return [];
  }
};
