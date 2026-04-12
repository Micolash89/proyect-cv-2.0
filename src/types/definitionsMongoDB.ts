import type { CVStatus, TemplateType, TemplateSettings, Experience, Education, Language, Certification, IAType, AvailabilityType } from "./index";

export interface UserCVDoc {
  _id: string;
  phone: string;
  fullName: string;
  email: string;
  photo?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  certifications?: Certification[];
  selectedTemplate: TemplateType;
  templateSettings: TemplateSettings;
  status: CVStatus;
  viewed: boolean;
  createdAt: string;
  updatedAt: string;
  targetJob?: string;
  dni?: string;
  fechaNacimiento?: string;
  licencia?: string;
  movilidad?: boolean;
  incorporacionInmediata?: boolean;
  disponibilidad?: AvailabilityType | string;
  office?: boolean;
}

export interface UserCVResponse {
  _id: string;
  phone: string;
  fullName: string;
  email: string;
  photo?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  certifications?: Certification[];
  selectedTemplate: TemplateType;
  templateSettings: TemplateSettings;
  status: CVStatus;
  viewed: boolean;
  createdAt: string;
  updatedAt: string;
  targetJob?: string;
  dni?: string;
  fechaNacimiento?: string;
  licencia?: string;
  movilidad?: boolean;
  incorporacionInmediata?: boolean;
  disponibilidad?: AvailabilityType | string;
  office?: boolean;
}

export interface Settings {
  whatsappNumber: string;
  geminiApiKey: string;
  claudeApiKey: string;
  groqApiKey: string;
  activeIA: IAType;
  emailHost: string;
  emailPort: string;
  emailUser: string;
  emailPassword: string;
  emailFrom: string;
}

export const DEFAULT_TEMPLATE_SETTINGS: TemplateSettings = {
  primaryColor: "#1e3a5f",
};

export const DEFAULT_SETTINGS: Settings = {
  whatsappNumber: "",
  geminiApiKey: "",
  claudeApiKey: "",
  groqApiKey: "",
  activeIA: "groq",
  emailHost: "",
  emailPort: "",
  emailUser: "",
  emailPassword: "",
  emailFrom: "",
};
