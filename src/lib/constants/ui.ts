import type { LucideIcon } from "lucide-react";
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  FileText, Image, CheckCircle, Clock, Eye, CheckCircle as CheckCircleIcon
} from "lucide-react";

export const colorPalette = [
  { name: "Gris Oscuro", value: "#374151" },
  { name: "Gris", value: "#6b7280" },
  { name: "Azul Noche", value: "#1e3a5f" },
  { name: "Bordó", value: "#7f1d1d" },
  { name: "Verde Oliva", value: "#3f6212" },
  { name: "Marrón", value: "#78350f" },
  { name: "Negro", value: "#111827" },
  { name: "Gris Claro", value: "#9ca3af" },
] as const;

export const languageOptions = [
  { value: "Español", label: "Español" },
  { value: "Inglés", label: "Inglés" },
  { value: "Portugués", label: "Portugués" },
  { value: "Francés", label: "Francés" },
  { value: "Alemán", label: "Alemán" },
  { value: "Italiano", label: "Italiano" },
  { value: "Otro", label: "Otro" },
] as const;

export const levelOptions = [
  { value: "Básico", label: "Básico" },
  { value: "Intermedio", label: "Intermedio" },
  { value: "Avanzado", label: "Avanzado" },
  { value: "Nativo", label: "Nativo" },
] as const;

export type SelectOption = {
  value: string;
  label: string;
};

export const languageSelectOptions: SelectOption[] = languageOptions.map((option) => ({
  value: option.value,
  label: option.label,
}));

export const levelSelectOptions: SelectOption[] = levelOptions.map((option) => ({
  value: option.value,
  label: option.label,
}));

export const fontSizeOptions = [
  { value: "small", label: "Pequeño" },
  { value: "medium", label: "Mediano" },
  { value: "large", label: "Grande" },
] as const;

export const layoutOptions = [
  { value: "descending", label: "Más reciente primero" },
  { value: "ascending", label: "Más antiguo primero" },
] as const;

export const disponibilidadOptions = [
  { value: "NINGUNO", label: "Seleccionar disponibilidad" },
  { value: "completa", label: "Jornada completa" },
  { value: "partida", label: "Jornada parcial" },
  { value: "horaria", label: "Por horas" },
  { value: "rotativo", label: "Horario rotativo" },
] as const;

export type Step = {
  id: number;
  title: string;
  icon: LucideIcon;
};

export const registroSteps: Step[] = [
  { id: 1, title: "Datos Personales", icon: User },
  { id: 2, title: "Foto", icon: Image },
  { id: 3, title: "Experiencia", icon: Briefcase },
  { id: 4, title: "Educación", icon: GraduationCap },
  { id: 5, title: "Habilidades", icon: FileText },
  { id: 6, title: "Diseño & Color", icon: CheckCircle },
  { id: 7, title: "Confirmar", icon: CheckCircleIcon },
];

export type StatusConfig = {
  label: string;
  variant: "warning" | "info" | "success";
  icon: LucideIcon;
};

export const statusConfig: Record<string, StatusConfig> = {
  pending: { label: "Pendiente", variant: "warning", icon: Clock },
  reviewed: { label: "Revisando", variant: "info", icon: Eye },
  completed: { label: "Completado", variant: "success", icon: CheckCircleIcon },
};
