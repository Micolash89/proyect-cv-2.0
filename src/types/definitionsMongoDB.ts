import type { CVStatus, TemplateType, TemplateSettings, Experience, Education, Language, Project, Certification, IAType, FontSize, LayoutOrder } from "./index";

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
  projects?: Project[];
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
  incorporacion?: string;
  disponibilidad?: string;
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
  projects?: Project[];
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
  incorporacion?: string;
  disponibilidad?: string;
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
  defaultFontSize: FontSize;
  defaultLayout: LayoutOrder;
  defaultPadding: number;
  defaultMargin: number;
  showPhoto: boolean;
  showSummary: boolean;
  showSkills: boolean;
  showLanguages: boolean;
  showProjects: boolean;
  showCertifications: boolean;
}

export const DEFAULT_TEMPLATE_SETTINGS: TemplateSettings = {
  primaryColor: "#1e3a5f",
  fontSize: "medium",
  fontFamily: "Helvetica",
  layout: "descending",
  padding: 40,
  margin: 20,
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
  defaultFontSize: "medium",
  defaultLayout: "descending",
  defaultPadding: 40,
  defaultMargin: 20,
  showPhoto: true,
  showSummary: true,
  showSkills: true,
  showLanguages: true,
  showProjects: false,
  showCertifications: false,
};
