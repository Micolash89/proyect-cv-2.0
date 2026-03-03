import type { Experience, Education, CVFormData } from "./index";

export interface IAConfig {
  apiKey: string;
}

export interface IAProvider {
  name: string;
  generateProfile(experience: Experience[], skills: string[], targetJob?: string): Promise<string>;
  improveText(text: string): Promise<string>;
  extractFromCV(file: File): Promise<Partial<CVFormData>>;
  generateSkills(experience: Experience[], education: Education[], targetJob?: string): Promise<string[]>;
}

export interface IAProfileResult {
  success: boolean;
  profile?: string;
  error?: string;
}

export interface IAImproveResult {
  success: boolean;
  improved?: string;
  error?: string;
}

export interface IAExtractResult {
  success: boolean;
  extracted?: Partial<CVFormData>;
  error?: string;
}
