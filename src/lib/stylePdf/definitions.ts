export interface OptionsPDF {
  primaryColor: string;
  headerBackground?: string;
  headerFontSize: number;
  bodyFontSize: number;
  fontFamily: string;
  layout: LayoutOrder;
  padding: number;
  margin: number;
  headerPadding: number;
  bodyPadding: number;
  showPhoto: boolean;
  showSummary: boolean;
  showSkills: boolean;
  showLanguages: boolean;
  showCertifications: boolean;
  showOrientation: boolean;
  fullName: boolean;
  spaceBetween: boolean;
  reverseExperience: boolean;
  reverseEducation: boolean;
  reverseCourses: boolean;
}

export type FontSize = "small" | "medium" | "large";
export type LayoutOrder = "ascending" | "descending";

export const DEFAULT_OPTIONS_PDF: OptionsPDF = {
  primaryColor: "#1e3a5f",
  headerBackground: "#1e3a5f",
  headerFontSize: 24,
  bodyFontSize: 10,
  fontFamily: "Helvetica",
  layout: "descending",
  padding: 40,
  margin: 20,
  headerPadding: 40,
  bodyPadding: 40,
  showPhoto: true,
  showSummary: true,
  showSkills: true,
  showLanguages: true,
  showCertifications: false,
  showOrientation: true,
  fullName: true,
  spaceBetween: false,
  reverseExperience: false,
  reverseEducation: false,
  reverseCourses: false,
};

export const FONT_SIZE_PRESETS = {
  small: { header: 20, body: 9 },
  medium: { header: 24, body: 10 },
  large: { header: 28, body: 11 },
};

export const COLOR_PRESETS = [
  { name: "Azul", value: "#1e3a5f" },
  { name: "Negro", value: "#1a1a1a" },
  { name: "Gris", value: "#4a5568" },
  { name: "Verde", value: "#2d6a4f" },
  { name: "Rojo", value: "#9b2c2c" },
  { name: "Morado", value: "#553c9a" },
  { name: "Naranja", value: "#c05621" },
  { name: "Teal", value: "#285e61" },
];

