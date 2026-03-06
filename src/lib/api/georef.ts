const BASE_URL = "https://apis.datos.gob.ar/georef/api/v2.0";

export interface Provincia {
  id: string;
  nombre: string;
}

export interface Municipio {
  id: string;
  nombre: string;
}

export interface Localidad {
  id: string;
  nombre: string;
}

interface GeorefProvinciasResponse {
  cantidad: number;
  total: number;
  inicio: number;
  provincias: Provincia[];
}

interface GeorefMunicipiosResponse {
  cantidad: number;
  total: number;
  inicio: number;
  municipios: Municipio[];
}

interface GeorefLocalidadesResponse {
  cantidad: number;
  total: number;
  inicio: number;
  localidades: Localidad[];
}

export async function getProvincias(): Promise<Provincia[]> {
  try {
    const url = new URL(`${BASE_URL}/provincias`);
    url.searchParams.append("campos", "id,nombre");
    url.searchParams.append("max", "100");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Error fetching provincias: ${response.statusText}`);
    }

    const data: GeorefProvinciasResponse = await response.json();
    return (data.provincias || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error("Error fetching provincias:", error);
    return [];
  }
}

export async function getMunicipios(provinciaId: string): Promise<Municipio[]> {
  if (!provinciaId) return [];
  
  try {
    const url = new URL(`${BASE_URL}/municipios`);
    url.searchParams.append("provincia", provinciaId);
    url.searchParams.append("campos", "id,nombre");
    url.searchParams.append("max", "500");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Error fetching municipios: ${response.statusText}`);
    }

    const data: GeorefMunicipiosResponse = await response.json();
    return (data.municipios || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error("Error fetching municipios:", error);
    return [];
  }
}

export async function getLocalidades(provinciaId: string): Promise<Localidad[]> {
  if (!provinciaId) return [];
  
  try {
    const url = new URL(`${BASE_URL}/localidades`);
    url.searchParams.append("provincia", provinciaId);
    url.searchParams.append("campos", "id,nombre");
    url.searchParams.append("max", "2000");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Error fetching localidades: ${response.statusText}`);
    }

    const data: GeorefLocalidadesResponse = await response.json();
    return (data.localidades || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error("Error fetching localidades:", error);
    return [];
  }
}
