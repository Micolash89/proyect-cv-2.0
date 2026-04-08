import React from "react";
import { Document, Page } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF, DEFAULT_OPTIONS_PDF } from "../definitions";
import { registerFonts } from "../fonts";
import { Layout6Header } from "./Header";
import { Layout6Body } from "./Body";
import { createLayout6Styles } from "./styles";

export const Layout6: React.FC<{ user: UserCV; options?: Partial<OptionsPDF> }> = ({ user, options }) => {
  registerFonts();
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createLayout6Styles(opts);
  const documentTitle = opts.fullName ? user.fullName : user.fullName.split(" ").slice(0, 2).join(" ");

  return (
    <Document title={`CV - ${documentTitle}`}>
      <Page size="A4" style={styles.page}>
        <Layout6Header user={user} options={opts} />
        <Layout6Body user={user} options={opts} />
      </Page>
    </Document>
  );
};
export default Layout6;
