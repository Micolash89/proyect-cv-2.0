import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout0Styles } from "./styles";
import { formatPdfLocation } from "../utils/location";
import {
  buildAdditionalInfoLines,
  formatCertificationDate,
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
    const formatter = new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
    });
    return formatter.format(date);
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

export const Layout0Body: React.FC<BodyProps> = ({ user, options }) => {
  const styles = createLayout0Styles(options);
  const additionalInfoLines = buildAdditionalInfoLines(user);

  const experienceEntries = user.experience.map((exp, index) => (
    <View key={index} style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={styles.institution}>{exp.company}</Text>
        <Text style={styles.location}>
          {formatPdfLocation({
            localidad: exp.localidad,
            municipio: exp.municipio,
            provincia: exp.provincia,
          })}
        </Text>
      </View>
      <View style={styles.entryHeader}>
        <Text style={styles.degree}>{exp.position}</Text>
        <Text style={styles.dates}>
          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
        </Text>
      </View>
      {toBulletLines(exp.description).map((line, lineIndex) => (
        <View key={lineIndex} style={styles.bulletItem}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={[styles.bulletText, { maxWidth: "95%" }]}>{line}</Text>
        </View>
      ))}
    </View>
  ));

  const educationEntries = user.education.map((edu, index) => (
    <View key={index} style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={styles.institution}>{edu.institution}</Text>
        <Text style={styles.location}>
          {formatPdfLocation({
            localidad: edu.localidad,
            municipio: edu.municipio,
            provincia: edu.provincia,
          })}
        </Text>
      </View>
      <View style={styles.entryHeader}>
        <Text style={styles.degree}>{edu.degree}</Text>
        <Text style={styles.dates}>
          {formatDateRange(edu.startDate, edu.endDate, edu.current)}
        </Text>
      </View>
    </View>
  ));

  const orderedExperience = options.reverseExperience
    ? [...experienceEntries].reverse()
    : experienceEntries;

  const orderedEducation = options.reverseEducation
    ? [...educationEntries].reverse()
    : educationEntries;

  const certificationEntries = (user.certifications || []).map(
    (cert, index) => (
      <View key={index} style={styles.certificationItem}>
        <View style={styles.certificationItemHeader}>
          <Text style={styles.certificationTitle}>
            {formatCertificationTitle(cert)}
          </Text>

          <Text style={styles.dates}>{formatCertificationDate(cert)}</Text>
        </View>
        <Text style={styles.certificationMeta}>
          {formatCertificationInstitution(cert)}
        </Text>
      </View>
    ),
  );

  const orderedCertifications = options.reverseCourses
    ? [...certificationEntries].reverse()
    : certificationEntries;

  return (
    <View>
      {options.showSummary && user.summary && (
        <View style={[styles.section, { paddingHorizontal: 8 }]}>
          <View>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        </View>
      )}

      {user.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPERIENCIA LABORAL</Text>
          <View style={styles.sectionContent}>{orderedExperience}</View>
        </View>
      )}

      {user.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FORMACIÓN ACADÉMICA</Text>
          <View style={styles.sectionContent}>{orderedEducation}</View>
        </View>
      )}

      {options.showCertifications && orderedCertifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CURSOS Y CERTIFICACIONES</Text>
          {orderedCertifications}
        </View>
      )}

      {additionalInfoLines.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN ADICIONAL</Text>
          <View style={[styles.skills, { gap: 4 }]}>
            {additionalInfoLines.map((item, index) => (
              <Text key={index} style={styles.additionalInfoItem}>
                • {item}
              </Text>
            ))}
            {options.showLanguages &&
              user.languages.length > 0 &&
              user.languages.map((lang, index) => (
                <Text key={index} style={styles.additionalInfoItem}>
                  • {lang.language}: {lang.level}
                </Text>
              ))}
          </View>
        </View>
      )}

      {options.showSkills && user.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HABILIDADES</Text>
          <View style={styles.skills}>
            {user.skills.map((skill, index) => (
              <View key={index} style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default Layout0Body;
