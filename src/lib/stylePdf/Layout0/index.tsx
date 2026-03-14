import React from "react";
import { Document, Page } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF, DEFAULT_OPTIONS_PDF } from "../definitions";
import { Layout0Header } from "./Header";
import { Layout0Body } from "./Body";
import { createLayout0Styles } from "./styles";

interface Layout0Props {
  user: UserCV;
  options?: Partial<OptionsPDF>;
}

export const Layout0: React.FC<Layout0Props> = ({ user, options }) => {
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createLayout0Styles(opts);

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={styles.page}>
        <Layout0Header user={user} options={opts} />
        <Layout0Body user={user} options={opts} />
      </Page>
    </Document>
  );
};

export default Layout0;
