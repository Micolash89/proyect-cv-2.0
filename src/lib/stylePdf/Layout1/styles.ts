import { StyleSheet, Font } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf" },
    { src: "/fonts/Roboto-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: "bold" },
  ],
});

export const createLayout1Styles = (opts: OptionsPDF) => {
  return StyleSheet.create({
    page: {
      fontFamily: "Roboto",
      padding: 0,
      backgroundColor: "#FFFFFF",
    },
    container: {
      flexDirection: "row",
      minHeight: "100%",
    },
    sidebar: {
      width: "30%",
      color: "#FFFFFF",
      paddingHorizontal: 10,
      paddingTop: 20,
      paddingBottom: 0,
      backgroundColor: opts.primaryColor,
    },
    mainContent: {
      width: "70%",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 0,
      display: "flex",
      flexDirection: "column",
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      objectFit: "cover",
      marginBottom: 20,
      alignSelf: "center",
      borderWidth: 4,
      borderColor: "#FFFFFF",
    },
    sidebarName: {
      fontSize: opts.headerFontSize,
      fontWeight: 700,
      textTransform: "uppercase",
      color: "#FFFFFF",
      textAlign: "center",
      marginBottom: 5,
    },
    profession: {
      textAlign: "center",
      fontSize: opts.bodyFontSize + 2,
      color: "#FFFFFF",
      marginBottom: 20,
    },
    sidebarContact: {
      marginTop: 10,
    },
    sidebarContactItem: {
      color: "#FFFFFF",
      fontSize: opts.bodyFontSize - 1,
      marginBottom: 4,
    },
    sidebarSectionTitle: {
      fontSize: opts.bodyFontSize + 2,
      fontWeight: 700,
      color: "#FFFFFF",
      marginTop: 20,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#FFFFFF",
      paddingBottom: 3,
    },
    skillItem: {
      color: "#FFFFFF",
      fontSize: opts.bodyFontSize - 1,
      marginBottom: 5,
    },
    section: {
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: opts.bodyFontSize + 4,
      fontWeight: 700,
      marginBottom: 10,
      borderBottomWidth: 2,
      borderBottomColor: "#dbdbdb",
      paddingBottom: 5,
      color: "#2D3748",
    },
    entryContainer: {
      marginBottom: 7,
    },
    companyName: {
      fontSize: opts.bodyFontSize + 1,
      fontWeight: 700,
      color: "#2D3748",
    },
    jobTitle: {
      fontSize: opts.bodyFontSize,
      fontWeight: 500,
      color: "#4A5568",
      marginBottom: 1,
    },
    dateLocation: {
      fontSize: opts.bodyFontSize - 1,
      color: "#718096",
      marginBottom: 1,
    },
    description: {
      fontSize: opts.bodyFontSize,
      color: "#4A5568",
      lineHeight: 1.4,
      marginTop: 4,
    },
    degree: {
      fontSize: opts.bodyFontSize,
      fontWeight: 500,
    },
    institution: {
      fontSize: opts.bodyFontSize - 1,
      color: "#323a47",
    },
    summary: {
      fontSize: opts.bodyFontSize,
      color: "#4A5568",
      lineHeight: 1.4,
      marginBottom: 10,
    },
    additionalInfo: {
      color: "#FFFFFF",
      fontSize: opts.bodyFontSize - 1,
      marginBottom: 3,
    },
  });
};
