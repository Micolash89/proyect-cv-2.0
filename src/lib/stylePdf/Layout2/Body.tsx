import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout2Styles } from "./styles";
import { formatPdfLocation } from "../utils/location";
import {
  formatCertificationDate,
  formatCertificationInstitution,
  formatCertificationTitle,
} from "../utils/certifications";
import {
  formatEducationDegreeWithStatus,
  isEducationInProgress,
} from "../utils/educationStatus";

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

const toBulletLines = (text?: string) => {
  if (!text) return [];

  return text
    .split(/\r?\n|•/)
    .map((line) => line.trim())
    .filter(Boolean);
};

export const Layout2Body: React.FC<BodyProps> = ({ user, options }) => {
  const styles = createLayout2Styles(options);

  const experienceEntries = user.experience.map((exp, index) => {
    const experienceLocation = formatPdfLocation({
      localidad: exp.localidad,
      municipio: exp.municipio,
      provincia: exp.provincia,
    });

    return (
      <View key={index} style={styles.entryContainer}>
        <View style={styles.entryHeader}>
          <Text style={styles.institution}>{exp.company}</Text>
          <View style={styles.entryMeta}>
            {experienceLocation ? (
              <Text style={styles.location}>{experienceLocation}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.entryHeaderDegre}>
          <Text style={styles.degree}>{exp.position}</Text>
          <Text style={styles.dates}>
            {formatDateRange(exp.startDate, exp.endDate, exp.current)}
          </Text>
        </View>
        {toBulletLines(exp.description).map((line, lineIndex) => (
          <View key={lineIndex} style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text
              style={styles.bulletText}
              hyphenationCallback={(word) => [word]}
            >
              {line}
            </Text>
          </View>
        ))}
      </View>
    );
  });

  const educationEntries = user.education.map((edu, index) => {
    const educationLocation = formatPdfLocation({
      localidad: edu.localidad,
      municipio: edu.municipio,
      provincia: edu.provincia,
    });

    return (
      <View key={index} style={styles.entryContainer}>
        <View style={styles.entryHeader}>
          <Text style={styles.institution}>{edu.institution}</Text>
          <View style={styles.entryMeta}>
            {educationLocation ? (
              <Text style={styles.location}>{educationLocation}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.entryHeaderDegre}>
          <Text style={styles.degree}>
            {formatEducationDegreeWithStatus(edu.degree, edu.status)}
          </Text>
          <Text style={styles.dates}>
            {formatDateRange(
              edu.startDate,
              edu.endDate,
              isEducationInProgress(edu.status),
            )}
          </Text>
        </View>
      </View>
    );
  });

  const certificationEntries = (user.certifications || []).map(
    (cert, index) => (
      <View key={index} style={styles.entryContainer}>
        <View style={styles.entryHeader}>
          <Text style={styles.institution}>
            {formatCertificationTitle(cert)}
          </Text>
          <Text style={styles.dates}>{formatCertificationDate(cert)}</Text>
        </View>
        <Text style={styles.degree}>
          {formatCertificationInstitution(cert)}
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
    <View style={styles.rightColumn}>
      {options.showSummary && user.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil</Text>
          <Text style={styles.summary} hyphenationCallback={(word) => [word]}>
            {user.summary}
          </Text>
        </View>
      )}

      {user.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experiencia Profesional</Text>
          {orderedExperience}
        </View>
      )}

      {user.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educación</Text>
          {orderedEducation}
        </View>
      )}

      {options.showCertifications && orderedCertifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cursos y certificaciones</Text>
          {orderedCertifications}
        </View>
      )}
    </View>
  );
};

export default Layout2Body;
