import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout6Styles = (opts: OptionsPDF) => {
  return StyleSheet.create({
    page: {
      fontFamily: "Inter",
      paddingTop: 10,
      paddingHorizontal: 20,
      lineHeight: 1.5,
    },
    header: {
      flexDirection: "row",
    },
    headerColumn: {
      display: "flex",
      width: "75%",
      flexDirection: "column",
      justifyContent: "flex-start",
    },
    headerLeft: {
      width: "25%",
      alignSelf: "center",
    },
    headerCenter: {
      width: "50%",
    },
    headerRight: {
      width: "50%",
    },
    profileImage: {
      width: 100,
      height: 130,
      objectFit: "cover",
      borderWidth: 1,
      borderColor: "#EAEAEA",
    },
    name: {
      fontWeight: 700,
      fontSize: opts.headerFontSize,
    },
    contactInfo: {
      display: "flex",
      flexDirection: "row",
      gap: 15,
      marginTop: 5,
    },
    mainContent: {
      marginTop: 10,
    },
    contactLabel: {
      fontWeight: 500,
      color: "#666666",
      fontSize: opts.bodyFontSize - 1,
    },
    contactValue: {
      marginBottom: 5,
      fontSize: opts.bodyFontSize - 1,
    },
    sectionTitle: {
      fontWeight: 700,
      fontSize: opts.bodyFontSize + 3,
      marginTop: 15,
      paddingTop: 5,
      borderTopWidth: 1,
      borderTopColor: "#EAEAEA",
      color: "#333333",
    },
    content: {
      display: "flex",
      flexDirection: "column",
    },
    profileText: {
      color: "#333333",
      textAlign: "justify",
      fontSize: opts.bodyFontSize,
      lineHeight: 1.5,
    },
    timelineContainer: {},
    timelineEntry: {
      flexDirection: "row",
    },
    timelineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#EAEAEA",
      borderWidth: 1,
      borderColor: "#EAEAEA",
      marginRight: 15,
      marginTop: 4,
      zIndex: 1,
    },
    timelineContent: {
      flex: 1,
      borderLeftWidth: 1,
      borderLeftColor: "#EAEAEA",
      paddingLeft: 15,
      marginLeft: -19,
      paddingBottom: 15,
      zIndex: 1,
    },
    timelineTitle: {
      fontWeight: 700,
      fontSize: opts.bodyFontSize + 1,
      color: "#333333",
    },
    timelineSubtitle: {
      color: "#666666",
      fontSize: opts.bodyFontSize,
    },
    timelineDate: {
      color: "#666666",
      fontSize: opts.bodyFontSize - 1,
    },
    timelineDescription: {
      marginTop: 4,
      color: "#333333",
      fontSize: opts.bodyFontSize,
      lineHeight: 1.4,
    },
    skills: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      textAlign: "center",
      marginTop: 10,
      gap: 8,
    },
    skill: {
      backgroundColor: "#f3f4f6",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      fontSize: opts.bodyFontSize - 1,
      color: "#374151",
    },
    twoColumnSection: {
      flexDirection: "row",
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#EAEAEA",
    },
    column: {
      flex: 1,
      paddingRight: 20,
    },
    languageItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
    },
    languageName: {
      fontSize: opts.bodyFontSize,
    },
    languageLevel: {
      color: "#666666",
      fontSize: opts.bodyFontSize - 1,
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
    degree: {
      fontSize: opts.bodyFontSize,
      color: "#444444",
    },
    dates: {
      fontSize: opts.bodyFontSize - 1,
      color: "#666666",
    },
    description: {
      marginTop: 4,
      color: "#333333",
      lineHeight: 1.4,
      fontSize: opts.bodyFontSize,
    },
    summary: {
      color: "#333333",
      lineHeight: 1.5,
      fontSize: opts.bodyFontSize,
    },
    section: { marginBottom: 15 },
  });
};
