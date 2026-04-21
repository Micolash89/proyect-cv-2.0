import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout5Styles = (opts: OptionsPDF) => {
  const headerHeight = 220;
  const leftColumnWidth = "35%";
  const rightColumnWidth = "65%";
  const accentColor = opts.primaryColor || "#4E5054";

  return StyleSheet.create({
    page: {
      fontFamily: opts.fontFamily,
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: "#F0F0F0",
    },
    topHeader: {
      flexDirection: "row",
      width: "100%",
      height: headerHeight,
      marginBottom: 0,
    },
    headerImageColumn: {
      width: leftColumnWidth,
      height: headerHeight,
    },
    headerImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    headerImageFallback: {
      width: "100%",
      height: "100%",
      backgroundColor: "#D0D3D7",
    },
    headerNameColumn: {
      width: rightColumnWidth,
      height: headerHeight,
      backgroundColor: "#E6E7E9",
      paddingTop: 24,
      paddingHorizontal: 28,
      justifyContent: "flex-start",
    },
    firstName: {
      fontSize: opts.headerFontSize + 9,
      fontWeight: "bold",
      letterSpacing: 3,
      marginBottom: 9,
      lineHeight: 1,
      color: "#0A0F18",
    },
    lastName: {
      fontSize: opts.headerFontSize + 9,
      fontWeight: "bold",
      letterSpacing: 3,
      color: "#02060D",
    },
    orientationText: {
      marginTop: 14,
      fontSize: opts.bodyFontSize + 3,
      color: "#5B6678",
      fontWeight: "medium",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    contentRow: {
      flexDirection: "row",
      width: "100%",
      flex: 1,
    },
    leftColumn: {
      width: leftColumnWidth,
      backgroundColor: accentColor,
      paddingTop: 12,
      paddingLeft: 12,
      paddingRight: 10,
      paddingBottom: 8,
    },
    rightColumn: {
      width: rightColumnWidth,
      backgroundColor: "#ffffff",
      paddingTop: 12,
      paddingHorizontal: 18,
      paddingBottom: 8,
    },
    section: {
      marginBottom: 11,
    },
    leftSection: {
      marginBottom: 18,
    },
    leftSectionTitle: {
      fontSize: opts.bodyFontSize + 4,
      fontWeight: "medium",
      marginBottom: 6,
      letterSpacing: 1,
      color: "#FFFFFF",
      textTransform: "uppercase",
    },
    leftText: {
      fontSize: opts.bodyFontSize,
      marginBottom: 1,
      color: "#D7D8DC",
      lineHeight: 1.28,
    },
    leftMetaContainer: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between"
    },
    leftMetaText: {
      fontSize: opts.bodyFontSize,
      color: "#D7D8DC",
      fontStyle: "italic",
      lineHeight: 1.2,
      marginBottom: 1,
    },
    courseItem: {
      marginBottom: 6,
    },
    languageItem: {
      marginBottom: 4,
    },
    rightSectionTitle: {
      fontSize: opts.bodyFontSize + 4,
      fontWeight: "bold",
      marginBottom: 6,
      letterSpacing: 1,
      color: accentColor,
      textTransform: "uppercase",
    },
    summary: {
      color: "#1C2430",
      lineHeight: 1.35,
      fontSize: opts.bodyFontSize + 1,
      marginBottom: 2,
    },
    entryContainer: {
      marginBottom: 10,
    },
    conteinerExperienceHeader: {
      marginBottom: 2,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    entryTitle: {
      fontSize: opts.bodyFontSize + 4,
      fontWeight: "bold",
      color: "#0A1019",
      maxWidth: "85%",
    },
    entryCompany: {
      fontSize: opts.bodyFontSize + 1,
      color: "#121C2B",
      fontWeight: "medium",
    },
    entryMeta: {
      fontSize: opts.bodyFontSize - 1,
      color: "#5C6778",
    },
    entryLocation: {
      fontSize: opts.bodyFontSize - 1,
      color: "#5C6778",
      marginBottom: 1,
    },
    bulletItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 1,
      marginLeft: 2,
    },
    bulletDot: {
      width: 8,
      fontSize: opts.bodyFontSize + 2,
      lineHeight: 1,
      color: "#1F2A39",
    },
    bulletText: {
      flex: 1,
      fontSize: opts.bodyFontSize + 1,
      lineHeight: 1.28,
      color: "#1F2A39",
    },
  });
};
