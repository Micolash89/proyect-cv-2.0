import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout0Styles = (opts: OptionsPDF) => {
  const sectionSpacing = opts.spaceBetween ? 12 : 8;
  const accentColor = opts.primaryColor || "#000000";

  return StyleSheet.create({
    page: {
      fontFamily: opts.fontFamily || "Times",
      fontSize: opts.bodyFontSize,
      padding: opts.padding,
      backgroundColor: "#ffffff",
    },
    header: {
      position: "relative",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      borderBottomWidth: 1,
      borderBottomColor: "#222222",
      paddingBottom: 5,
    },
    headerLeft: {
      flex: 1,
    },
    headerInfo: {
      flex: 1,
      // paddingLeft: 72,
    },
    name: {
      fontSize: opts.headerFontSize + 2,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 3,
      color: "#121212",
    },
    contactInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 4,
      marginTop: 2,
      fontSize: opts.bodyFontSize - 1,
      color: "#333333",
    },
    contactItem: {
      color: "#2f2f2f",
    },
    photo: {
      position: "absolute",
      top: -20,
      left: -20,
      width: 60,
      height: 60,
      objectFit: "cover",
      borderWidth: 1,
      borderColor: accentColor,
    },
    section: {
      marginTop: sectionSpacing,
    },
    sectionTitle: {
      fontSize: opts.bodyFontSize + 2,
      textAlign: "center",
      fontWeight: "bold",
      textTransform: "uppercase",
      borderBottomWidth: 1,
      borderBottomColor: accentColor,
      marginBottom: 7,
      paddingBottom: 3,
      color: "#1a1a1a",
    },
    sectionContent: {
      flexDirection: "column",
      gap: 8,
    },
    entryContainer: {
      marginBottom: 10,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 1,
    },
    institution: {
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 1,
      textTransform: "uppercase",
      color: "#1d1d1d",
    },
    location: {
      fontSize: opts.bodyFontSize - 1,
      color: "#2f2f2f",
      fontWeight: "bold",
      fontStyle: "italic",
    },
    degree: {
      fontWeight: "normal",
      fontSize: opts.bodyFontSize,
      color: "#222222",
    },
    dates: {
      fontSize: opts.bodyFontSize - 1,
      color: "#3d3d3d",
      fontStyle: "italic",
      fontWeight: "bold",
    },
    description: {
      marginLeft: 10,
      marginRight: 4,
      marginTop: 3,
      color: "#2a2a2a",
      lineHeight: 1.35,
    },
    skills: {
      // margin: "auto",
      // marginTop: 4,
      display: "flex",
      flexWrap: "wrap",
      flexDirection: "row",
      justifyContent: "center",
      // gap: 6,
      // justifyContent: "center",
      // gap: 4,
    },
    skill: {
      fontSize: opts.bodyFontSize,
      color: "#232323",
    },
    summary: {
      color: "#2f2f2f",
      lineHeight: 0.8,
      textAlign: "justify",
      paddingLeft: 2,
      paddingRight: 2,
      fontStyle: "italic",
      //text balance
      
      // paddingHorizontal: 4,
    },
    additionalInfoItem: {
      fontSize: opts.bodyFontSize,
      color: "#2a2a2a",
      lineHeight: 1,
      marginBottom: 2,
    },
    languageItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    certificationItem: {
      marginBottom: 8,
    },

    certificationItemHeader:{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      // marginBottom: 2,
    },

    certificationTitle: {
      fontSize: opts.bodyFontSize + 1,
      fontWeight: "bold",
      color: "#1d1d1d",
    },
    certificationMeta: {
        fontWeight: "normal",
      fontSize: opts.bodyFontSize,
      color: "#222222",
    },
    bulletItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 2,
      marginLeft: 5,
    },
    bulletDot: {
      width: 8,
      fontSize: opts.bodyFontSize + 2,
      // lineHeight: 1,
      color: "#111111",
    },
    bulletText: {
      // flex: 1,
      fontSize: opts.bodyFontSize,
      // lineHeight: 1.3,
      color: "#2a2a2a",
    },
  });
};
