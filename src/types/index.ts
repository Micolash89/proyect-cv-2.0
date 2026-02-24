export type CVStatus = "pending" | "reviewed" | "completed";
export type TemplateType = "harvard" | "modern" | "classic" | "creative" | "minimal" | "professional";
export type FontSize = "small" | "medium" | "large";
export type LayoutOrder = "ascending" | "descending";
export type IAType = "gemini" | "claude" | "groq";

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface Language {
  id: string;
  language: string;
  level: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface TemplateSettings {
  primaryColor: string;
  fontSize: FontSize;
  fontFamily: string;
  layout: LayoutOrder;
  padding: number;
  margin: number;
}

export interface UserCV {
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
}

export interface Admin {
  _id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
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

export interface JWTPayload {
  adminId: string;
  email: string;
  name: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CVFormData {
  phone: string;
  fullName: string;
  email: string;
  photo?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  experience: Omit<Experience, "id">[];
  education: Omit<Education, "id">[];
  skills: string[];
  languages: Omit<Language, "id">[];
  projects?: Omit<Project, "id">[];
  certifications?: Omit<Certification, "id">[];
  selectedTemplate: TemplateType;
  templateSettings: TemplateSettings;
}

export interface IASettings {
  geminiApiKey: string;
  claudeApiKey: string;
  groqApiKey: string;
  activeIA: IAType;
}

export interface IAProvider {
  name: string;
  generateProfile(experience: Experience[], skills: string[], targetJob?: string): Promise<string>;
  improveText(text: string): Promise<string>;
  extractFromCV(file: File): Promise<Partial<CVFormData>>;
}

export interface Theme {
  mode: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}
