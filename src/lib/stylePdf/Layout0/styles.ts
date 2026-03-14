import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout0Styles = (opts: OptionsPDF) => {
  return StyleSheet.create({
    page: {
      fontFamily: "Times",
      fontSize: opts.bodyFontSize,
      padding: opts.padding,
      backgroundColor: "#ffffff",
    },
    header: {
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    headerLeft: {
      flex: 1,
    },
    headerInfo: {
      flex: 1,
    },
    name: {
      fontSize: opts.headerFontSize,
      fontWeight: 700,
      textTransform: "uppercase",
      textAlign: "center",
      marginBottom: 4,
    },
    contactInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
      marginTop: 4,
      fontSize: opts.bodyFontSize - 1,
      color: "#333333",
      borderBottomWidth: 1,
      borderBottomColor: "#000000",
      paddingBottom: 8,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    photo: {
      position: "absolute",
      top: 5,
      right: 10,
      width: 90,
      height: 90,
      objectFit: "cover",
    },
    section: {
      marginTop: 12,
    },
    sectionTitle: {
      fontSize: opts.bodyFontSize + 2,
      fontWeight: 700,
      textTransform: "uppercase",
      borderBottomWidth: 1,
      borderBottomColor: "#000000",
      marginBottom: 8,
      paddingBottom: 4,
    },
    sectionContent: {
      flexDirection: "column",
      gap: 10,
    },
    entryContainer: {
      marginBottom: 8,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    institution: {
      fontWeight: 700,
      fontSize: opts.bodyFontSize + 1,
    },
    location: {
      fontSize: opts.bodyFontSize - 1,
      color: "#666666",
      fontStyle: "italic",
    },
    degree: {
      fontWeight: 600,
      fontSize: opts.bodyFontSize,
    },
    dates: {
      fontSize: opts.bodyFontSize - 1,
      color: "#666666",
      fontStyle: "italic",
    },
    description: {
      marginLeft: 12,
      marginRight: 12,
      marginTop: 4,
      color: "#444444",
      lineHeight: 1.4,
    },
    skills: {
      marginTop: 4,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    skill: {
      fontSize: opts.bodyFontSize - 1,
    },
    summary: {
      color: "#444444",
      lineHeight: 1.5,
      textAlign: "justify",
    },
    languageItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
  });
};
