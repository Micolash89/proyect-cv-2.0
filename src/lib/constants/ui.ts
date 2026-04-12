import type { LucideIcon } from "lucide-react";
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  FileText, Image, CheckCircle, Clock, Eye, CheckCircle as CheckCircleIcon,
  ShieldCheck, Zap
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

export const availabilityOptions = [
  { value: "fullTime", label: "Tiempo completo (Full time)" },
  { value: "partTime", label: "Tiempo parcial (Part time)" },
] as const;

const currentYear = new Date().getFullYear();

export const yearSelectOptions = Array.from(
  { length: currentYear - 1950 + 1 },
  (_, index) => {
    const year = currentYear - index;
    return { value: String(year), label: String(year) };
  },
);

export const monthSelectOptions = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
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
  { id: 5, title: "Certificados", icon: FileText },
  { id: 6, title: "Habilidades e Idiomas", icon: Zap },
  { id: 7, title: "Información Adicional", icon: ShieldCheck },
  { id: 8, title: "Diseño & Color", icon: CheckCircle },
  { id: 9, title: "Confirmar", icon: CheckCircleIcon },
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
