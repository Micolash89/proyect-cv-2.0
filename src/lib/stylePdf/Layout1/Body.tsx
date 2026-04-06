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
    return `${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const formatLocation = (...parts: Array<string | undefined>) => {
  return parts.filter(Boolean).join(", ");
};

const formatDateRange = (startDate?: string, endDate?: string, isCurrent?: boolean) => {
  const start = parseDate(startDate);
  const end = isCurrent ? "Actualidad" : parseDate(endDate);
  if (start && end) return `${start} - ${end}`;
  return start || end;
};

export const Layout1Body: React.FC<BodyProps> = ({ user, options }) => {
  const styles = createLayout1Styles(options);

  const experienceEntries = user.experience.map((exp, index) => (
    <View key={index} style={styles.entryContainer}>
      <Text style={styles.companyName}>{exp.company}</Text>
      <Text style={styles.jobTitle}>{exp.position}</Text>
      <Text style={styles.dateLocation}>
        {formatDateRange(exp.startDate, exp.endDate, exp.current)}
        {formatLocation(exp.localidad, exp.municipio, exp.provincia) && ` | ${formatLocation(exp.localidad, exp.municipio, exp.provincia)}`}
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
        {formatDateRange(edu.startDate, edu.endDate, edu.current)}
        {formatLocation(edu.localidad, edu.municipio, edu.provincia) && ` | ${formatLocation(edu.localidad, edu.municipio, edu.provincia)}`}
      </Text>
    </View>
  ));

  const certificationEntries = (user.certifications || []).map((cert, index) => (
    <View key={index} style={styles.certificationItem}>
      <Text style={styles.certificationName}>{cert.name}</Text>
      <Text style={styles.certificationIssuer}>{cert.issuer}</Text>
      <Text style={styles.certificationDate}>{parseDate(cert.date)}</Text>
    </View>
  ));

  const orderedExperience = options.reverseExperience 
    ? [...experienceEntries].reverse() 
    : experienceEntries;

  const orderedEducation = options.reverseEducation 
    ? [...educationEntries].reverse() 
    : educationEntries;

  const orderedCertifications = options.reverseCourses
    ? [...certificationEntries].reverse()
    : certificationEntries;

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

      {options.showCertifications && orderedCertifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CERTIFICACIONES</Text>
          {orderedCertifications}
        </View>
      )}
    </View>
  );
};

export default Layout1Body;
