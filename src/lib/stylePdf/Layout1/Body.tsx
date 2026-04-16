import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout1Styles } from "./styles";
import { formatPdfLocation } from "../utils/location";
import {
  buildAdditionalInfoLines,
  formatCertificationDate,
  formatCertificationDate2,
  formatCertificationInstitution,
  formatCertificationTitle,
} from "../utils/certifications";

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

const formatDateRange = (
  startDate?: string,
  endDate?: string,
  isCurrent?: boolean,
) => {
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
        {formatPdfLocation({
          localidad: exp.localidad,
          municipio: exp.municipio,
          provincia: exp.provincia,
        })
          ? ` | ${formatPdfLocation({
              localidad: exp.localidad,
              municipio: exp.municipio,
              provincia: exp.provincia,
            })}`
          : ""}
      </Text>
      {exp.description && (
        <Text style={styles.description} hyphenationCallback={(word) => [word]}>
          • {exp.description}
        </Text>
      )}
    </View>
  ));

  const educationEntries = user.education.map((edu, index) => (
    <View key={index} style={styles.entryContainer}>
      <Text style={styles.companyName}>{edu.institution}</Text>
      <Text style={styles.jobTitle}>{edu.degree}</Text>
      <Text style={styles.dateLocation}>
        {formatDateRange(edu.startDate, edu.endDate, edu.current)}
        {formatPdfLocation({
          localidad: edu.localidad,
          municipio: edu.municipio,
          provincia: edu.provincia,
        })
          ? ` | ${formatPdfLocation({
              localidad: edu.localidad,
              municipio: edu.municipio,
              provincia: edu.provincia,
            })}`
          : ""}
      </Text>
    </View>
  ));

  const certificationEntries = (user.certifications || []).map(
    (cert, index) => (
      <View key={index} style={styles.certificationItem}>
        <Text style={styles.certificationName}>
          {formatCertificationTitle(cert)}
        </Text>
        <Text style={styles.certificationIssuer}>
          {formatCertificationInstitution(cert)}
        </Text>
        <Text style={styles.certificationDate}>
          {formatCertificationDate2(cert)}
        </Text>
      </View>
    ),
  );

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
          <Text style={styles.summary} hyphenationCallback={(word) => [word]}>
            {user.summary}
          </Text>
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
          <Text style={styles.sectionTitle}>CURSOS Y CERTIFICACIONES</Text>
          {orderedCertifications}
        </View>
      )}
    </View>
  );
};

export default Layout1Body;
