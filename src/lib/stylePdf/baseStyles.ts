import { StyleSheet } from "@react-pdf/renderer";

export const createBaseStyles = (primaryColor: string, fontSize: number = 10) => {
  return StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: "Helvetica",
      fontSize: fontSize,
      color: "#1a1a1a",
      backgroundColor: "#ffffff",
    },
    header: {
      marginBottom: 15,
    },
    name: {
      fontSize: fontSize * 2.2,
      fontWeight: 700,
      color: primaryColor,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: fontSize + 1,
      color: "#666666",
      marginBottom: 8,
    },
    contactInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 6,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      fontSize: fontSize - 0.5,
      color: "#555555",
    },
    section: {
      marginTop: 12,
    },
    sectionTitle: {
      fontSize: fontSize + 2.5,
      fontWeight: 700,
      color: primaryColor,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottomWidth: 1.5,
      borderBottomColor: primaryColor,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    sectionContent: {
      flexDirection: "column",
      gap: 10,
    },
    entryContainer: {
      marginBottom: 8,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    jobTitle: {
      fontWeight: 600,
      fontSize: fontSize + 0.5,
      color: "#1a1a1a",
    },
    company: {
      color: "#555555",
      fontSize: fontSize,
    },
    date: {
      fontSize: fontSize - 0.5,
      color: "#666666",
      fontStyle: "italic",
    },
    location: {
      fontSize: fontSize - 0.5,
      color: "#666666",
    },
    description: {
      marginTop: 4,
      color: "#444444",
      lineHeight: 1.4,
      textAlign: "justify",
    },
    skills: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    skill: {
      backgroundColor: "#f3f4f6",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 4,
      fontSize: fontSize - 0.5,
      color: "#374151",
    },
    degree: {
      fontWeight: 600,
      fontSize: fontSize + 0.5,
    },
    institution: {
      color: "#555555",
      fontSize: fontSize,
    },
    summary: {
      color: "#444444",
      lineHeight: 1.5,
      textAlign: "justify",
    },
    languageItem: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    photo: {
      width: 65,
      height: 65,
      borderRadius: 32,
      objectFit: "cover",
    },
    photoSquare: {
      width: 60,
      height: 60,
      objectFit: "cover",
    },
  });
};

export const COLORS = {
  primary: "#1e3a5f",
  secondary: "#4f46e5",
  accent: "#ec4899",
  background: "#ffffff",
  text: {
    primary: "#1a1a1a",
    secondary: "#555555",
    light: "#666666",
  },
  border: "#e5e7eb",
  skillBg: "#f3f4f6",
};
