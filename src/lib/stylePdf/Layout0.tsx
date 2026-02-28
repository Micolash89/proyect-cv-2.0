import React from "react";
import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF, DEFAULT_OPTIONS_PDF } from "./definitions";
import { createBaseStyles } from "./baseStyles";

interface LayoutProps {
  user: UserCV;
  options?: Partial<OptionsPDF>;
}

const parseDate = (dateStr: string | undefined) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

export const Layout0: React.FC<LayoutProps> = ({ user, options }) => {
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createBaseStyles(opts.primaryColor, opts.fontSize);

  const experience = user.experience.map((exp, index) => (
    <View key={index} style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={[styles.company, { fontWeight: 600 }]}>{exp.company}</Text>
        <Text style={styles.date}>
          {parseDate(exp.startDate)} - {exp.current ? "Actualidad" : parseDate(exp.endDate)}
        </Text>
      </View>
      <Text style={styles.jobTitle}>{exp.position}</Text>
      {exp.description && (
        <Text style={styles.description}>{exp.description}</Text>
      )}
    </View>
  ));

  const education = user.education.map((edu, index) => (
    <View key={index} style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={[styles.institution, { fontWeight: 600 }]}>{edu.institution}</Text>
        <Text style={styles.date}>
          {parseDate(edu.startDate)} - {edu.current ? "Actualidad" : parseDate(edu.endDate)}
        </Text>
      </View>
      <Text style={styles.degree}>{edu.degree}</Text>
    </View>
  ));

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{user.fullName}</Text>
          <View style={styles.contactInfo}>
            {user.location && <Text style={styles.contactItem}>{user.location}</Text>}
            {user.phone && <Text style={styles.contactItem}>{user.phone}</Text>}
            {user.email && <Text style={styles.contactItem}>{user.email}</Text>}
            {user.linkedin && <Text style={styles.contactItem}>LinkedIn</Text>}
          </View>
        </View>

        {opts.showPhoto && user.photo && (
          <View style={{ position: "absolute", top: 30, right: 30 }}>
            <Image src={user.photo} style={styles.photo} />
          </View>
        )}

        {opts.showSummary && user.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERFIL PROFESIONAL</Text>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        )}

        {user.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCIA LABORAL</Text>
            <View style={styles.sectionContent}>
              {opts.layout === "descending" ? experience : [...experience].reverse()}
            </View>
          </View>
        )}

        {user.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FORMACIÓN ACADÉMICA</Text>
            <View style={styles.sectionContent}>
              {opts.layout === "descending" ? education : [...education].reverse()}
            </View>
          </View>
        )}

        {opts.showSkills && user.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HABILIDADES</Text>
            <View style={styles.skills}>
              {user.skills.map((skill, index) => (
                <Text key={index} style={styles.skill}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {opts.showLanguages && user.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>IDIOMAS</Text>
            {user.languages.map((lang, index) => (
              <View key={index} style={styles.languageItem}>
                <Text>{lang.language}</Text>
                <Text style={styles.date}>{lang.level}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
