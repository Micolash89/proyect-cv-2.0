import React from "react";
import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF, DEFAULT_OPTIONS_PDF } from "../definitions";
import { createLayout3Styles } from "./styles";

const parseDate = (dateStr: string | undefined) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

export const Layout3: React.FC<{ user: UserCV; options?: Partial<OptionsPDF> }> = ({ user, options }) => {
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createLayout3Styles(opts);

  const fullNameText = options?.fullName ? user.fullName : user.fullName.split(" ").slice(0, 2).join(" ");

  const experienceEntries = user.experience.map((exp, index) => (
    <View key={index} style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={styles.institution}>{exp.company}</Text>
        <Text style={styles.dates}>{parseDate(exp.startDate)} - {exp.current ? "Actualidad" : parseDate(exp.endDate)}</Text>
      </View>
      <Text style={styles.degree}>{exp.position}</Text>
      {exp.description && <Text style={styles.description}>{exp.description}</Text>}
    </View>
  ));

  const educationEntries = user.education.map((edu, index) => (
    <View key={index} style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={styles.institution}>{edu.institution}</Text>
        <Text style={styles.dates}>{parseDate(edu.startDate)} - {parseDate(edu.endDate)}</Text>
      </View>
      <Text style={styles.degree}>{edu.degree}</Text>
    </View>
  ));

  const orderedExperience = opts.reverseExperience ? [...experienceEntries].reverse() : experienceEntries;
  const orderedEducation = opts.reverseEducation ? [...educationEntries].reverse() : educationEntries;

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{fullNameText}</Text>
          <View style={styles.contactInfo}>
            {user.location && <Text>{user.location}</Text>}
            {user.phone && <Text>{user.phone}</Text>}
            {user.email && <Text>{user.email}</Text>}
          </View>
        </View>

        {opts.showSummary && user.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERFIL PROFESIONAL</Text>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        )}

        {user.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCIA LABORAL</Text>
            {orderedExperience}
          </View>
        )}

        {user.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FORMACIÓN ACADÉMICA</Text>
            {orderedEducation}
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
      </Page>
    </Document>
  );
};

export default Layout3;
