interface LocationParts {
  localidad?: string;
  municipio?: string;
  provincia?: string;
  fallback?: string;
}

const normalize = (value?: string): string => (value || "").trim();

export const formatPdfLocation = ({
  localidad,
  municipio,
  provincia,
  fallback,
}: LocationParts): string => {
  const safeLocalidad = normalize(localidad);
  const safeMunicipio = normalize(municipio);
  const safeProvincia = normalize(provincia);
  const safeFallback = normalize(fallback);

  if (safeLocalidad && safeMunicipio) {
    return safeProvincia
      ? `${safeProvincia}, ${safeMunicipio}, ${safeLocalidad}`
      : `${safeMunicipio}, ${safeLocalidad}`;
  }

  if (safeProvincia && safeMunicipio) {
    return `${safeProvincia}, ${safeMunicipio}`;
  }

  if (safeProvincia) {
    return safeProvincia;
  }

  if (safeLocalidad) {
    return safeLocalidad;
  }

  if (safeMunicipio) {
    return safeMunicipio;
  }

  return safeFallback;
};
