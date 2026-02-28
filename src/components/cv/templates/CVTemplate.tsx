import React from "react";
import { Font } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { Layout0, Layout1, Layout2, Layout3, Layout4, Layout5, Layout6, Layout7 } from "@/lib/stylePdf";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2", fontWeight: 700 },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2", fontWeight: 400 },
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
    layout6: Layout6,
    layout7: Layout7,
  };

  const SelectedLayout = templateMap[user.selectedTemplate] || Layout0;
  
  const options = {
    primaryColor: user.templateSettings?.primaryColor || "#1e3a5f",
    fontSize: user.templateSettings?.fontSize || "medium",
    showPhoto: true,
    showSummary: true,
    showSkills: true,
    showLanguages: true,
    layout: user.templateSettings?.layout || "descending",
  };

  return <SelectedLayout user={user} options={options} />;
};

export default CVTemplate;
