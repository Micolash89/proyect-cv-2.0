const BASE_URL_V1 = "https://apis.datos.gob.ar/georef/api";
const BASE_URL_V2 = "https://apis.datos.gob.ar/georef/api/v2.0";

const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
const CATALOG_CACHE_TTL_MS = 1000 * 60 * 30;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

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
  [key: string]: T[] | number | Record<string, string>;
}

interface GeorefV2Response<T> {
  cantidad: number;
  total: number;
  inicio: number;
  [key: string]: T[] | number | Record<string, string>;
}

class HttpError extends Error {
  status: number;

  constructor(resource: string, status: number, statusText: string) {
    super(`Error fetching ${resource}: ${statusText || `HTTP ${status}`}`);
    this.name = "HttpError";
    this.status = status;
  }
}

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function getCachedResponse<T>(cacheKey: string): T | null {
  const cached = responseCache.get(cacheKey);
  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    responseCache.delete(cacheKey);
    return null;
  }

  return cached.data as T;
}

function setCachedResponse<T>(cacheKey: string, data: T, ttlMs: number): void {
  responseCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

function getBackoffDelayMs(attempt: number): number {
  const baseDelay = 400 * (2 ** attempt);
  const jitter = Math.floor(Math.random() * 200);
  return baseDelay + jitter;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof HttpError) {
    return RETRYABLE_STATUS_CODES.has(error.status);
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  return error instanceof TypeError;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      cache: "force-cache",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function fetchJson<T>(url: string, resource: string): Promise<T> {
  const cached = getCachedResponse<T>(url);
  if (cached) {
    return cached;
  }

  const pendingRequest = inFlightRequests.get(url);
  if (pendingRequest) {
    return pendingRequest as Promise<T>;
  }

  const requestPromise = (async () => {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const response = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);

        if (!response.ok) {
          throw new HttpError(resource, response.status, response.statusText);
        }

        const payload = (await response.json()) as T;
        setCachedResponse(url, payload, CATALOG_CACHE_TTL_MS);
        return payload;
      } catch (error) {
        const canRetry = attempt < MAX_RETRIES && isRetryableError(error);
        if (!canRetry) {
          throw error;
        }

        await sleep(getBackoffDelayMs(attempt));
      }
    }

    throw new Error(`Error fetching ${resource}: retry limit reached`);
  })();

  inFlightRequests.set(url, requestPromise as Promise<unknown>);

  try {
    return await requestPromise;
  } finally {
    inFlightRequests.delete(url);
  }
}

async function fetchGeorefV1<T>(endpoint: string, resultKey: string, params: Record<string, string> = {}): Promise<T[]> {
  const url = new URL(`${BASE_URL_V1}${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });
  
  url.searchParams.append("campos", "id,nombre");
  url.searchParams.append("max", "2000");

  const data = await fetchJson<GeorefV1Response<T>>(url.toString(), endpoint);
  return (data[resultKey] as T[]) || [];
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
    const data = await fetchGeorefV1<Localidad>("/localidades", "localidades", {
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

    const data = await fetchGeorefV1<Localidad>("/localidades", "localidades", params);
    return data.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.warn("Error fetching localidades:", error);
    return [];
  }
};
