export interface OptionsPDF {
  primaryColor: string;
  fontSize: FontSize;
  fontFamily: string;
  layout: LayoutOrder;
  padding: number;
  margin: number;
  showPhoto: boolean;
  showSummary: boolean;
  showSkills: boolean;
  showLanguages: boolean;
  showProjects: boolean;
  showCertifications: boolean;
}

export type FontSize = "small" | "medium" | "large";
export type LayoutOrder = "ascending" | "descending";

export const DEFAULT_OPTIONS_PDF: OptionsPDF = {
  primaryColor: "#1e3a5f",
  fontSize: "medium",
  fontFamily: "Helvetica",
  layout: "descending",
  padding: 40,
  margin: 20,
  showPhoto: true,
  showSummary: true,
  showSkills: true,
  showLanguages: true,
  showProjects: false,
  showCertifications: false,
};
