import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2", fontWeight: 700 },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2", fontWeight: 400 },
  ],
});

interface CVData {
  _id: string;
  phone: string;
  fullName: string;
  email: string;
  photo?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  experience: any[];
  education: any[];
  skills: string[];
  languages: any[];
  projects?: any[];
  certifications?: any[];
  selectedTemplate: string;
  templateSettings: any;
}

const createStyles = (
  primaryColor: string,
  fontSize: string,
  padding: number,
  margin: number,
  templateType: string
) => {
  const sizes = { small: 8, medium: 9.5, large: 11 };
  const size = sizes[fontSize as keyof typeof sizes] || 9.5;

  const baseStyles = {
    page: {
      padding: padding,
      margin: margin,
      fontFamily: "Helvetica",
      fontSize: size,
      color: "#1a1a1a",
      backgroundColor: "#fff",
    },
    header: {
      marginBottom: 15,
    },
    name: {
      fontSize: size * 2.2,
      fontWeight: 700 as const,
      color: primaryColor,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: size + 1,
      color: "#666",
      marginBottom: 8,
    },
    contactInfo: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: 12,
      marginTop: 6,
    },
    contactItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 4,
      fontSize: size - 0.5,
      color: "#555",
    },
    section: {
      marginTop: 12,
    },
    sectionTitle: {
      fontSize: size + 2.5,
      fontWeight: 700 as const,
      color: primaryColor,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottomWidth: 1.5,
      borderBottomColor: primaryColor,
      textTransform: "uppercase" as const,
      letterSpacing: 1,
    },
    sectionContent: {
      flexDirection: "column" as const,
      gap: 10,
    },
    entryContainer: {
      marginBottom: 8,
    },
    entryHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      marginBottom: 2,
    },
    jobTitle: {
      fontWeight: 600 as const,
      fontSize: size + 0.5,
      color: "#1a1a1a",
    },
    company: {
      color: "#555",
      fontSize: size,
    },
    date: {
      fontSize: size - 0.5,
      color: "#666",
      fontStyle: "italic" as const,
    },
    description: {
      marginTop: 4,
      color: "#444",
      lineHeight: 1.4,
      textAlign: "justify" as const,
    },
    skills: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: 6,
    },
    skill: {
      backgroundColor: "#f3f4f6",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 4,
      fontSize: size - 0.5,
      color: "#374151",
    },
    degree: {
      fontWeight: 600 as const,
      fontSize: size + 0.5,
    },
    institution: {
      color: "#555",
      fontSize: size,
    },
    summary: {
      color: "#444",
      lineHeight: 1.5,
      textAlign: "justify" as const,
    },
    languageItem: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
    },
    photo: {
      width: 65,
      height: 65,
      borderRadius: 32,
      objectFit: "cover" as const,
    },
    headerRow: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
    },
  };

  // Template-specific styles
  if (templateType === "harvard") {
    return StyleSheet.create({
      ...baseStyles,
      page: {
        ...baseStyles.page,
        paddingTop: padding * 2,
        paddingLeft: padding * 2,
        paddingRight: padding * 2,
        paddingBottom: padding,
      },
      header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: primaryColor,
        paddingBottom: 10,
      },
      name: {
        ...baseStyles.name,
        fontSize: size * 2.5,
      },
    });
  }

  if (templateType === "modern") {
    return StyleSheet.create({
      ...baseStyles,
      page: {
        ...baseStyles.page,
        padding: 0,
      },
      header: {
        backgroundColor: primaryColor,
        padding: padding * 2,
        marginBottom: 0,
      },
      name: {
        ...baseStyles.name,
        color: "#fff",
      },
      subtitle: {
        ...baseStyles.subtitle,
        color: "rgba(255,255,255,0.9)",
      },
      contactItem: {
        ...baseStyles.contactItem,
        color: "rgba(255,255,255,0.9)",
      },
      sectionTitle: {
        ...baseStyles.sectionTitle,
        color: primaryColor,
        backgroundColor: "rgba(0,0,0,0.03)",
        padding: 8,
        marginBottom: 10,
        borderBottom: "none",
      },
    });
  }

  if (templateType === "classic") {
    return StyleSheet.create({
      ...baseStyles,
      name: {
        ...baseStyles.name,
        fontSize: size * 2.8,
        textAlign: "center" as const,
      },
      header: {
        marginBottom: 20,
        alignItems: "center" as const,
      },
      contactInfo: {
        justifyContent: "center" as const,
      },
      sectionTitle: {
        ...baseStyles.sectionTitle,
        textAlign: "center" as const,
      },
    });
  }

  if (templateType === "minimal") {
    return StyleSheet.create({
      ...baseStyles,
      page: {
        ...baseStyles.page,
        padding: padding * 3,
      },
      sectionTitle: {
        ...baseStyles.sectionTitle,
        fontSize: size + 1,
        borderBottomWidth: 0,
        paddingBottom: 0,
        marginBottom: 12,
      },
    });
  }

  return StyleSheet.create(baseStyles);
};

interface CVTemplateProps {
  user: CVData;
}

export function CVTemplate({ user }: CVTemplateProps) {
  const { templateSettings, selectedTemplate } = user;
  const templateType = selectedTemplate || "harvard";
  
  const styles = createStyles(
    templateSettings.primaryColor || "#1e3a8a",
    templateSettings.fontSize || "medium",
    templateSettings.padding || 25,
    templateSettings.margin || 10,
    templateType
  );

  const sortedExperience = [...user.experience].sort((a, b) => {
    if (templateSettings.layout === "ascending") {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  const sortedEducation = [...user.education].sort((a, b) => {
    if (templateSettings.layout === "ascending") {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  const formatDate = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {templateType === "modern" ? (
        <>
          <Text style={styles.name}>{user.fullName}</Text>
          {user.location && <Text style={styles.subtitle}>{user.location}</Text>}
          <View style={styles.contactInfo}>
            {user.email && (
              <Text style={styles.contactItem}>✉ {user.email}</Text>
            )}
            {user.phone && (
              <Text style={styles.contactItem}>☎ {user.phone}</Text>
            )}
            {user.linkedin && (
              <Text style={styles.contactItem}>🔗 {user.linkedin}</Text>
            )}
          </View>
        </>
      ) : templateType === "classic" ? (
        <>
          <Text style={styles.name}>{user.fullName}</Text>
          <View style={styles.contactInfo}>
            {user.email && <Text style={styles.contactItem}>{user.email}</Text>}
            {user.phone && <Text style={styles.contactItem}>{user.phone}</Text>}
            {user.location && <Text style={styles.contactItem}>{user.location}</Text>}
            {user.linkedin && <Text style={styles.contactItem}>{user.linkedin}</Text>}
          </View>
        </>
      ) : (
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.fullName}</Text>
            <View style={styles.contactInfo}>
              {user.email && <Text style={styles.contactItem}>{user.email}</Text>}
              {user.phone && <Text style={styles.contactItem}>{user.phone}</Text>}
              {user.location && <Text style={styles.contactItem}>{user.location}</Text>}
              {user.linkedin && <Text style={styles.contactItem}>{user.linkedin}</Text>}
              {user.github && <Text style={styles.contactItem}>{user.github}</Text>}
            </View>
          </View>
          {user.photo && <Image src={user.photo} style={styles.photo} />}
        </View>
      )}
    </View>
  );

  const renderSection = (title: string, content: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{content}</View>
    </View>
  );

  const renderExperience = () =>
    sortedExperience.length > 0 &&
    renderSection(
      "Experiencia Laboral",
      sortedExperience.map((exp, index) => (
        <View key={index} style={styles.entryContainer}>
          <View style={styles.entryHeader}>
            <View>
              <Text style={styles.jobTitle}>{exp.position}</Text>
              <Text style={styles.company}>{exp.company}</Text>
            </View>
            <Text style={styles.date}>
              {formatDate(exp.startDate)} - {exp.current ? "Actual" : formatDate(exp.endDate)}
            </Text>
          </View>
          {exp.description && <Text style={styles.description}>{exp.description}</Text>}
        </View>
      ))
    );

  const renderEducation = () =>
    sortedEducation.length > 0 &&
    renderSection(
      "Educación",
      sortedEducation.map((edu, index) => (
        <View key={index} style={styles.entryContainer}>
          <View style={styles.entryHeader}>
            <View>
              <Text style={styles.degree}>{edu.degree}</Text>
              <Text style={styles.institution}>
                {edu.institution}
                {edu.field && ` - ${edu.field}`}
              </Text>
            </View>
            <Text style={styles.date}>
              {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
            </Text>
          </View>
        </View>
      ))
    );

  const renderSkills = () =>
    user.skills.length > 0 &&
    renderSection(
      "Habilidades",
      <View style={styles.skills}>
        {user.skills.map((skill, index) => (
          <Text key={index} style={styles.skill}>
            {skill}
          </Text>
        ))}
      </View>
    );

  const renderLanguages = () =>
    user.languages.length > 0 &&
    renderSection(
      "Idiomas",
      user.languages.map((lang, index) => (
        <View key={index} style={styles.languageItem}>
          <Text>{lang.language}</Text>
          <Text style={{ color: "#666" }}>{lang.level}</Text>
        </View>
      ))
    );

  const renderSummary = () =>
    user.summary &&
    renderSection(
      "Perfil Profesional",
      <Text style={styles.summary}>{user.summary}</Text>
    );

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        {renderSummary()}
        {renderExperience()}
        {renderEducation()}
        {renderSkills()}
        {renderLanguages()}
      </Page>
    </Document>
  );
}

export default CVTemplate;
