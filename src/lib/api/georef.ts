import { cache } from "react";

const BASE_URL_V1 = "https://apis.datos.gob.ar/georef/api";
const BASE_URL_V2 = "https://apis.datos.gob.ar/georef/api/v2.0";
const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 250;

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

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry<T>(url: string, resource: string): Promise<T> {
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal, cache: "no-store" });

      if (!response.ok) {
        const statusText = response.statusText || `HTTP ${response.status}`;
        const shouldRetry = isRetryableStatus(response.status) && attempt < MAX_RETRIES;

        if (shouldRetry) {
          attempt += 1;
          await sleep(RETRY_BASE_DELAY_MS * attempt);
          continue;
        }

        throw new Error(`Error fetching ${resource}: ${statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const isNetwork = error instanceof TypeError;
      const shouldRetry = (isAbort || isNetwork) && attempt < MAX_RETRIES;

      if (shouldRetry) {
        attempt += 1;
        await sleep(RETRY_BASE_DELAY_MS * attempt);
        continue;
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`Error fetching ${resource}: retries exhausted`);
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

  const data = await fetchJsonWithRetry<GeorefV1Response<T>>(url.toString(), endpoint);
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

  const data = await fetchJsonWithRetry<GeorefV2Response<T>>(url.toString(), endpoint);
  return (data[key] as T[]) || [];
}

export const getProvincias = cache(async (): Promise<Provincia[]> => {
  try {
    const data = await fetchGeorefV2<Provincia>("/provincias", "provincias", {});
    return data.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.warn("Error fetching provincias:", error);
    return [];
  }
});

export const getMunicipios = cache(async (provinciaId: string): Promise<Municipio[]> => {
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
});

export const getDepartamentos = cache(async (provinciaId: string): Promise<Departamento[]> => {
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
});

export const getMunicipiosLocalidad = cache(async (provinciaId: string, departamentoId?: string): Promise<Localidad[]> => {
  if (!provinciaId) return [];

  try {
    const params: Record<string, string> = {
      provincia: provinciaId,
    };

    if (departamentoId) {
      params.departamento = departamentoId;
    }

    const data = await fetchGeorefV1<Localidad>("/localidades", params);
    return data.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.warn("Error fetching localidades:", error);
    return [];
  }
});
