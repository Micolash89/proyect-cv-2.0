import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout3Styles = (opts: OptionsPDF) => {
  const headerBackground = opts.headerBackground || opts.primaryColor;
  const pageBackground = "#EFF1F4";
  const bodyPaddingX = Math.max(14, Math.round(opts.bodyPadding * 0.45));
  const bodyPaddingY = Math.max(14, Math.round(opts.bodyPadding * 0.4));
  const headerPaddingX = Math.max(16, Math.round(opts.headerPadding * 0.5));
  const headerPaddingY = Math.max(14, Math.round(opts.headerPadding * 0.38));

  return StyleSheet.create({
    page: {
      fontFamily: opts.fontFamily,
      padding: 0,
      backgroundColor: pageBackground,
    },
    topHeader: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: headerBackground,
      paddingHorizontal: headerPaddingX,
      paddingVertical: headerPaddingY,
      minHeight: 120,
    },
    photoFrame: {
      width: 112,
      height: 112,
      borderRadius: 56,
      borderColor: "#D3A15E",
      overflow: "hidden",
      marginRight: 16,
      backgroundColor: "#A47840",
    },
    profileImage: {
      width: 112,
      height: 112,
      objectFit: "cover",
      objectPosition: "center",
    },
    headerTextBlock: {
      flex: 1,
    },
    name: {
      color: "#FFFFFF",
      fontWeight: "bold",
      fontSize: opts.headerFontSize + 2,
      marginBottom: 2,
      letterSpacing: 0.4,
    },
    profession: {
      color: "#DDE4EE",
      fontWeight: "normal",
      fontSize: opts.bodyFontSize + 4,
      textTransform: "lowercase",
    },
    bodyContainer: {
      flexDirection: "row",
      paddingHorizontal: bodyPaddingX-8,
      paddingTop: bodyPaddingY-2,
      paddingBottom: 0,
      marginBottom:0,
    },
    leftColumn: {
      width: "35%",
      paddingRight: 10,
      borderRightWidth: 1.5,
      borderRightColor: "#D4D8E0",
    },
    rightColumn: {
      width: "65%",
      paddingLeft: 10,
    },
    section: {
      marginBottom: 14,
    },
    leftSectionTitle: {
      color: opts.primaryColor,
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 4,
      borderBottomWidth: 1.5,
      borderBottomColor: "#CDD2DB",
      paddingBottom: 4,
      marginBottom: 8,
    },
    leftInfoItem: {
      color: "#5B6576",
      fontSize: opts.bodyFontSize + 1,
      lineHeight: 1.35,

    },
    leftInfoMeta: {
      color: "#7B8698",
      fontSize: opts.bodyFontSize,
      textTransform: "uppercase",
      lineHeight: 1.2,
      marginBottom: 2,
    },
    leftBulletItem: {
      color: "#5B6576",
      fontSize: opts.bodyFontSize + 1,
      lineHeight: 1.3,
      marginBottom: 2,
    },
    languageItem: {
      marginBottom: 4,
    },
    sectionTitle: {
      color: opts.primaryColor,
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 5,
      borderBottomWidth: 1.5,
      borderBottomColor: "#CDD2DB",
      paddingBottom: 4,
      marginBottom: 8,
    },
    summary: {
      color: "#3D4A60",
      lineHeight: 1.45,
      fontSize: opts.bodyFontSize + 1,
    },
    entryContainer: {
      marginBottom: 11,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 1,
    },
    institution: {
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 3,
      color: "#121827",
      maxWidth: "70%",
    },
    degree: {
      color: "#2C3648",
      fontSize: opts.bodyFontSize + 2,
      fontStyle: "italic",
      marginBottom: 1,
    },
    location: {
      color: "#5D6779",
      fontSize: opts.bodyFontSize + 1,
      marginBottom: 2,
    },
    dates: {
      fontSize: opts.bodyFontSize + 1,
      color: "#7A8699",
      textAlign: "right",
    },
    bulletItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 1,
      marginLeft: 2,
    },
    bulletDot: {
      width: 8,
      color: "#2D3748",
      fontSize: opts.bodyFontSize + 2,
      lineHeight: 1,
    },
    bulletText: {
      flex: 1,
      color: "#2C3648",
      fontSize: opts.bodyFontSize + 1,
      lineHeight: 1.32,
    },
    certificationMeta: {
      color: "#4B586F",
      fontSize: opts.bodyFontSize + 1,
    },
  });
};
