"use client";

import { useState, useEffect, useRef } from "react";
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
  
  const [selectedProvinciaId, setSelectedProvinciaId] = useState("");
  const [selectedProvinciaNombre, setSelectedProvinciaNombre] = useState("");
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState("");
  const [selectedDepartamentoNombre, setSelectedDepartamentoNombre] = useState("");
  const [selectedLocalidadNombre, setSelectedLocalidadNombre] = useState("");
  
  const initRef = useRef({ provincia: false, municipio: false, localidad: false });

  useEffect(() => {
    const loadProvincias = async () => {
      const data = await getProvincias();
      setProvincias(data);
      
      if (value.provincia && !initRef.current.provincia) {
        const provinciaEncontrada = data.find(p => p.nombre === value.provincia);
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
    const loadDepartamentos = async () => {
      if (!selectedProvinciaId) {
        setDepartamentos([]);
        setLocalidadess([]);
        return;
      }
      const data = await getDepartamentos(selectedProvinciaId);
      setDepartamentos(data);
      
      if (value.municipio && !initRef.current.municipio && selectedProvinciaId) {
        const deptoEncontrado = data.find(d => d.nombre === value.municipio);
        if (deptoEncontrado) {
          setSelectedDepartamentoId(deptoEncontrado.id);
          setSelectedDepartamentoNombre(value.municipio);
          initRef.current.municipio = true;
        }
      }
    };
    loadDepartamentos();
  }, [selectedProvinciaId, value.municipio]);

  useEffect(() => {
    const loadLocalidadess = async () => {
      if (!selectedProvinciaId) {
        setLocalidadess([]);
        return;
      }
      const data = await getMunicipiosLocalidad(selectedProvinciaId, selectedDepartamentoId || undefined);
      setLocalidadess(data);
      
      if (value.localidad && !initRef.current.localidad && selectedProvinciaId) {
        setSelectedLocalidadNombre(value.localidad);
        initRef.current.localidad = true;
      }
    };
    loadLocalidadess();
  }, [selectedProvinciaId, selectedDepartamentoId, value.localidad]);

  const handleProvinciaChange = (nombreProvincia: string) => {
    setSelectedProvinciaNombre(nombreProvincia);
    const provincia = provincias.find(p => p.nombre === nombreProvincia);
    setSelectedProvinciaId(provincia?.id || "");
    setSelectedDepartamentoId("");
    setSelectedDepartamentoNombre("");
    setSelectedLocalidadNombre("");
    setDepartamentos([]);
    setLocalidadess([]);
    initRef.current = { provincia: true, municipio: false, localidad: false };
    
    if (onChange) {
      onChange({
        provincia: nombreProvincia,
        municipio: "",
        localidad: ""
      });
    }
  };

  const handleDepartamentoChange = (nombreDepartamento: string) => {
    setSelectedDepartamentoNombre(nombreDepartamento);
    const departamento = departamentos.find(d => d.nombre === nombreDepartamento);
    setSelectedDepartamentoId(departamento?.id || "");
    setSelectedLocalidadNombre("");
    initRef.current = { provincia: true, municipio: true, localidad: false };
    
    if (onChange) {
      onChange({
        provincia: selectedProvinciaNombre,
        municipio: nombreDepartamento,
        localidad: ""
      });
    }
  };

  const handleLocalidadChange = (nombreLocalidad: string) => {
    setSelectedLocalidadNombre(nombreLocalidad);
    initRef.current = { provincia: true, municipio: true, localidad: true };
    
    if (onChange) {
      onChange({
        provincia: selectedProvinciaNombre,
        municipio: selectedDepartamentoNombre,
        localidad: nombreLocalidad
      });
    }
  };

  return (
    <div className="grid grid-cols-3 col-span-2 gap-2">
      <Select
        value={selectedProvinciaNombre}
        onChange={(e) => handleProvinciaChange(e.target.value)}
        options={[
          { value: "", label: showLabels ? "Provincia" : "" },
          ...provincias.map((p) => ({ value: p.nombre, label: p.nombre }))
        ]}
        disabled={disabled}
      />
      <Select
        value={selectedDepartamentoNombre}
        onChange={(e) => handleDepartamentoChange(e.target.value)}
        options={[
          { value: "", label: showLabels ? "Municipio" : "" },
          ...departamentos.map((d) => ({ value: d.nombre, label: d.nombre }))
        ]}
        disabled={disabled || !selectedProvinciaId}
      />
      <Select
        value={selectedLocalidadNombre}
        onChange={(e) => handleLocalidadChange(e.target.value)}
        options={[
          { value: "", label: showLabels ? "Localidad" : "" },
          ...localidades.map((l) => ({ value: l.nombre, label: l.nombre }))
        ]}
        disabled={disabled || !selectedProvinciaId}
      />
    </div>
  );
}