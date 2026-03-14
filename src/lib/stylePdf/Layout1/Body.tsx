import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout1Styles } from "./styles";

interface BodyProps {
  user: UserCV;
  options: OptionsPDF;
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

export const Layout1Body: React.FC<BodyProps> = ({ user, options }) => {
  const styles = createLayout1Styles(options);

  const experienceEntries = user.experience.map((exp, index) => (
    <View key={index} style={styles.entryContainer}>
      <Text style={styles.companyName}>{exp.company}</Text>
      <Text style={styles.jobTitle}>{exp.position}</Text>
      <Text style={styles.dateLocation}>
        {parseDate(exp.startDate)} - {exp.current ? "Actualidad" : parseDate(exp.endDate)}
        {exp.company && " | "}
        {exp.company}
      </Text>
      {exp.description && (
        <Text style={styles.description}>• {exp.description}</Text>
      )}
    </View>
  ));

  const educationEntries = user.education.map((edu, index) => (
    <View key={index} style={styles.entryContainer}>
      <Text style={styles.companyName}>{edu.institution}</Text>
      <Text style={styles.jobTitle}>{edu.degree}</Text>
      <Text style={styles.dateLocation}>
        {parseDate(edu.startDate)} - {parseDate(edu.endDate)}
      </Text>
    </View>
  ));

  const orderedExperience = options.reverseExperience 
    ? [...experienceEntries].reverse() 
    : experienceEntries;

  const orderedEducation = options.reverseEducation 
    ? [...educationEntries].reverse() 
    : educationEntries;

  return (
    <View style={styles.mainContent}>
      {options.showSummary && user.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERFIL PROFESIONAL</Text>
          <Text style={styles.summary}>{user.summary}</Text>
        </View>
      )}

      {user.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPERIENCIA PROFESIONAL</Text>
          {orderedExperience}
        </View>
      )}

      {user.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EDUCACIÓN</Text>
          {orderedEducation}
        </View>
      )}
    </View>
  );
};

export default Layout1Body;
