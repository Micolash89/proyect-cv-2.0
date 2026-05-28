"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import { Select } from "@/components/ui/select";
import {
  getProvincias,
  getDepartamentos,
  getLocalidadesByProvincia,
  getMunicipiosLocalidad,
  type Provincia,
  type Departamento,
  type Localidad,
} from "@/lib/api/georef";

const CABA_PROVINCIA_ID = "02";

interface LocationOption {
  id: string;
  nombre: string;
}

interface LocationSelectorProps {
  value?: {
    provincia?: string;
    municipio?: string;
    localidad?: string;
  };
  onChange?: (location: {
    provincia: string;
    municipio: string;
    localidad: string;
  }) => void;
  disabled?: boolean;
  showLabels?: boolean;
}

interface LocationState {
  provincias: Provincia[];
  municipioOptions: LocationOption[];
  localidadOptions: LocationOption[];
  selectedProvinciaId: string;
  selectedProvinciaNombre: string;
  selectedMunicipioId: string;
  selectedMunicipioNombre: string;
  selectedLocalidadNombre: string;
}

type LocationAction =
  | { type: "SET_PROVINCIAS"; payload: Provincia[] }
  | { type: "SET_MUNICIPIO_OPTIONS"; payload: LocationOption[] }
  | { type: "SET_LOCALIDAD_OPTIONS"; payload: LocationOption[] }
  | { type: "SET_PROVINCIA"; payload: { id: string; nombre: string } }
  | { type: "SET_MUNICIPIO"; payload: { id: string; nombre: string } }
  | { type: "SET_LOCALIDAD"; payload: string }
  | { type: "RESET_MUNICIPIO" }
  | { type: "RESET_LOCALIDAD" }
  | { type: "PRECARGA"; payload: { provincia: string; municipio?: string; localidad?: string; provincias: Provincia[] } };

const initialState: LocationState = {
  provincias: [],
  municipioOptions: [],
  localidadOptions: [],
  selectedProvinciaId: "",
  selectedProvinciaNombre: "",
  selectedMunicipioId: "",
  selectedMunicipioNombre: "",
  selectedLocalidadNombre: "",
};

function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case "SET_PROVINCIAS":
      return { ...state, provincias: action.payload };
    case "SET_MUNICIPIO_OPTIONS":
      return { ...state, municipioOptions: action.payload };
    case "SET_LOCALIDAD_OPTIONS":
      return { ...state, localidadOptions: action.payload };
    case "SET_PROVINCIA":
      return {
        ...state,
        selectedProvinciaId: action.payload.id,
        selectedProvinciaNombre: action.payload.nombre,
        selectedMunicipioId: "",
        selectedMunicipioNombre: "",
        selectedLocalidadNombre: "",
        municipioOptions: [],
        localidadOptions: [],
      };
    case "SET_MUNICIPIO":
      return {
        ...state,
        selectedMunicipioId: action.payload.id,
        selectedMunicipioNombre: action.payload.nombre,
        selectedLocalidadNombre: "",
        localidadOptions: [],
      };
    case "SET_LOCALIDAD":
      return {
        ...state,
        selectedLocalidadNombre: action.payload,
      };
    case "RESET_MUNICIPIO":
      return {
        ...state,
        selectedMunicipioId: "",
        selectedMunicipioNombre: "",
        selectedLocalidadNombre: "",
        municipioOptions: [],
        localidadOptions: [],
      };
    case "RESET_LOCALIDAD":
      return {
        ...state,
        selectedLocalidadNombre: "",
        localidadOptions: [],
      };
    case "PRECARGA": {
      const provinciaEncontrada = action.payload.provincias.find(
        (p) => p.nombre === action.payload.provincia
      );
      if (!provinciaEncontrada) return state;
      return {
        ...state,
        selectedProvinciaId: provinciaEncontrada.id,
        selectedProvinciaNombre: action.payload.provincia,
        selectedMunicipioNombre: action.payload.municipio || "",
        selectedLocalidadNombre: action.payload.localidad || "",
      };
    }
    default:
      return state;
  }
}

export function LocationSelector({
  value = {},
  onChange,
  disabled = false,
  showLabels = true,
}: LocationSelectorProps) {
  const [state, dispatch] = useReducer(locationReducer, initialState);
  const initRef = useRef({
    provincia: false,
    municipios: false,
    localidades: false,
  });

  const isCabaSelected = state.selectedProvinciaId === CABA_PROVINCIA_ID;

  // EFECTO 1: Cargar provincias una sola vez
  useEffect(() => {
    const loadProvincias = async () => {
      const data = await getProvincias();
      dispatch({ type: "SET_PROVINCIAS", payload: data });
    };
    loadProvincias();
  }, []);

  // EFECTO 2: Precarga inicial de ubicación desde props (una sola vez)
  useEffect(() => {
    if (state.provincias.length === 0) return;
    if (initRef.current.provincia) return;

    if (value.provincia) {
      dispatch({
        type: "PRECARGA",
        payload: {
          provincia: value.provincia,
          municipio: value.municipio,
          localidad: value.localidad,
          provincias: state.provincias,
        },
      });
      initRef.current.provincia = true;
    }
  }, [state.provincias, value.provincia, value.municipio, value.localidad]);

  // EFECTO 3: Cargar municipios/departamentos cuando cambia provincia
  useEffect(() => {
    if (!state.selectedProvinciaId) {
      dispatch({ type: "SET_MUNICIPIO_OPTIONS", payload: [] });
      dispatch({ type: "SET_LOCALIDAD_OPTIONS", payload: [] });
      return;
    }

    let isMounted = true;

    const loadMunicipios = async () => {
      if (isCabaSelected) {
        const barrios = await getLocalidadesByProvincia(state.selectedProvinciaId);
        if (isMounted) {
          dispatch({ type: "SET_MUNICIPIO_OPTIONS", payload: [] });
          dispatch({ type: "SET_LOCALIDAD_OPTIONS", payload: barrios });
        }
      } else {
        const municipios = await getDepartamentos(state.selectedProvinciaId);
        if (isMounted) {
          dispatch({ type: "SET_MUNICIPIO_OPTIONS", payload: municipios });
          dispatch({ type: "SET_LOCALIDAD_OPTIONS", payload: [] });
        }
      }
    };

    loadMunicipios();

    return () => {
      isMounted = false;
    };
  }, [state.selectedProvinciaId, isCabaSelected]);

  // EFECTO 4: Cargar localidades cuando cambia municipio (solo no-CABA)
  useEffect(() => {
    if (isCabaSelected || !state.selectedMunicipioId) {
      dispatch({ type: "SET_LOCALIDAD_OPTIONS", payload: [] });
      return;
    }

    let isMounted = true;

    const loadLocalidades = async () => {
      const localidades = await getMunicipiosLocalidad(
        state.selectedProvinciaId,
        state.selectedMunicipioId,
      );
      if (isMounted) {
        dispatch({ type: "SET_LOCALIDAD_OPTIONS", payload: localidades });
      }
    };

    loadLocalidades();

    return () => {
      isMounted = false;
    };
  }, [state.selectedMunicipioId, state.selectedProvinciaId, isCabaSelected]);

  const handleProvinciaChange = useCallback((nombreProvincia: string) => {
    const provincia = state.provincias.find((p) => p.nombre === nombreProvincia);
    if (provincia) {
      dispatch({
        type: "SET_PROVINCIA",
        payload: { id: provincia.id, nombre: nombreProvincia },
      });

      if (onChange) {
        onChange({
          provincia: nombreProvincia,
          municipio: "",
          localidad: "",
        });
      }
    }
  }, [state.provincias, onChange]);

  const handleMunicipioChange = useCallback((nombreMunicipio: string) => {
    const municipio = state.municipioOptions.find((m) => m.nombre === nombreMunicipio);
    if (municipio) {
      dispatch({
        type: "SET_MUNICIPIO",
        payload: { id: municipio.id, nombre: nombreMunicipio },
      });

      if (onChange) {
        onChange({
          provincia: state.selectedProvinciaNombre,
          municipio: nombreMunicipio,
          localidad: "",
        });
      }
    }
  }, [state.municipioOptions, state.selectedProvinciaNombre, onChange]);

  const handleLocalidadChange = useCallback((nombreLocalidad: string) => {
    dispatch({ type: "SET_LOCALIDAD", payload: nombreLocalidad });

    if (onChange) {
      onChange({
        provincia: state.selectedProvinciaNombre,
        municipio: isCabaSelected ? "" : state.selectedMunicipioNombre,
        localidad: nombreLocalidad,
      });
    }
  }, [state.selectedProvinciaNombre, state.selectedMunicipioNombre, isCabaSelected, onChange]);

  // Determinar si se deben mostrar los selectores
  const shouldShowMunicipio = !isCabaSelected;
  const shouldShowLocalidad = true;
  const isMunicipioDisabled = !state.selectedProvinciaId || isCabaSelected;
  const isLocalidadDisabled = !state.selectedProvinciaId || (!isCabaSelected && !state.selectedMunicipioId);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {/* Provincia */}
      <Select
        value={state.selectedProvinciaNombre}
        placeholder={showLabels ? "Provincia" : "Seleccioná una provincia"}
        onChange={(e) => handleProvinciaChange(e.target.value)}
        options={state.provincias.map((p) => ({ value: p.nombre, label: p.nombre }))}
        disabled={disabled}
      />

      {/* Municipio/Departamento */}
      {shouldShowMunicipio && (
        <Select
          value={state.selectedMunicipioNombre}
          placeholder={showLabels ? "Municipio" : "Seleccioná un municipio"}
          onChange={(e) => handleMunicipioChange(e.target.value)}
          options={state.municipioOptions.map((m) => ({
            value: m.nombre,
            label: m.nombre,
          }))}
          disabled={disabled || isMunicipioDisabled}
        />
      )}

      {/* Localidad/Barrio */}
      {shouldShowLocalidad && (
        <Select
          value={state.selectedLocalidadNombre}
          placeholder={
            showLabels
              ? isCabaSelected
                ? "Barrio"
                : "Localidad"
              : isCabaSelected
                ? "Seleccioná un barrio"
                : "Seleccioná una localidad"
          }
          onChange={(e) => handleLocalidadChange(e.target.value)}
          options={state.localidadOptions.map((l) => ({
            value: l.nombre,
            label: l.nombre,
          }))}
          disabled={disabled || isLocalidadDisabled}
        />
      )}
    </div>
  );
}
