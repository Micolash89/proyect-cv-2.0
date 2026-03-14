import React from "react";
import { Font } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { Layout0 } from "@/lib/stylePdf/Layout0";
import { Layout1 } from "@/lib/stylePdf/Layout1";
import { Layout2 } from "@/lib/stylePdf/Layout2";
import { Layout3 } from "@/lib/stylePdf/Layout3";
import { Layout4 } from "@/lib/stylePdf/Layout4";
import { Layout5 } from "@/lib/stylePdf/Layout5";
import { Layout6 } from "@/lib/stylePdf/Layout6";
import { Layout7 } from "@/lib/stylePdf/Layout7";
import { DEFAULT_OPTIONS_PDF } from "@/lib/stylePdf/definitions";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf", fontWeight: 300 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf", fontWeight: 500 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
  ],
});

Font.register({
  family: "Montserrat",
  fonts: [
    { src: "https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg69CK48gW7PXoo9WlhyyTh89Y.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1Y6h0JZqefjh1V94Kt3BkU.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1Y6h0JZqefjt1V94Kt3BkU.woff2", fontWeight: 700 },
  ],
});

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9AMP6lQ.woff2", fontWeight: 700 },
  ],
});

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2", fontWeight: 700 },
  ],
});

Font.register({
  family: "Times",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9AMP6lQ.woff2", fontWeight: 700 },
  ],
});

interface CVTemplateProps {
  user: UserCV;
}

const CVTemplate: React.FC<CVTemplateProps> = ({ user }) => {
  const templateMap: Record<string, React.FC<{ user: UserCV; options?: any }>> = {
    harvard: Layout0,
    modern: Layout1,
    classic: Layout2,
    creative: Layout3,
    minimal: Layout4,
    professional: Layout5,
    elegant: Layout6,
    modernPlus: Layout7,
  };

  const SelectedLayout = templateMap[user.selectedTemplate] || Layout0;
  
  const templateSettings = user.templateSettings || {};
  
  const fontSizeMap: Record<string, { header: number; body: number }> = {
    small: { header: 20, body: 9 },
    medium: { header: 24, body: 10 },
    large: { header: 28, body: 11 },
  };
  
  const fontSizePreset = fontSizeMap[templateSettings.fontSize as string] || fontSizeMap.medium;

  const options = {
    ...DEFAULT_OPTIONS_PDF,
    primaryColor: templateSettings.primaryColor || DEFAULT_OPTIONS_PDF.primaryColor,
    headerFontSize: templateSettings.headerFontSize || fontSizePreset.header,
    bodyFontSize: templateSettings.bodyFontSize || fontSizePreset.body,
    fontFamily: templateSettings.fontFamily || DEFAULT_OPTIONS_PDF.fontFamily,
    padding: templateSettings.padding || DEFAULT_OPTIONS_PDF.padding,
    margin: templateSettings.margin || DEFAULT_OPTIONS_PDF.margin,
    headerPadding: templateSettings.headerPadding || DEFAULT_OPTIONS_PDF.headerPadding,
    bodyPadding: templateSettings.bodyPadding || DEFAULT_OPTIONS_PDF.bodyPadding,
    showPhoto: templateSettings.showPhoto !== undefined ? templateSettings.showPhoto : DEFAULT_OPTIONS_PDF.showPhoto,
    showSummary: templateSettings.showSummary !== undefined ? templateSettings.showSummary : DEFAULT_OPTIONS_PDF.showSummary,
    showSkills: templateSettings.showSkills !== undefined ? templateSettings.showSkills : DEFAULT_OPTIONS_PDF.showSkills,
    showLanguages: templateSettings.showLanguages !== undefined ? templateSettings.showLanguages : DEFAULT_OPTIONS_PDF.showLanguages,
    showProjects: templateSettings.showProjects !== undefined ? templateSettings.showProjects : DEFAULT_OPTIONS_PDF.showProjects,
    showCertifications: templateSettings.showCertifications !== undefined ? templateSettings.showCertifications : DEFAULT_OPTIONS_PDF.showCertifications,
    fullName: templateSettings.fullName !== undefined ? templateSettings.fullName : DEFAULT_OPTIONS_PDF.fullName,
    spaceBetween: templateSettings.spaceBetween !== undefined ? templateSettings.spaceBetween : DEFAULT_OPTIONS_PDF.spaceBetween,
    reverseExperience: templateSettings.reverseExperience || DEFAULT_OPTIONS_PDF.reverseExperience,
    reverseEducation: templateSettings.reverseEducation || DEFAULT_OPTIONS_PDF.reverseEducation,
    reverseCourses: templateSettings.reverseCourses || DEFAULT_OPTIONS_PDF.reverseCourses,
  };

  return <SelectedLayout user={user} options={options} />;
};

export default CVTemplate;
