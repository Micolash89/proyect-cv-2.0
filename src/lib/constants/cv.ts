import type { CVFormDraft, TemplateSettings } from "@/types";
import { getTemplateDefaultColor } from "@/lib/constants/templates";

export const REGISTRO_DEFAULT_TEMPLATE_SETTINGS: TemplateSettings = {
  primaryColor: getTemplateDefaultColor("harvard"),
  fontSize: "medium",
  fontFamily: "Inter",
  layout: "descending",
  padding: 20,
  margin: 15,
};

export const ADMIN_NEW_DEFAULT_TEMPLATE_SETTINGS: Partial<TemplateSettings> = {
  primaryColor: getTemplateDefaultColor("harvard"),
  fontSize: "medium",
  fontFamily: "Helvetica",
  layout: "descending",
  padding: 40,
  margin: 20,
  fullName: true,
  showPhoto: true,
  showSummary: true,
  showSkills: true,
  showLanguages: true,
  reverseExperience: false,
  reverseEducation: false,
};

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
  experience: [],
  education: [],
  skills: [],
  languages: [],
  selectedTemplate: "harvard",
  templateSettings: REGISTRO_DEFAULT_TEMPLATE_SETTINGS,
};
