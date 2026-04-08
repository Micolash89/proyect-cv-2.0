import { StyleSheet } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

export const createLayout4Styles = (opts: OptionsPDF) => {
  const bodyPaddingX = Math.max(16, Math.round(opts.bodyPadding * 0.45));
  const bodyPaddingY = Math.max(12, Math.round(opts.bodyPadding * 0.35));
  const headerPadding = Math.max(12, Math.round(opts.headerPadding * 0.35));
  const accentColor = opts.primaryColor || "#172538";

  return StyleSheet.create({
    page: {
      fontFamily: opts.fontFamily,
      paddingHorizontal: bodyPaddingX,
      paddingTop: bodyPaddingY,
      paddingBottom: bodyPaddingY,
      backgroundColor: "#F4F4F4",
    },
    container: {
      flexDirection: "row",
      flex: 1,
    },
    leftColumn: {
      width: "35%",
      paddingRight: 20,
      borderRightWidth: 1,
      borderRightColor: "#D8D8D8",
      paddingTop: headerPadding,
    },
    rightColumn: {
      width: "65%",
      paddingLeft: 20,
      paddingTop: headerPadding,
    },
    photoWrap: {
      marginBottom: 16,
      alignItems: "center",
    },
    profileImage: {
      borderRadius: 52,
      height: 104,
      width: 104,
      alignSelf: "flex-start",
      objectFit: "cover",
    },
    leftSectionTitle: {
      fontSize: opts.bodyFontSize + 5,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginBottom: 8,
      color: accentColor,
      borderBottomWidth: 1,
      borderBottomColor: "#D6D6D6",
      paddingBottom: 4,
      fontWeight: "medium",
    },
    leftText: {
      fontSize: opts.bodyFontSize + 1,
      marginBottom: 2,
      color: "#2F3B4A",
      lineHeight: 1.3,
    },
    leftMeta: {
      fontSize: opts.bodyFontSize,
      color: "#657184",
      marginBottom: 2,
    },
    leftItemGroup: {
      marginBottom: 6,
    },
    leftItemTitle: {
      fontWeight: "medium",
      color: "#1C2736",
      fontSize: opts.bodyFontSize + 1,
      lineHeight: 1.25,
    },
    leftBulletItem: {
      fontSize: opts.bodyFontSize + 1,
      marginBottom: 2,
      color: "#2F3B4A",
      lineHeight: 1.3,
    },
    nameHeader: {
      marginBottom: 8,
      paddingBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: "#D9D9D9",
      position: "relative",
      minHeight: 72,
      justifyContent: "flex-start",
    },
    name: {
      fontSize: opts.headerFontSize + 8,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: accentColor,
      fontWeight: "medium",
    },
    watermarkSurname: {
      position: "absolute",
      right: 6,
      top: -2,
      fontFamily: "Quensialy",
      fontSize: opts.headerFontSize + 42,
      color: "#C7C7C7",
    },
    section: {
      marginTop: 12,
    },
    sectionTitle: {
      fontSize: opts.bodyFontSize + 5,
      letterSpacing: 1.3,
      textTransform: "uppercase",
      marginBottom: 8,
      color: accentColor,
      borderBottomWidth: 1,
      borderBottomColor: "#D6D6D6",
      paddingBottom: 4,
      fontWeight: "medium",
    },
    entryContainer: {
      marginBottom: 12,
    },
    entryTitle: {
      fontSize: opts.bodyFontSize + 4,
      color: "#1D2738",
      fontWeight: "medium",
      marginBottom: 1,
    },
    entrySubtitle: {
      fontWeight: "medium",
      fontSize: opts.bodyFontSize + 2,
      color: "#273549",
      marginBottom: 1,
    },
    entryMeta: {
      fontSize: opts.bodyFontSize + 1,
      color: "#687488",
      marginBottom: 2,
    },
    bulletItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginLeft: 2,
      marginBottom: 1,
    },
    bulletDot: {
      width: 8,
      fontSize: opts.bodyFontSize + 2,
      lineHeight: 1,
      color: "#29384B",
    },
    bulletText: {
      flex: 1,
      fontSize: opts.bodyFontSize + 1,
      color: "#29384B",
      lineHeight: 1.32,
    },
    summary: {
      color: "#2F3B4A",
      lineHeight: 1.35,
      fontSize: opts.bodyFontSize + 1,
      marginBottom: 8,
    },
  });
};
