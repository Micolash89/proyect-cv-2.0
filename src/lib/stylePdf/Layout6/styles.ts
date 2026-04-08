import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout6Styles = (opts: OptionsPDF) => {
  const pagePaddingX = Math.max(16, Math.round(opts.padding * 0.5));
  const pagePaddingY = Math.max(14, Math.round(opts.padding * 0.4));
  const headerPaddingX = Math.max(10, Math.round(opts.headerPadding * 0.28));
  const headerPaddingY = Math.max(12, Math.round(opts.headerPadding * 0.3));
  const bodySpacing = opts.spaceBetween ? 16 : 12;
  const accentColor = opts.primaryColor || "#2D160C";

  return StyleSheet.create({
    page: {
      fontFamily: opts.fontFamily,
      paddingTop: pagePaddingY,
      paddingHorizontal: pagePaddingX,
      paddingBottom: pagePaddingY,
      lineHeight: 1.42,
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
    },
    headerCenter: {
      width: "78%",
      paddingRight: headerPaddingX,
      justifyContent: "flex-start",
      paddingTop: headerPaddingY,
      paddingBottom: Math.max(8, Math.round(headerPaddingY * 0.75)),
    },
    profileImage: {
      width: 122,
      height: 122,
      objectFit: "cover",
      borderWidth: 1,
      borderColor: accentColor,
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
    },
    contactInfo: {
      marginTop: 10,
      maxWidth: "95%",
    },
    contactRow: {
      flexDirection: "row",
      marginBottom: 2,
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
      flex: 1,
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
      marginTop: 4,
    },
    section: {
      marginBottom: bodySpacing,
      borderTopWidth: 1,
      borderTopColor: accentColor,
      paddingTop: 10,
    },
    sectionTitle: {
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 5,
      marginBottom: 8,
      color: accentColor,
      textTransform: "capitalize",
    },
    summary: {
      fontSize: opts.bodyFontSize,
      color: "#2E211A",
      lineHeight: 1.35,
    },
    skillList: {
      marginTop: 4,
    },
    skillItem: {
      fontSize: opts.bodyFontSize,
      color: "#2E211A",
      lineHeight: 1.32,
      marginBottom: 2,
    },
    timelineContainer: {
      marginTop: 2,
    },
    timelineEntry: {
      flexDirection: "row",
      marginBottom: 8,
      minHeight: 64,
    },
    timelineLeft: {
      width: "16%",
      paddingRight: 8,
    },
    timelineSideTitle: {
      fontSize: opts.bodyFontSize - 1,
      color: "#2B221D",
    },
    timelineSideMeta: {
      fontSize: opts.bodyFontSize - 2,
      color: "#6B625B",
      lineHeight: 1.25,
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
      borderColor: accentColor,
      backgroundColor: "#FFFFFF",
      marginTop: 6,
    },
    timelineLine: {
      position: "absolute",
      width: 1,
      backgroundColor: accentColor,
      top: 15,
      bottom: -12,
    },
    timelineContent: {
      flex: 1,
      paddingLeft: 10,
      paddingBottom: 4,
    },
    timelineTitle: {
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 2,
      color: accentColor,
    },
    timelineSubtitle: {
      color: "#5C514A",
      fontSize: opts.bodyFontSize,
    },
    timelineDescription: {
      marginTop: 3,
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
      minHeight: 44,
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
      borderColor: accentColor,
      backgroundColor: "#FFFFFF",
      marginTop: 5,
    },
    educationLine: {
      position: "absolute",
      width: 1,
      backgroundColor: accentColor,
      top: 15,
      bottom: -10,
    },
    educationTimelineContent: {
      flex: 1,
      paddingLeft: 10,
    },
    educationDate: {
      fontSize: opts.bodyFontSize - 1,
      color: "#6B625B",
      marginBottom: 1,
    },
    educationTitle: {
      fontSize: opts.bodyFontSize + 1,
      fontWeight: "bold",
      color: accentColor,
    },
    educationSubtitle: {
      fontSize: opts.bodyFontSize,
      color: "#4B413A",
    },
    educationLocation: {
      fontSize: opts.bodyFontSize - 1,
      color: "#6B625B",
      marginTop: 1,
    },
    bottomSplit: {
      flexDirection: "row",
      marginTop: 8,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#D8D0CB",
    },
    bottomColumn: {
      flex: 1,
      paddingRight: 18,
    },
    bottomColumnRight: {
      flex: 1,
      paddingLeft: 18,
      borderLeftWidth: 1,
      borderLeftColor: accentColor,
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
