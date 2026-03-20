"use client";

import { LocationSelector } from "@/components/admin/cv/LocationSelector";

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
  const handleLocationChange = (location: { provincia: string; municipio: string; localidad: string }) => {
    onChange(experienciaId, location);
  };

  return (
    <LocationSelector
      value={{
        provincia: initialProvincia,
        municipio: initialMunicipio,
        localidad: initialLocalidad
      }}
      onChange={handleLocationChange}
    />
  );
}
