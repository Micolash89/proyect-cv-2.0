import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout1Styles = (opts: OptionsPDF) => {
  const sidebarPaddingX = Math.max(14, Math.round(opts.headerPadding * 0.45));
  const sidebarPaddingY = Math.max(18, Math.round(opts.headerPadding * 0.5));
  const mainPaddingX = Math.max(18, Math.round(opts.bodyPadding * 0.5));
  const mainPaddingY = Math.max(18, Math.round(opts.bodyPadding * 0.45));
  const sectionSpacing = opts.spaceBetween ? 16 : 12;
  const sidebarBackground = opts.headerBackground || opts.primaryColor;

  return StyleSheet.create({
    page: {
      fontFamily: opts.fontFamily,
      padding: 0,
      backgroundColor: "#FFFFFF",
    },
    container: {
      flexDirection: "row",
      minHeight: "100%",
    },
    sidebar: {
      width: "29%",
      color: "#FFFFFF",
      paddingHorizontal: sidebarPaddingX,
      paddingTop: sidebarPaddingY,
      paddingBottom: sidebarPaddingY,
      backgroundColor: sidebarBackground,
      justifyContent: "flex-start",
    },
    mainContent: {
      width: "71%",
      paddingHorizontal: mainPaddingX,
      paddingTop: mainPaddingY,
      paddingBottom: mainPaddingY,
      display: "flex",
      flexDirection: "column",
    },
    profileImage: {
      width: 110,
      height: 110,
      borderRadius: 60,
      objectFit: "cover",
      marginBottom: 14,
      alignSelf: "center",
      borderWidth: 4,
      borderColor: "#D8A95B",
    },
    sidebarName: {
      fontSize: Math.max(opts.headerFontSize, 22),
      fontWeight: "bold",
      textTransform: "uppercase",
      color: "#FFFFFF",
      textAlign: "center",
      lineHeight: 1.02,
    },
    profession: {
      textAlign: "center",
      fontSize: opts.bodyFontSize + 1,
      color: "#FFFFFF",
      marginTop: 8,
      marginBottom: 16,
      textTransform: "lowercase",
    },
    sidebarContact: {
      marginTop: 6,
      marginBottom: 8,
    },
    sidebarContactItem: {
      color: "#FFFFFF",
      fontSize: opts.bodyFontSize - 1,
      lineHeight: 1.35,
      marginBottom: 3,
    },
    sidebarSectionTitle: {
      fontSize: opts.bodyFontSize + 2,
      fontWeight: "bold",
      color: "#FFFFFF",//si es rosa ponerlo en gris claro.
      marginTop: 14,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#FFFFFF",
      paddingBottom: 4,
    },
    skillItem: {
      color: "#FFFFFF",
      fontSize: opts.bodyFontSize - 1,
      marginBottom: 4,
      lineHeight: 1.35,
    },
    additionalInfoItem: {
      color: "#FFFFFF",
      fontSize: opts.bodyFontSize - 1,
      marginBottom: 4,
      lineHeight: 1.35,
    },
    section: {
      marginBottom: sectionSpacing,
    },
    sectionTitle: {
      fontSize: opts.bodyFontSize + 4,
      fontWeight: "bold",
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#D7DADF",
      paddingBottom: 4,
      color: "#163A67",
    },
    entryContainer: {
      marginBottom: 10,
    },
    companyName: {
      fontSize: opts.bodyFontSize + 1,
      fontWeight: "bold",
      color: "#24364A",
    },
    jobTitle: {
      fontSize: opts.bodyFontSize,
      fontWeight: "bold",
      color: "#31475C",
      marginBottom: 1,
    },
    dateLocation: {
      fontSize: opts.bodyFontSize - 1,
      color: "#70829A",
      marginBottom: 2,
    },
    description: {
      fontSize: opts.bodyFontSize,
      color: "#3F4B5A",
      lineHeight: 1.4,
      marginTop: 4,
    },
    degree: {
      fontSize: opts.bodyFontSize,
      fontWeight: "bold",
      color: "#31475C",
    },
    institution: {
      fontSize: opts.bodyFontSize - 1,
      color: "#56657A",
    },
    summary: {
      fontSize: opts.bodyFontSize + 1,
      color: "#3F4B5A",
      lineHeight: 1.4,
      marginBottom: 10,
    },
    additionalInfo: {
      color: "#FFFFFF",
      fontSize: opts.bodyFontSize - 1,
      marginBottom: 4,
      lineHeight: 1.35,
    },
    certificationItem: {
      marginBottom: 8,
    },
    certificationName: {
      fontSize: opts.bodyFontSize,
      color: "#24364A",
      fontWeight: "bold",
    },
    certificationIssuer: {
      fontSize: opts.bodyFontSize - 1,
      color: "#56657A",
    },
    certificationDate: {
      fontSize: opts.bodyFontSize - 1,
      color: "#70829A",
    },
  });
};
