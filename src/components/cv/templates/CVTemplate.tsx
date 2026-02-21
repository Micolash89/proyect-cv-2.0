import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

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

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2", fontWeight: 700 },
  ],
});

const createStyles = (primaryColor: string, fontSize: string, padding: number, margin: number) => {
  const sizes = { small: 9, medium: 10, large: 12 };
  const size = sizes[fontSize as keyof typeof sizes] || 10;

  return StyleSheet.create({
    page: {
      padding: padding,
      margin: margin,
      fontFamily: "Inter",
      fontSize: size,
      color: "#1a1a1a",
    },
    header: {
      marginBottom: 15,
    },
    name: {
      fontSize: size * 2,
      fontWeight: 700,
      color: primaryColor,
      marginBottom: 3,
    },
    contactInfo: {
      fontSize: size - 1,
      color: "#555",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: size + 1,
      fontWeight: 600,
      color: primaryColor,
      marginBottom: 6,
      paddingBottom: 3,
      borderBottomWidth: 1,
      borderBottomColor: primaryColor,
    },
    sectionContent: {
      flexDirection: "column",
      gap: 8,
    },
    experienceItem: {
      marginBottom: 8,
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    jobTitle: {
      fontWeight: 600,
      fontSize: size,
    },
    company: {
      color: "#555",
      fontSize: size - 1,
    },
    date: {
      fontSize: size - 1,
      color: "#666",
    },
    description: {
      marginTop: 3,
      color: "#444",
      lineHeight: 1.4,
    },
    skills: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
    },
    skill: {
      backgroundColor: "#f0f0f0",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 3,
      fontSize: size - 1,
    },
    educationItem: {
      marginBottom: 6,
    },
    degree: {
      fontWeight: 600,
    },
    institution: {
      color: "#555",
    },
    summary: {
      color: "#444",
      lineHeight: 1.5,
      textAlign: "justify",
    },
    languageItem: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    photo: {
      width: 70,
      height: 70,
      borderRadius: 35,
      marginLeft: 15,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
  });
};

interface CVTemplateProps {
  user: CVData;
}

export function CVTemplate({ user }: CVTemplateProps) {
  const { templateSettings, selectedTemplate } = user;
  const styles = createStyles(
    templateSettings.primaryColor,
    templateSettings.fontSize,
    templateSettings.padding,
    templateSettings.margin
  );

  const sortedExperience = [...user.experience].sort((a, b) => {
    if (templateSettings.layout === "descending") {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  const sortedEducation = [...user.education].sort((a, b) => {
    if (templateSettings.layout === "descending") {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  const formatDate = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.name}>{user.fullName}</Text>
              <View style={styles.contactInfo}>
                {user.email && (
                  <Text style={styles.contactItem}>{user.email}</Text>
                )}
                {user.phone && (
                  <Text style={styles.contactItem}>{user.phone}</Text>
                )}
                {user.location && (
                  <Text style={styles.contactItem}>{user.location}</Text>
                )}
                {user.linkedin && (
                  <Text style={styles.contactItem}>{user.linkedin}</Text>
                )}
                {user.github && (
                  <Text style={styles.contactItem}>{user.github}</Text>
                )}
              </View>
            </View>
            {user.photo && (
              <Image src={user.photo} style={styles.photo} />
            )}
          </View>
        </View>

        {user.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perfil Profesional</Text>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        )}

        {sortedExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia Laboral</Text>
            <View style={styles.sectionContent}>
              {sortedExperience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <View>
                      <Text style={styles.jobTitle}>{exp.position}</Text>
                      <Text style={styles.company}>{exp.company}</Text>
                    </View>
                    <Text style={styles.date}>
                      {formatDate(exp.startDate)} - {exp.current ? "Actual" : formatDate(exp.endDate)}
                    </Text>
                  </View>
                  {exp.description && (
                    <Text style={styles.description}>{exp.description}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {sortedEducation.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Educación</Text>
            <View style={styles.sectionContent}>
              {sortedEducation.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <View style={styles.experienceHeader}>
                    <View>
                      <Text style={styles.degree}>{edu.degree}</Text>
                      <Text style={styles.institution}>
                        {edu.institution}
                        {edu.field && ` - ${edu.field}`}
                      </Text>
                    </View>
                    <Text style={styles.date}>
                      {formatDate(edu.startDate)} - {edu.current ? "Actual" : formatDate(edu.endDate)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {user.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skills}>
              {user.skills.map((skill, index) => (
                <Text key={index} style={styles.skill}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {user.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas</Text>
            <View style={styles.sectionContent}>
              {user.languages.map((lang, index) => (
                <View key={index} style={styles.languageItem}>
                  <Text>{lang.language}</Text>
                  <Text style={{ color: "#666" }}>{lang.level}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

import { Image } from "@react-pdf/renderer";
export default CVTemplate;
