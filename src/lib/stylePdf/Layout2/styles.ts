import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout2Styles = (opts: OptionsPDF) => {
  const sidebarBackground = opts.headerBackground || opts.primaryColor;

  const colorOptionColor = sidebarBackground==="#F3F2E3" ? "black" : "white"

  return StyleSheet.create({
    page: {
      fontFamily: opts.fontFamily,
      flexDirection: "row",
      backgroundColor: "#F3F4F6",
    },
    leftColumn: {
      width: "29%",
      color: "white",
      paddingVertical: 18,
      paddingHorizontal: 8,
      backgroundColor: sidebarBackground,
    },
    rightColumn: {
      width: "71%",
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 10,
      flexDirection: "column",
      display: "flex",
    },
    profileImageWrapper: {
      alignItems: "center",
      marginBottom: 12,
    },
    profileImage: {
      borderRadius: 56,
      marginBottom: 16,
      objectFit: "cover",
      alignSelf: "center",
      width: 112,
      height: 112,
      borderWidth: 3,
      borderColor: "#D4A45D",
    },
    name: {
      fontWeight: "bold",
      fontSize: opts.headerFontSize,
      textAlign: "center",
      marginBottom: 2,
      color:  colorOptionColor,
    },
    sidebarContactGroup: {
      marginTop: 8,
      marginBottom: 8,
    },
    profession: {
      textAlign: "center",
      fontSize: opts.bodyFontSize + 2,
      marginBottom: 10,
      color:  colorOptionColor,
      textTransform: "lowercase",
    },
    contactItem: {
      fontSize: opts.bodyFontSize - 1,
      color:  colorOptionColor,
      marginBottom: 3,
    },
    sidebarSection: {
      marginTop: 10,
    },
      sidebarSectionTitle: {
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 4,
      color:  colorOptionColor,
      borderBottomWidth: 1,
      borderBottomColor:  colorOptionColor,
      paddingBottom: 4,
      marginBottom: 8,
    },
    sidebarListItem: {
      fontSize: opts.bodyFontSize,
      color:  colorOptionColor,
      marginBottom: 3,
      lineHeight: 1.3,
    },
    skillPill: {
      alignSelf: "flex-start",
      backgroundColor: colorOptionColor,
      color:  "#ffffff",
      borderRadius: 9,
      fontSize: opts.bodyFontSize - 2,
      paddingHorizontal: 7,
      paddingVertical: 3,
      marginBottom: 5,
    },
    sectionTitle: {
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 3,
      marginTop: 0,
      marginBottom: 8,
      paddingBottom: 4,
      color: "#5E6470",
      borderBottomWidth: 1,
      borderBottomColor: "#C7CDD6",
    },
    entryContainer: {
      marginBottom: 11,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 1,
    },
    entryMeta: {
      alignItems: "flex-end",
    },
    institution: {
      fontWeight: "bold",
      fontSize: opts.bodyFontSize + 1,
      color: "#121212",
      maxWidth: "58%",
    },
    location: {
      color: "#748092",
      fontSize: opts.bodyFontSize - 1,
    },
    entryHeaderDegre:{
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    degree: {
      fontStyle: "italic",
      fontSize: opts.bodyFontSize,
      color: "#1D1D1D",
    },
    dates: {
      color: "#748092",
      fontSize: opts.bodyFontSize - 1,
    },
    description: {
      marginLeft: 10,
      marginTop: 4,
      color: "#4A5568",
      lineHeight: 1.4,
    },
    bulletItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 2,
      marginLeft: 6,
    },
    bulletDot: {
      width: 8,
      fontSize: opts.bodyFontSize + 2,
      lineHeight: 1,
      color: "#111111",
    },
    bulletText: {
      flex: 1,
      fontSize: opts.bodyFontSize,
      lineHeight: 1.3,
      color: "#1F1F1F",
      maxWidth: "94%",
    },
    summary: {
      color: "#0F1115",
      lineHeight: 1.35,
      marginBottom: 5,
      fontSize: opts.bodyFontSize + 2,
      textAlign: "justify",
      wordBreak: "break-word",
      paddingHorizontal: 10,
    },
    section: {
      marginBottom: 10,
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
    contactInfo: {
      marginBottom: 10,
    },
    header: {
      marginBottom: 15,
      borderBottomWidth: 2,
      borderBottomColor: opts.primaryColor,
      paddingBottom: 10,
    },
    photoContainer: {
      position: "absolute",
      top: 20,
      right: 30,
    },
    photo: {
      width: 70,
      height: 70,
      borderRadius: 35,
      objectFit: "cover",
    },
  });
};
