import { StyleSheet, Font } from "@react-pdf/renderer";
import { OptionsPDF } from "../definitions";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf" },
    { src: "/fonts/Roboto-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: "bold" },
  ],
});

export const createLayout2Styles = (opts: OptionsPDF) => {
  return StyleSheet.create({
    page: {
      fontFamily: "Roboto",
      flexDirection: "row",
    },
    leftColumn: {
      width: "30%",
      color: "white",
      paddingVertical: 20,
      paddingHorizontal: 10,
      backgroundColor: opts.primaryColor,
    },
    rightColumn: {
      width: "70%",
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 0,
      flexDirection: "column",
      display: "flex",
    },
    profileImage: {
      borderRadius: 50,
      marginBottom: 20,
      objectFit: "cover",
      alignSelf: "center",
      width: 100,
      height: 100,
    },
    name: {
      fontWeight: 700,
      fontSize: opts.headerFontSize,
      textAlign: "center",
      marginBottom: 5,
      color: "#FFFFFF",
    },
    contactInfo: {
      marginBottom: 10,
    },
    profession: {
      textAlign: "center",
      fontSize: opts.bodyFontSize + 2,
      marginBottom: 5,
      color: "#FFFFFF",
    },
    contactItem: {
      fontSize: opts.bodyFontSize - 1,
      color: "#FFFFFF",
      marginBottom: 3,
    },
    sectionTitle: {
      fontWeight: 700,
      fontSize: opts.bodyFontSize + 3,
      marginTop: 15,
      marginBottom: 10,
      paddingBottom: 5,
      color: opts.primaryColor,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
    },
    entryContainer: {
      marginBottom: 7,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    institution: {
      fontWeight: 700,
      fontSize: opts.bodyFontSize + 1,
    },
    location: {
      color: "#7F8C8D",
      fontSize: opts.bodyFontSize - 1,
    },
    degree: {
      fontStyle: "italic",
      fontSize: opts.bodyFontSize,
    },
    dates: {
      color: "#7F8C8D",
      fontSize: opts.bodyFontSize - 1,
    },
    description: {
      marginLeft: 10,
      marginTop: 4,
      color: "#4A5568",
      lineHeight: 1.4,
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
    summary: {
      color: "#4A5568",
      lineHeight: 1.5,
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
    section: {
      marginTop: 12,
    },
  });
};
