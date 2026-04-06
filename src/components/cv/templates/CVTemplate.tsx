import React from "react";
import { UserCV } from "@/types";
import { Layout0 } from "@/lib/stylePdf/Layout0/index";
import { Layout1 } from "@/lib/stylePdf/Layout1/index";
import { Layout2 } from "@/lib/stylePdf/Layout2/index";
import { Layout3 } from "@/lib/stylePdf/Layout3/index";
import { Layout4 } from "@/lib/stylePdf/Layout4/index";
import { Layout5 } from "@/lib/stylePdf/Layout5/index";
import { Layout6 } from "@/lib/stylePdf/Layout6/index";
import { DEFAULT_OPTIONS_PDF } from "@/lib/stylePdf/definitions";

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
    layout6: Layout6,
    elegant: Layout6,
  };

  const templateAliases: Record<string, string> = {
    elegant: "layout6",
  };

  const selectedTemplateId = templateAliases[user.selectedTemplate] || user.selectedTemplate;

  const SelectedLayout = templateMap[selectedTemplateId] || Layout0;
  
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
