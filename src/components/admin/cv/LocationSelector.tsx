"use client";

import { useState, useEffect, useRef } from "react";
import { Select } from "@/components/ui/select";
import {
  getProvincias,
  getDepartamentos,
  getLocalidadesByProvincia,
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

export function LocationSelector({
  value = {},
  onChange,
  disabled = false,
  showLabels = true,
}: LocationSelectorProps) {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [secondLevelOptions, setSecondLevelOptions] = useState<LocationOption[]>([]);

  const [selectedProvinciaId, setSelectedProvinciaId] = useState("");
  const [selectedProvinciaNombre, setSelectedProvinciaNombre] = useState("");
  const [selectedMunicipioNombre, setSelectedMunicipioNombre] =
    useState("");

  const initRef = useRef({
    provincia: false,
    municipio: false,
  });

  const isCabaSelected = selectedProvinciaId === CABA_PROVINCIA_ID;

  useEffect(() => {
    const loadProvincias = async () => {
      const data = await getProvincias();
      setProvincias(data);

      if (value.provincia && !initRef.current.provincia) {
        const provinciaEncontrada = data.find(
          (p) => p.nombre === value.provincia,
        );
        if (provinciaEncontrada) {
          setSelectedProvinciaId(provinciaEncontrada.id);
          setSelectedProvinciaNombre(value.provincia);
          initRef.current.provincia = true;
        }
      }
    };
    loadProvincias();
  }, [value.provincia]);

  useEffect(() => {
    const loadSecondLevelOptions = async () => {
      if (!selectedProvinciaId) {
        setSecondLevelOptions([]);
        return;
      }

      const data: Array<Departamento | Localidad> = isCabaSelected
        ? await getLocalidadesByProvincia(selectedProvinciaId)
        : await getDepartamentos(selectedProvinciaId);

      setSecondLevelOptions(data);

      const initialMunicipio = isCabaSelected
        ? value.localidad || value.municipio
        : value.municipio;

      if (
        initialMunicipio &&
        !initRef.current.municipio &&
        selectedProvinciaId
      ) {
        const optionEncontrada = data.find((d) => d.nombre === initialMunicipio);
        if (optionEncontrada) {
          setSelectedMunicipioNombre(initialMunicipio);
          initRef.current.municipio = true;
        }
      }
    };
    loadSecondLevelOptions();
  }, [selectedProvinciaId, isCabaSelected, value.localidad, value.municipio]);

  const handleProvinciaChange = (nombreProvincia: string) => {
    setSelectedProvinciaNombre(nombreProvincia);
    const provincia = provincias.find((p) => p.nombre === nombreProvincia);
    setSelectedProvinciaId(provincia?.id || "");
    setSelectedMunicipioNombre("");
    setSecondLevelOptions([]);
    initRef.current = { provincia: true, municipio: false };

    if (onChange) {
      onChange({
        provincia: nombreProvincia,
        municipio: "",
        localidad: "",
      });
    }
  };

  const handleMunicipioChange = (nombreMunicipio: string) => {
    setSelectedMunicipioNombre(nombreMunicipio);
    const secondLevelOption = secondLevelOptions.find(
      (d) => d.nombre === nombreMunicipio,
    );
    if (!secondLevelOption) {
      return;
    }
    initRef.current = { provincia: true, municipio: true };

    if (onChange) {
      if (isCabaSelected) {
        onChange({
          provincia: selectedProvinciaNombre,
          municipio: "",
          localidad: nombreMunicipio,
        });
        return;
      }

      onChange({
        provincia: selectedProvinciaNombre,
        municipio: nombreMunicipio,
        localidad: "",
      });
    }
  };

  const secondLevelLabel = showLabels
    ? isCabaSelected
      ? "Barrio"
      : "Municipio"
    : isCabaSelected
      ? "Seleccioná un barrio"
      : "Seleccioná un municipio";

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2">
      <Select
        value={selectedProvinciaNombre}
        placeholder={showLabels ? "Provincia" : "Seleccioná una provincia"}
        onChange={(e) => handleProvinciaChange(e.target.value)}
        options={provincias.map((p) => ({ value: p.nombre, label: p.nombre }))}
        disabled={disabled}
      />
      <Select
        value={selectedMunicipioNombre}
        placeholder={secondLevelLabel}
        onChange={(e) => handleMunicipioChange(e.target.value)}
        options={secondLevelOptions.map((d) => ({ value: d.nombre, label: d.nombre }))}
        disabled={disabled || !selectedProvinciaId}
      />

      {/* Localidad selector removed: now Province -> Municipality/Locality (CABA) */}
    </div>
  );
}
