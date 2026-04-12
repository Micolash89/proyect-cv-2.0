import type { Certification, UserCV } from "@/types";

const MONTH_LABELS: Record<string, string> = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre",
};

function parseLegacyYear(dateValue?: string): string {
  if (!dateValue) {
    return "";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return `${parsedDate.getFullYear()}`;
}

export function formatAvailabilityLabel(value?: UserCV["disponibilidad"]): string {
  if (value === "fullTime") {
    return "Tiempo completo (Full time)";
  }

  if (value === "partTime") {
    return "Tiempo parcial (Part time)";
  }

  return value || "";
}

export function formatCertificationDate(certification: Certification): string {
  if (certification.startMonth && certification.startYear) {
    const monthLabel = MONTH_LABELS[certification.startMonth] ?? certification.startMonth;
    return `${monthLabel} ${certification.startYear}`;
  }

  if (certification.date) {
    return parseLegacyYear(certification.date);
  }

  return certification.startYear || "";
}

export function formatCertificationTitle(certification: Certification): string {
  return certification.title || certification.name || "";
}

export function formatCertificationInstitution(certification: Certification): string {
  return certification.institution || certification.issuer || "";
}

export function buildAdditionalInfoLines(user: UserCV): string[] {
  return [
    user.licencia ? `Licencia de conducir: ${user.licencia}` : "",
    user.movilidad ? "Movilidad propia" : "",
    user.incorporacionInmediata ? "Incorporación inmediata" : "",
    user.office ? "Microsoft Office" : "",
    formatAvailabilityLabel(user.disponibilidad),
  ].filter(Boolean);
}
