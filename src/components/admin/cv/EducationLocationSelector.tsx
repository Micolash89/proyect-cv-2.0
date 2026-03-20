"use client";

import { LocationSelector } from "@/components/admin/cv/LocationSelector";

interface EducationLocationProps {
  educacionId: string;
  initialProvincia?: string;
  initialMunicipio?: string;
  initialLocalidad?: string;
  onChange: (eduId: string, data: { provincia: string; municipio: string; localidad: string }) => void;
}

export function EducationLocationSelector({ 
  educacionId, 
  initialProvincia = "", 
  initialMunicipio = "", 
  initialLocalidad = "",
  onChange 
}: EducationLocationProps) {
  const handleLocationChange = (location: { provincia: string; municipio: string; localidad: string }) => {
    onChange(educacionId, location);
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
