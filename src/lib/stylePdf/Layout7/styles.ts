import { StyleSheet, Font } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "/fonts/Helvetica-Regular.ttf" },
    { src: "/fonts/Helvetica-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Helvetica-Bold.ttf", fontWeight: "bold" },
    { src: "/fonts/Helvetica-Oblique.ttf", fontStyle: "italic" },
    { src: "/fonts/Helvetica-Light.ttf", fontWeight: "light" },
    { src: "/fonts/Helvetica-Medium.ttf", fontWeight: "medium" },
  ],
});

export const createLayout7Styles = (opts: OptionsPDF) => {
  return StyleSheet.create({
    page: {
      backgroundColor: "#FFFFFF",
      fontFamily: "Helvetica",
    },
    header: {
      flexDirection: "row",
      marginBottom: 20,
      backgroundColor: "#2C3E50",
      padding: 20,
      alignItems: "center",
    },
    headerContainer: {
      flexDirection: "row",
      marginBottom: 20,
      backgroundColor: "#2C3E50",
      padding: 20,
      alignItems: "center",
    },
    headerContent: {
      flex: 1,
      marginLeft: 15,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: "#FFFFFF",
      objectFit: "cover",
    },
    name: {
      color: "#FFFFFF",
      fontWeight: 700,
      fontSize: opts.headerFontSize,
      marginBottom: 5,
    },
    contactInfo: {
      color: "#ECF0F1",
      fontSize: opts.bodyFontSize - 1,
    },
    mainContent: {
      flexDirection: "row",
      paddingTop: 20,
      height: "100%",
    },
    leftColumn: {
      width: "40%",
      paddingRight: 15,
    },
    rightColumn: {
      display: "flex",
      width: "60%",
      paddingLeft: 15,
      borderLeftWidth: 1,
      borderLeftColor: "#BDC3C7",
      flexDirection: "column",
      height: "100%",
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      color: "#2C3E50",
      fontWeight: 700,
      fontSize: opts.bodyFontSize + 3,
      borderBottomWidth: 1,
      borderBottomColor: "#BDC3C7",
      paddingBottom: 5,
      marginBottom: 10,
    },
    entryContainer: {
      marginBottom: 10,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 3,
      fontWeight: 700,
    },
    institution: {
      fontWeight: 700,
      color: "#2C3E50",
      fontSize: opts.bodyFontSize + 1,
    },
    dates: {
      color: "#7F8C8D",
      fontSize: opts.bodyFontSize - 1,
    },
    location: {
      color: "#7F8C8D",
      fontStyle: "italic",
      fontSize: opts.bodyFontSize - 1,
    },
    degree: {
      color: "#34495E",
      fontSize: opts.bodyFontSize,
    },
    jobTitle: {
      color: "#2980B9",
      fontWeight: 700,
      fontSize: opts.bodyFontSize,
      marginTop: 2,
    },
    description: {
      color: "#34495E",
      marginTop: 5,
      lineHeight: 1.4,
      fontSize: opts.bodyFontSize,
    },
    skillsGrid: {
      flexDirection: "column",
    },
    skillItem: {
      color: "#34495E",
      marginRight: 10,
      marginBottom: 5,
      fontSize: opts.bodyFontSize - 1,
    },
    profileText: {
      color: "#34495E",
      fontStyle: "italic",
      textAlign: "justify",
      fontSize: opts.bodyFontSize,
      lineHeight: 1.5,
    },
    footer: {
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: "#BDC3C7",
      paddingTop: 15,
    },
    additionalInfo: {
      color: "#34495E",
      textAlign: "center",
      fontSize: opts.bodyFontSize - 1,
    },
    summary: {
      color: "#34495E",
      lineHeight: 1.5,
      fontSize: opts.bodyFontSize,
      marginBottom: 10,
    },
    skills: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
    skill: {
      backgroundColor: "#2C3E50",
      color: "#FFFFFF",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 4,
      fontSize: opts.bodyFontSize - 1,
      marginRight: 6,
      marginBottom: 6,
    },
    languageItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
    },
    languageName: {
      color: "#2C3E50",
      fontSize: opts.bodyFontSize,
    },
    languageLevel: {
      color: "#7F8C8D",
      fontSize: opts.bodyFontSize - 1,
    },
  });
};
