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

export const createLayout5Styles = (opts: OptionsPDF) => {
  return StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      flexDirection: "row",
    },
    leftColumn: {
      width: "35%",
      paddingTop: 20,
      paddingLeft: 20,
      paddingRight: 5,
      paddingBottom: 0,
      marginTop: 230,
    },
    rightColumn: {
      width: "65%",
      paddingTop: 240,
      paddingHorizontal: 20,
      paddingBottom: 0,
    },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 230,
    },
    headerImage: {
      width: "35%",
      height: 230,
      objectFit: "cover",
    },
    headerContent: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "65%",
      height: 230,
      padding: 20,
      backgroundColor: "#ededed",
    },
    name: {
      fontSize: opts.headerFontSize + 10,
      fontWeight: 300,
      letterSpacing: 3,
      marginBottom: 20,
      marginTop: 20,
      marginLeft: 20,
      lineHeight: 1,
      color: "#333333",
    },
    lastName: {
      fontSize: opts.headerFontSize + 10,
      fontWeight: 700,
      letterSpacing: 3,
      marginBottom: 0,
      marginLeft: 20,
      color: "#333333",
    },
    title: {
      fontSize: opts.bodyFontSize + 4,
      marginTop: 30,
      marginLeft: 20,
      letterSpacing: 1,
      color: "#333333",
    },
    sectionTitle: {
      fontSize: opts.bodyFontSize + 3,
      fontWeight: 500,
      marginBottom: 5,
      letterSpacing: 1,
      color: "white",
    },
    rightSectionTitle: {
      fontSize: opts.bodyFontSize + 3,
      fontWeight: 700,
      marginTop: 10,
      marginBottom: 7,
      letterSpacing: 1,
      color: "#000000",
    },
    contactInfo: {
      marginBottom: 40,
    },
    contactItem: {
      fontSize: opts.bodyFontSize,
      marginBottom: 8,
      color: "white",
    },
    skillsList: {
      marginBottom: 30,
    },
    skillItem: {
      fontSize: opts.bodyFontSize,
      marginBottom: 8,
      color: "white",
    },
    profileText: {
      fontSize: opts.bodyFontSize,
      marginBottom: 5,
      color: "#333333",
    },
    languageItem: {
      marginBottom: 8,
    },
    languageName: {
      fontSize: opts.bodyFontSize,
      marginBottom: 3,
      color: "white",
    },
    languageLevel: {
      fontSize: opts.bodyFontSize - 1,
      color: "#CCCCCC",
      fontStyle: "italic",
    },
    experienceEntry: {
      marginBottom: 10,
    },
    experienceDate: {
      fontSize: opts.bodyFontSize,
      marginBottom: 5,
      color: "#333333",
    },
    experienceTitle: {
      fontSize: opts.bodyFontSize + 1,
      fontWeight: 700,
      marginBottom: 3,
      color: "#333333",
    },
    experienceCompany: {
      fontSize: opts.bodyFontSize,
      marginBottom: 8,
      color: "#666666",
    },
    experienceDescription: {
      fontSize: opts.bodyFontSize,
      color: "#333333",
      lineHeight: 1.4,
    },
    educationEntry: {
      marginBottom: 20,
    },
    educationTitle: {
      fontSize: opts.bodyFontSize + 1,
      fontWeight: 700,
      marginBottom: 3,
      color: "#333333",
    },
    educationDetails: {
      fontSize: opts.bodyFontSize,
      color: "#666666",
      marginBottom: 3,
    },
    educationDate: {
      fontSize: opts.bodyFontSize,
      color: "#333333",
    },
    summary: {
      color: "#333333",
      lineHeight: 1.5,
      fontSize: opts.bodyFontSize,
      marginBottom: 10,
    },
    entryContainer: { marginBottom: 10 },
    entryHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
    institution: { fontWeight: 700, fontSize: opts.bodyFontSize + 1, color: "#333333" },
    jobTitle: { fontWeight: 500, fontSize: opts.bodyFontSize, color: "#444444" },
    dates: { fontSize: opts.bodyFontSize - 1, color: "#666666" },
    degree: { fontSize: opts.bodyFontSize, color: "#444444" },
    description: { fontSize: opts.bodyFontSize, color: "#333333", lineHeight: 1.4 },
    section: { marginBottom: 15 },
    skills: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
    skill: { fontSize: opts.bodyFontSize - 1, backgroundColor: "#f3f4f6", padding: 4, borderRadius: 3 },
  });
};
