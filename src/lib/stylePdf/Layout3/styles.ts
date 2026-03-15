import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout3Styles = (opts: OptionsPDF) => {
  return StyleSheet.create({
    page: {
      fontFamily: "Montserrat",
      padding: 0,
      backgroundColor: "#FFFFFF",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#2A4365",
      paddingHorizontal: 20,
      paddingVertical: 15,
      marginBottom: 10,
    },
    headerContent: {
      marginLeft: 20,
      flex: 1,
    },
    container: {
      flexDirection: "row",
      padding: 20,
    },
    leftColumn: {
      width: "30%",
      paddingRight: 5,
    },
    rightColumn: {
      width: "70%",
      borderLeftWidth: 1,
      borderLeftColor: "#E2E8F0",
      paddingLeft: 20,
    },
    profileImage: {
      width: 100,
      height: 100,
      objectFit: "cover",
      borderRadius: 50,
      borderWidth: 4,
      borderColor: "#FFFFFF",
    },
    name: {
      color: "#FFFFFF",
      fontWeight: "bold",
      fontSize: opts.headerFontSize,
      marginBottom: 5,
    },
    title: {
      color: "#CBD5E0",
      fontWeight: "medium",
      fontSize: opts.bodyFontSize + 1,
    },
    contactInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 8,
    },
    contactItem: {
      fontSize: opts.bodyFontSize - 1,
      color: "#FFFFFF",
    },
    section: {
      marginBottom: 10,
    },
    sectionTitle: {
      color: "#2A4365",
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 3,
      borderBottomWidth: 2,
      borderBottomColor: "#E2E8F0",
      paddingBottom: 5,
      marginBottom: 10,
    },
    skillItem: {
      color: "#4A5568",
      fontSize: opts.bodyFontSize - 1,
      marginBottom: 5,
    },
    languageItem: {
      marginBottom: 5,
    },
    languageName: {
      color: "#2D3748",
      fontWeight: "medium",
      fontSize: opts.bodyFontSize,
    },
    languageLevel: {
      color: "#718096",
      fontSize: opts.bodyFontSize - 1,
    },
    profileText: {
      color: "#4A5568",
      lineHeight: 1.6,
      fontSize: opts.bodyFontSize,
    },
    experienceItem: {
      marginBottom: 10,
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 3,
    },
    companyName: {
      color: "#2D3748",
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 1,
    },
    jobTitle: {
      color: "#4A5568",
      fontWeight: "medium",
      fontSize: opts.bodyFontSize,
      marginBottom: 1,
    },
    dateLocation: {
      fontSize: opts.bodyFontSize - 1,
      color: "#718096",
    },
    locationText: {
      color: "#718096",
      fontSize: opts.bodyFontSize - 1,
      marginBottom: 1,
    },
    description: {
      color: "#4A5568",
      lineHeight: 1.4,
      fontSize: opts.bodyFontSize,
      marginTop: 4,
    },
    educationItem: {
      marginBottom: 10,
    },
    educationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 3,
    },
    institutionName: {
      color: "#2D3748",
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 1,
    },
    degree: {
      color: "#4A5568",
      fontSize: opts.bodyFontSize,
      marginBottom: 2,
    },
    certificationItem: {
      marginBottom: 8,
    },
    certificationName: {
      fontSize: opts.bodyFontSize - 1,
      color: "#2D3748",
      fontWeight: "medium",
    },
    certificationInstitution: {
      fontSize: opts.bodyFontSize - 2,
      color: "#718096",
    },
    summary: {
      color: "#4A5568",
      lineHeight: 1.6,
      fontSize: opts.bodyFontSize,
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
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 1,
      color: "#2D3748",
    },
    dates: {
      fontSize: opts.bodyFontSize - 1,
      color: "#718096",
    },
    skills: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 5,
    },
    skill: {
      backgroundColor: "#2A4365",
      color: "#FFFFFF",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 4,
      fontSize: opts.bodyFontSize - 1,
    },
  });
};
