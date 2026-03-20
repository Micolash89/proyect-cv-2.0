"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Select } from "@/components/ui/select";
import { getProvincias, getDepartamentos, getMunicipiosLocalidad, type Provincia, type Departamento, type Localidad } from "@/lib/api/georef";

interface LocationSelectorProps {
  value?: {
    provincia?: string;
    municipio?: string;
    localidad?: string;
  };
  onChange?: (location: { provincia: string; municipio: string; localidad: string }) => void;
  disabled?: boolean;
  showLabels?: boolean;
}

export function LocationSelector({ 
  value = {}, 
  onChange,
  disabled = false,
  showLabels = true 
}: LocationSelectorProps) {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [localidades, setLocalidadess] = useState<Localidad[]>([]);
  
  const [selectedProvincia, setSelectedProvincia] = useState(value.provincia || "");
  const [selectedDepartamento, setSelectedDepartamento] = useState(value.municipio || "");
  const [selectedLocalidad, setSelectedLocalidad] = useState(value.localidad || "");
  
  const isInitialized = useRef(false);

  // Load provincias on mount
  useEffect(() => {
    const loadProvincias = async () => {
      const data = await getProvincias();
      setProvincias(data);
    };
    loadProvincias();
  }, []);

  // Load departamentos when provincia changes
  useEffect(() => {
    const loadDepartamentos = async () => {
      if (!selectedProvincia) {
        setDepartamentos([]);
        setLocalidadess([]);
        return;
      }
      const data = await getDepartamentos(selectedProvincia);
      setDepartamentos(data);
    };
    loadDepartamentos();
  }, [selectedProvincia]);

  // Load localidades when provincia or departamento changes
  useEffect(() => {
    const loadLocalidadess = async () => {
      if (!selectedProvincia) {
        setLocalidadess([]);
        return;
      }
      const data = await getMunicipiosLocalidad(selectedProvincia, selectedDepartamento || undefined);
      setLocalidadess(data);
    };
    loadLocalidadess();
  }, [selectedProvincia, selectedDepartamento]);

  // Sync with external value changes (only on initial mount)
  useEffect(() => {
    if (!isInitialized.current) {
      if (value.provincia !== undefined) {
        setSelectedProvincia(value.provincia);
      }
      if (value.municipio !== undefined) {
        setSelectedDepartamento(value.municipio);
      }
      if (value.localidad !== undefined) {
        setSelectedLocalidad(value.localidad);
      }
      isInitialized.current = true;
    }
  }, []);

  const notifyChange = useCallback(() => {
    if (onChange) {
      onChange({
        provincia: selectedProvincia,
        municipio: selectedDepartamento,
        localidad: selectedLocalidad
      });
    }
  }, [onChange, selectedProvincia, selectedDepartamento, selectedLocalidad]);

  const handleProvinciaChange = (newValue: string) => {
    setSelectedProvincia(newValue);
    setSelectedDepartamento("");
    setSelectedLocalidad("");
    setDepartamentos([]);
    setLocalidadess([]);
    // Notify parent after state update
    setTimeout(() => {
      if (onChange) {
        onChange({
          provincia: newValue,
          municipio: "",
          localidad: ""
        });
      }
    }, 0);
  };

  const handleDepartamentoChange = (newValue: string) => {
    setSelectedDepartamento(newValue);
    setSelectedLocalidad("");
    // Notify parent after state update
    setTimeout(() => {
      if (onChange) {
        onChange({
          provincia: selectedProvincia,
          municipio: newValue,
          localidad: ""
        });
      }
    }, 0);
  };

  const handleLocalidadChange = (newValue: string) => {
    setSelectedLocalidad(newValue);
    // Notify parent after state update
    setTimeout(() => {
      if (onChange) {
        onChange({
          provincia: selectedProvincia,
          municipio: selectedDepartamento,
          localidad: newValue
        });
      }
    }, 0);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select
        value={selectedProvincia}
        onChange={(e) => handleProvinciaChange(e.target.value)}
        options={[
          { value: "", label: showLabels ? "Provincia" : "" },
          ...provincias.map((p) => ({ value: p.id, label: p.nombre }))
        ]}
        disabled={disabled}
      />
      <Select
        value={selectedDepartamento}
        onChange={(e) => handleDepartamentoChange(e.target.value)}
        options={[
          { value: "", label: showLabels ? "Departamento" : "" },
          ...departamentos.map((d) => ({ value: d.id, label: d.nombre }))
        ]}
        disabled={disabled || !selectedProvincia}
      />
      <Select
        value={selectedLocalidad}
        onChange={(e) => handleLocalidadChange(e.target.value)}
        options={[
          { value: "", label: showLabels ? "Localidad" : "" },
          ...localidades.map((l) => ({ value: l.id, label: l.nombre }))
        ]}
        disabled={disabled || !selectedProvincia}
      />
    </div>
  );
}
