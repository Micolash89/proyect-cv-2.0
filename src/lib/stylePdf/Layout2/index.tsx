import React from "react";
import { Document, Page, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF, DEFAULT_OPTIONS_PDF } from "../definitions";
import { registerFonts } from "../fonts";
import { Layout2Header } from "./Header";
import { Layout2Body } from "./Body";
import { createLayout2Styles } from "./styles";

interface Layout2Props {
  user: UserCV;
  options?: Partial<OptionsPDF>;
}

export const Layout2: React.FC<Layout2Props> = ({ user, options }) => {
  registerFonts();
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createLayout2Styles(opts);

  const documentTitle = opts.fullName ? user.fullName : user.fullName.split(" ").slice(0, 2).join(" ");

  return (
    <Document title={`CV - ${documentTitle}`}>
      <Page size="A4" style={styles.page}>
        <Layout2Header user={user} options={opts} />
        <Layout2Body user={user} options={opts} />
      </Page>
    </Document>
  );
};

export default Layout2;
