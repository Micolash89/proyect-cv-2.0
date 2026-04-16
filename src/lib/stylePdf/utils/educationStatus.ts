import type { EducationStatus } from "@/types";
import { EDUCATION_STATUS_LABELS } from "@/lib/constants/cv";

export function normalizeEducationStatusValue(value: unknown): EducationStatus {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (normalized === "complete" || normalized === "completo") {
    return "complete";
  }

  if (
    normalized === "in_progress"
    || normalized === "in progress"
    || normalized === "en_curso"
    || normalized === "en curso"
    || normalized === "en_proceso"
    || normalized === "en proceso"
  ) {
    return "in_progress";
  }

  if (normalized === "incomplete" || normalized === "incompleto") {
    return "incomplete";
  }

  return "complete";
}

export function isEducationInProgress(value: unknown): boolean {
  return normalizeEducationStatusValue(value) === "in_progress";
}

export function formatEducationStatusLabel(value: unknown): string {
  const normalized = normalizeEducationStatusValue(value);
  return EDUCATION_STATUS_LABELS[normalized];
}

export function formatEducationDegreeWithStatus(degree: string, status: unknown): string {
  const cleanDegree = typeof degree === "string" ? degree.trim() : "";
  const label = formatEducationStatusLabel(status);

  if (!cleanDegree) {
    return `(${label})`;
  }

  return `${cleanDegree} (${label})`;
}
