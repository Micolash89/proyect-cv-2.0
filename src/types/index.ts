export type CVStatus = "pending" | "reviewed" | "completed";
export type TemplateType =
  | "harvard"
  | "modern"
  | "classic"
  | "creative"
  | "minimal"
  | "professional"
  | "layout6"
  | "elegant";
export type FontSize = "small" | "medium" | "large";
export type LayoutOrder = "ascending" | "descending";
export type IAType = "gemini" | "claude" | "groq";
export type AvailabilityType = "fullTime" | "partTime";

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

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  provincia?: string;
  municipio?: string;
  localidad?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  provincia?: string;
  municipio?: string;
  localidad?: string;
}

export interface Language {
  id: string;
  language: string;
  level: string;
}

export interface Certification {
  id: string;
  title: string;
  institution?: string;
  startMonth: string;
  startYear: string;
  name?: string;
  issuer?: string;
  date?: string;
}

export interface TemplateSettings {
  primaryColor: string;
  headerBackground?: string;
  headerFontSize?: number;
  bodyFontSize?: number;
  fontFamily?: string;
  layout?: LayoutOrder;
  padding?: number;
  margin?: number;
  headerPadding?: number;
  bodyPadding?: number;
  showPhoto?: boolean;
  showSummary?: boolean;
  showSkills?: boolean;
  showLanguages?: boolean;
  showCertifications?: boolean;
  showOrientation?: boolean;
  fullName?: boolean;
  spaceBetween?: boolean;
  reverseExperience?: boolean;
  reverseEducation?: boolean;
  reverseCourses?: boolean;
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
  links?: string;
  provincia?: string;
  municipio?: string;
  localidad?: string;
}

export interface Admin {
  _id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
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
}

export interface CVFormData {
  fullName: string;
  phone: string;
  email?: string;
  location?: string;
  summary?: string;
  photo?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  certifications?: Certification[];
  selectedTemplate: TemplateType;
  templateSettings: TemplateSettings;
  targetJob?: string;
  disponibilidad?: AvailabilityType | string;
  incorporacionInmediata?: boolean;
  licencia?: string;
  movilidad?: boolean;
  office?: boolean;
}

export interface CVFormDraft {
  name: string;
  lastName: string;
  fullName: string;
  phone: string;
  dni?: string;
  email?: string;
  location?: string;
  links?: string;
  photo?: string;
  summary?: string;
  targetJob?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  certifications?: Certification[];
  disponibilidad?: AvailabilityType | string;
  incorporacionInmediata?: boolean;
  licencia?: string;
  movilidad?: boolean;
  office?: boolean;
  selectedTemplate: TemplateType;
  templateSettings: TemplateSettings;
}

export interface ExtractedCVData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  certifications?: Certification[];
  disponibilidad?: AvailabilityType | string;
  incorporacionInmediata?: boolean;
  licencia?: string;
  movilidad?: boolean;
  office?: boolean;
}

export type ProcessingStatus = "idle" | "processing" | "success" | "error";

export interface Theme {
  mode: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export interface IAProvider {
  name: string;
  generateProfile(experience: Experience[], skills: string[], targetJob?: string): Promise<string>;
  improveText(text: string): Promise<string>;
  extractFromCV(file: File): Promise<Partial<CVFormData>>;
  extractFromText(text: string): Promise<Partial<CVFormData>>;
  generateSkills(experience: Experience[], education: Education[], targetJob?: string): Promise<string[]>;
}
