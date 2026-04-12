import React from "react";
import { UserCV } from "@/types";
import { Layout0 } from "@/lib/stylePdf/Layout0/index";
import { Layout1 } from "@/lib/stylePdf/Layout1/index";
import { Layout2 } from "@/lib/stylePdf/Layout2/index";
import { Layout3 } from "@/lib/stylePdf/Layout3/index";
import { Layout4 } from "@/lib/stylePdf/Layout4/index";
import { Layout5 } from "@/lib/stylePdf/Layout5/index";
import { Layout6 } from "@/lib/stylePdf/Layout6/index";
import { DEFAULT_OPTIONS_PDF, type OptionsPDF } from "@/lib/stylePdf/definitions";
import {
  resolveTemplateId,
  sanitizeTemplatePrimaryColor,
} from "@/lib/constants/templates";

interface CVTemplateProps {
  user: UserCV;
}

const TEMPLATE_FONT_FAMILY: Record<string, string> = {
  harvard: "Times",
  modern: "Roboto",
  classic: "Roboto",
  creative: "Montserrat",
  minimal: "Helvetica",
  professional: "Helvetica",
  layout6: "Inter",
};

const CVTemplate: React.FC<CVTemplateProps> = ({ user }) => {
  const templateMap: Record<string, React.FC<{ user: UserCV; options?: OptionsPDF }>> = {
    harvard: Layout0,
    modern: Layout1,
    classic: Layout2,
    creative: Layout3,
    minimal: Layout4,
    professional: Layout5,
    layout6: Layout6,
    elegant: Layout6,
  };

  const selectedTemplateId = resolveTemplateId(user.selectedTemplate);

  const SelectedLayout = templateMap[selectedTemplateId] || Layout0;
  
  const templateSettings = user.templateSettings || {};
  const mergedTemplateSettings: OptionsPDF = {
    ...DEFAULT_OPTIONS_PDF,
    ...templateSettings,
  };

  const primaryColor = sanitizeTemplatePrimaryColor(
    selectedTemplateId,
    mergedTemplateSettings.primaryColor,
  );
  const enforcedFontFamily =
    TEMPLATE_FONT_FAMILY[selectedTemplateId] || DEFAULT_OPTIONS_PDF.fontFamily;

  const options: OptionsPDF = {
    ...mergedTemplateSettings,
    primaryColor,
    headerBackground: primaryColor,
    fontFamily: enforcedFontFamily,
  };

  return <SelectedLayout user={user} options={options} />;
};

export default CVTemplate;
