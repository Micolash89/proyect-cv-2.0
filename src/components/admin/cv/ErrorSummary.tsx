"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ErrorSummaryProps {
  errors: Record<string, string>;
  onErrorClick: (fieldPath: string) => void;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  lastName: "Apellido",
  fullName: "Nombre completo",
  phone: "Teléfono",
  email: "Email",
  dni: "DNI",
  fechaNacimiento: "Fecha de nacimiento",
  location: "Ubicación",
  links: "Links",
  summary: "Resumen",
  targetJob: "Puesto objetivo",
  selectedTemplate: "Plantilla",
  templateSettings: "Configuración de plantilla",
  company: "Empresa",
  position: "Puesto",
  startDate: "Fecha desde",
  endDate: "Fecha hasta",
  description: "Descripción",
  institution: "Institución",
  degree: "Título/Carrera",
  status: "Estado",
  title: "Título del curso",
  startMonth: "Mes de inicio",
  startYear: "Año de inicio",
  language: "Idioma",
  level: "Nivel",
};

const SECTION_LABELS: Record<string, string> = {
  experience: "Experiencia",
  education: "Educación",
  certifications: "Cursos/Certificaciones",
  languages: "Idiomas",
  skills: "Habilidades",
};

function formatFieldPath(fieldPath: string): string {
  const [section, secondPart, ...rest] = fieldPath.split(".");

  if (!secondPart) {
    return FIELD_LABELS[section] ?? section;
  }

  const sectionLabel = SECTION_LABELS[section] ?? FIELD_LABELS[section] ?? section;
  const isIndexedField = /^\d+$/.test(secondPart);

  if (isIndexedField) {
    const indexLabel = `#${Number(secondPart) + 1}`;
    const nestedField = rest[0] ?? "";
    const nestedLabel = FIELD_LABELS[nestedField] ?? nestedField;

    return nestedLabel
      ? `${sectionLabel} ${indexLabel} - ${nestedLabel}`
      : `${sectionLabel} ${indexLabel}`;
  }

  const nestedPath = [secondPart, ...rest].join(".");
  const nestedLabel = FIELD_LABELS[nestedPath] ?? FIELD_LABELS[secondPart] ?? nestedPath;

  return nestedLabel
    ? `${sectionLabel} - ${nestedLabel}`
    : sectionLabel;
}

export function ErrorSummary({ errors, onErrorClick }: ErrorSummaryProps) {
  const entries = Object.entries(errors);

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50/60">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <CardTitle className="text-base text-red-700">Revisá los campos marcados en rojo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map(([fieldPath, message]) => (
          <Button
            key={fieldPath}
            type="button"
            variant="ghost"
            className="h-auto w-full justify-start whitespace-normal border border-red-200 bg-white px-3 py-2 text-left text-sm text-red-700 hover:bg-red-100"
            onClick={() => onErrorClick(fieldPath)}
          >
            <span className="font-medium">{formatFieldPath(fieldPath)}</span>
            <span className="mx-2 text-red-300">·</span>
            <span>{message}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}