import React from "react";
import { Document, Page, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF, DEFAULT_OPTIONS_PDF } from "../definitions";
import { registerFonts } from "../fonts";
import { Layout1Header } from "./Header";
import { Layout1Body } from "./Body";
import { createLayout1Styles } from "./styles";

interface Layout1Props {
  user: UserCV;
  options?: Partial<OptionsPDF>;
}

export const Layout1: React.FC<Layout1Props> = ({ user, options }) => {
  registerFonts();
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createLayout1Styles(opts);
  const documentTitle = opts.fullName ? user.fullName : user.fullName.split(" ").slice(0, 2).join(" ");

  return (
    <Document title={`CV - ${documentTitle}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <Layout1Header user={user} options={opts} />
          <Layout1Body user={user} options={opts} />
        </View>
      </Page>
    </Document>
  );
};

export default Layout1;
