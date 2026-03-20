"use client";

import { useState, useEffect } from "react";
import { Select } from "@/components/ui/select";
import { getProvincias, getDepartamentos, getMunicipiosLocalidad, type Provincia, type Departamento, type Localidad } from "@/lib/api/georef";

interface ExperienceLocationProps {
  experienciaId: string;
  initialProvincia?: string;
  initialMunicipio?: string;
  initialLocalidad?: string;
  onChange: (expId: string, data: { provincia: string; municipio: string; localidad: string }) => void;
}

export function ExperienceLocationSelector({ 
  experienciaId, 
  initialProvincia = "", 
  initialMunicipio = "", 
  initialLocalidad = "",
  onChange 
}: ExperienceLocationProps) {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [localidades, setLocalidadess] = useState<Localidad[]>([]);
  
  const [selectedProvincia, setSelectedProvincia] = useState(initialProvincia);
  const [selectedDepartamento, setSelectedDepartamento] = useState(initialMunicipio);
  const [selectedLocalidad, setSelectedLocalidad] = useState(initialLocalidad);

  useEffect(() => {
    const loadProvincias = async () => {
      const data = await getProvincias();
      setProvincias(data);
    };
    loadProvincias();
  }, []);

  useEffect(() => {
    const loadDepartamentos = async () => {
      if (!selectedProvincia) {
        setDepartamentos([]);
        setSelectedDepartamento("");
        setLocalidadess([]);
        return;
      }
      const data = await getDepartamentos(selectedProvincia);
      setDepartamentos(data);
      if (initialMunicipio && data.some((d: Departamento) => d.id === initialMunicipio)) {
        setSelectedDepartamento(initialMunicipio);
      } else {
        setSelectedDepartamento("");
        setLocalidadess([]);
      }
    };
    loadDepartamentos();
  }, [selectedProvincia, initialMunicipio]);

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

  const handleProvinciaChange = (value: string) => {
    setSelectedProvincia(value);
    setSelectedDepartamento("");
    setSelectedLocalidad("");
    setLocalidadess([]);
    onChange(experienciaId, { provincia: value, municipio: "", localidad: "" });
  };

  const handleDepartamentoChange = (value: string) => {
    setSelectedDepartamento(value);
    setSelectedLocalidad("");
    onChange(experienciaId, { provincia: selectedProvincia, municipio: value, localidad: "" });
  };

  const handleLocalidadChange = (value: string) => {
    setSelectedLocalidad(value);
    onChange(experienciaId, { provincia: selectedProvincia, municipio: selectedDepartamento, localidad: value });
  };

  return (
    <div className="grid grid-cols-3 gap-2 col-span-2">
      <Select
        value={selectedProvincia}
        onChange={(e) => handleProvinciaChange(e.target.value)}
        options={[
          { value: "", label: "Provincia" },
          ...provincias.map((p) => ({ value: p.id, label: p.nombre }))
        ]}
      />
      <Select
        value={selectedDepartamento}
        onChange={(e) => handleDepartamentoChange(e.target.value)}
        options={[
          { value: "", label: "Municipio" },
          ...departamentos.map((d) => ({ value: d.id, label: d.nombre }))
        ]}
        disabled={!selectedProvincia}
      />
      <Select
        value={selectedLocalidad}
        onChange={(e) => handleLocalidadChange(e.target.value)}
        options={[
          { value: "", label: "Localidad" },
          ...localidades.map((l) => ({ value: l.id, label: l.nombre }))
        ]}
        disabled={!selectedProvincia}
      />
    </div>
  );
}
