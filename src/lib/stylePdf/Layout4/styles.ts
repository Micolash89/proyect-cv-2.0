import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout4Styles = (opts: OptionsPDF) => {
  return StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 0,
    },
    container: {
      flexDirection: "row",
      flex: 1,
    },
    leftColumn: {
      width: "35%",
      paddingRight: 20,
      borderRightWidth: 1,
      borderRightColor: "#DDDDDD",
    },
    rightColumn: {
      width: "65%",
      paddingLeft: 20,
    },
    header: {
      marginBottom: 20,
    },
    name: {
      fontSize: opts.headerFontSize,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: "#333333",
      fontWeight: 700,
    },
    title: {
      fontSize: opts.bodyFontSize + 2,
      letterSpacing: 1,
      color: "#666666",
      textTransform: "uppercase",
      marginBottom: 20,
    },
    contactInfo: {
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 2,
    },
    contactItem: {
      fontSize: opts.bodyFontSize,
      marginBottom: 5,
      color: "#444444",
    },
    section: {
      marginTop: 15,
    },
    sectionTitle: {
      fontSize: opts.bodyFontSize + 1,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 10,
      color: "#333333",
      borderBottomWidth: 1,
      borderBottomColor: "#DDDDDD",
      paddingBottom: 5,
      fontWeight: 700,
    },
    skillItem: {
      fontSize: opts.bodyFontSize,
      marginBottom: 5,
      color: "#444444",
    },
    languageItem: {
      fontSize: opts.bodyFontSize,
      marginBottom: 5,
      color: "#444444",
    },
    profileSummary: {
      fontSize: opts.bodyFontSize,
      marginBottom: 15,
      lineHeight: 1.4,
      color: "#444444",
      textAlign: "justify",
    },
    experienceEntry: {
      marginBottom: 10,
    },
    entryContainer: {
      marginBottom: 10,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    institution: {
      fontWeight: 700,
      fontSize: opts.bodyFontSize + 1,
      color: "#333333",
    },
    jobTitle: {
      fontWeight: 500,
      fontSize: opts.bodyFontSize,
      color: "#444444",
      marginBottom: 3,
    },
    dateLocation: {
      fontSize: opts.bodyFontSize - 1,
      color: "#666666",
      marginBottom: 5,
    },
    description: {
      fontSize: opts.bodyFontSize,
      lineHeight: 1.4,
      color: "#444444",
      marginBottom: 5,
    },
    educationEntry: {
      marginBottom: 5,
    },
    institutionName: {
      fontWeight: 700,
      fontSize: opts.bodyFontSize,
      color: "#333333",
    },
    degree: {
      fontSize: opts.bodyFontSize,
      color: "#444444",
      marginBottom: 2,
    },
    gpa: {
      fontSize: opts.bodyFontSize - 1,
      color: "#666666",
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: "#DDDDDD",
      marginVertical: 10,
    },
    profileImage: {
      borderRadius: 50,
      marginBottom: 20,
      height: 150,
      alignSelf: "center",
      objectFit: "cover",
      width: 120,
    },
    profession: {
      textAlign: "center",
      marginBottom: 5,
      fontSize: opts.bodyFontSize,
      color: "#666666",
    },
    skills: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 5,
      gap: 4,
    },
    skill: {
      backgroundColor: "#a3a3a3",
      color: "white",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      fontSize: opts.bodyFontSize - 2,
    },
    summary: {
      color: "#444444",
      lineHeight: 1.5,
      fontSize: opts.bodyFontSize,
      marginBottom: 10,
    },
    dates: {
      fontSize: opts.bodyFontSize - 1,
      color: "#666666",
    },
  });
};
