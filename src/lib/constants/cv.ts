import type { CVFormDraft, TemplateSettings } from "@/types";
import { getTemplateDefaultColor } from "@/lib/constants/templates";
import { DEFAULT_OPTIONS_PDF } from "@/lib/stylePdf/definitions";

export function buildTemplateSettingsDefaults(primaryColor: string): TemplateSettings {
  return {
    ...DEFAULT_OPTIONS_PDF,
    primaryColor,
    headerBackground: primaryColor,
  };
}

export const REGISTRO_DEFAULT_TEMPLATE_SETTINGS: TemplateSettings = buildTemplateSettingsDefaults(
  getTemplateDefaultColor("harvard"),
);

export const ADMIN_NEW_DEFAULT_TEMPLATE_SETTINGS: TemplateSettings = buildTemplateSettingsDefaults(
  getTemplateDefaultColor("harvard"),
);

export const REGISTRO_DEFAULT_FORM_DATA: CVFormDraft = {
  name: "",
  lastName: "",
  fullName: "",
  phone: "",
  dni: "",
  email: "",
  location: "",
  links: "",
  photo: "",
  summary: "",
  targetJob: "",
  licencia: "",
  movilidad: false,
  incorporacionInmediata: false,
  disponibilidad: "fullTime",
  office: false,
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  selectedTemplate: "harvard",
  templateSettings: REGISTRO_DEFAULT_TEMPLATE_SETTINGS,
};
