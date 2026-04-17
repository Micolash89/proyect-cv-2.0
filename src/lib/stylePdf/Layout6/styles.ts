import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout6Styles = (opts: OptionsPDF) => {
  const pagePaddingX = Math.max(16, Math.round(opts.padding * 0.5));
  const pagePaddingY = Math.max(14, Math.round(opts.padding * 0.4));
  const accentColor = opts.primaryColor || "#2D160C";

  return StyleSheet.create({
    page: {
      fontFamily: opts.fontFamily,
      paddingTop: pagePaddingY,
      paddingHorizontal: pagePaddingX,
      paddingBottom: 0,
      lineHeight: 0,
      backgroundColor: "#FFFFFF",
    },
    header: {
      flexDirection: "row",
      alignItems: "stretch",
      marginBottom: 14,
    },
    headerLeft: {
      width: "22%",
      paddingRight: 12,
      marginRight: 20,
    },
    headerCenter: {
      width: "78%",
      paddingRight: 0,
      justifyContent: "space-between",
      paddingTop: 0,
    },
    profileImage: {
      width: 122,
      height: 122,
      objectFit: "cover",
      borderWidth: 1,
      borderColor: "#a0a0a0",
      alignSelf: "flex-start",
    },
    profileImageFallback: {
      width: 122,
      height: 122,
      backgroundColor: "#F0F0F0",
      borderWidth: 1,
      borderColor: accentColor,
    },
    name: {
      fontWeight: "bold",
      fontSize: opts.headerFontSize + 5,
      letterSpacing: 0.4,
      color: accentColor,
      lineHeight: 0,
    },
    contactInfo: {
      marginTop: 10,
      lineHeight: 0.9,
      maxWidth: "95%",
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 6,
    },
    contactLabel: {
      fontWeight: "bold",
      color: accentColor,
      fontSize: opts.bodyFontSize - 1,
      width: 72,
    },
    contactValue: {
      fontSize: opts.bodyFontSize,
      color: "#20120B",
    },
    headerNote: {
      fontSize: opts.bodyFontSize + 2,
      color: "#6B625B",
      fontStyle: "italic",
      lineHeight: 1.35,
      textAlign: "left",
    },
    orientationText: {
      marginTop: 8,
      fontSize: opts.bodyFontSize + 2,
      color: "#6B625B",
      fontStyle: "italic",
      letterSpacing: 0.2,
    },
    mainContent: {
    },
    section: {
      marginBottom: 16,
      borderTopWidth: 1.5,
      borderTopColor: "#a0a0a0",
      paddingTop: 10,
    },
    sectionTitle: {
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 5,
      color: accentColor,
      marginBottom: 5,
    },
    summary: {
      fontSize: opts.bodyFontSize,
      color: "#2E211A",
      lineHeight: 1.50,
      textAlign: "justify",
    },
    courseList: {
      marginTop: 2,
    },
    courseItem: {
    },
    courseTitle: {
      fontSize: opts.bodyFontSize + 1,
      fontWeight: "bold",
      color: accentColor,
    },
    courseMeta: {
      fontSize: opts.bodyFontSize,
      color: "#5C514A",
    },
    skillList: {
      marginTop: 4,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    skillItem: {
      fontSize: opts.bodyFontSize,
      color: "#2E211A",
      lineHeight: 1.32,
      marginBottom: 2,
    },
    skillBullet: {
      color: "#a0a0a0",
    },
    timelineContainer: {
      marginTop: 2,
    },
    timelineEntry: {
      flexDirection: "row",
      marginBottom: 8,
    },
    timelineLeft: {
      width: "16%",
      paddingRight: 8,
    },
    timelineSideTitle: {
      fontSize: opts.bodyFontSize - 1,
      color: "#6B625B",
      lineHeight: 0,
      paddingTop: 2,
    },
    timelineSideMeta: {
      fontSize: opts.bodyFontSize - 2,
      color: "#6B625B",
      lineHeight: 0.9,
    },
    timelineRail: {
      width: "6%",
      alignItems: "center",
      position: "relative",
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: "#a0a0a0",
      backgroundColor: "#FFFFFF",
      marginTop: 6,
    },
    timelineLine: {
      position: "absolute",
      width: 1,
      backgroundColor: "#a0a0a0",
      top: 15,
      bottom: -20,
    },
    timelineContent: {
      flex: 1,
      paddingLeft: 10,
    },
    timelineHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    timelineTitle: {
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 2,
      color: accentColor,
      lineHeight: 0,
    },
    timelineSubtitle: {
      color: "#5C514A",
      fontSize: opts.bodyFontSize,
      fontWeight: "normal",
      paddingTop: 2,
      lineHeight: 0,
    },
    timelineDescription: {
      marginTop: 6,
      color: "#2E211A",
      fontSize: opts.bodyFontSize,
      lineHeight: 1.38,
    },
    educationTimeline: {
      marginTop: 2,
    },
    educationTimelineEntry: {
      flexDirection: "row",
      marginBottom: 8,
    },
    educationTimelineLeft: {
      width: "15%",
      paddingRight: 8,
    },
    educationTimelineRail: {
      width: "6%",
      alignItems: "center",
      position: "relative",
    },
    educationDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: "#a0a0a0",
      backgroundColor: "#FFFFFF",
      marginTop: 6,
    },
    educationLine: {
      position: "absolute",
      width: 1,
      backgroundColor: "#a0a0a0",
      top: 15,
      bottom: -20,
    },
    educationTimelineContent: {
      flex: 1,
      paddingLeft: 10,
    },
      educationConteiner: {
        lineHeight: 0,
      },
    educationDate: {
      fontSize: opts.bodyFontSize - 1,
      color: "#6B625B",
      marginBottom: 1,
      lineHeight: 0,
      paddingTop: 2,
    },
    educationTitle: {
      fontSize: opts.bodyFontSize + 1,
      fontWeight: "bold",
      color: accentColor,
    },
    educationSubtitle: {
      fontSize: opts.bodyFontSize,
      color: "#4B413A",
      fontWeight: "normal",
    },
    educationLocation: {
      fontSize: opts.bodyFontSize - 1,
      color: "#6B625B",
      lineHeight: 0,
    },
    bottomSplit: {
      flexDirection: "row",
      paddingTop: 10,
      borderTopWidth: 1.5,
      borderTopColor: "#a0a0a0",
    },
    bottomColumn: {
      flex: 1,
      paddingRight: 18,
    },
    bottomColumnRight: {
      flex: 1,
      paddingLeft: 18,
      borderLeftWidth: 1.5,
      borderLeftColor: "#a0a0a0",
    },
    languageItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    languageName: {
      fontSize: opts.bodyFontSize,
      color: accentColor,
    },
    languageLevel: {
      color: "#6B625B",
      fontSize: opts.bodyFontSize - 1,
    },
    additionalText: {
      fontSize: opts.bodyFontSize,
      color: "#2E211A",
      lineHeight: 1.35,
    },
  });
};
