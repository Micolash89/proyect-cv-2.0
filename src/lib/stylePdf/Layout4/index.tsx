import React from "react";
import { Document, Page, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF, DEFAULT_OPTIONS_PDF } from "../definitions";
import { registerFonts } from "../fonts";
import { Layout4Header } from "./Header";
import { Layout4Body } from "./Body";
import { createLayout4Styles } from "./styles";

export const Layout4: React.FC<{ user: UserCV; options?: Partial<OptionsPDF> }> = ({ user, options }) => {
  registerFonts();
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createLayout4Styles(opts);
  const documentTitle = opts.fullName ? user.fullName : user.fullName.split(" ").slice(0, 2).join(" ");

  return (
    <Document title={`CV - ${documentTitle}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <Layout4Header user={user} options={opts} />
          <Layout4Body user={user} options={opts} />
        </View>
      </Page>
    </Document>
  );
};
export default Layout4;
