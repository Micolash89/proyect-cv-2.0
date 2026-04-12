import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout5Styles } from "./styles";
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
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const formatDateRange = (startDate?: string, endDate?: string, isCurrent?: boolean) => {
  const start = parseDate(startDate);
  const end = isCurrent ? "Actualidad" : parseDate(endDate);
  if (start && end) return `${start} - ${end}`;
  return start || end;
};

const toBulletLines = (text?: string) => {
  if (!text) return [];

  return text
    .split(/\r?\n|•|·/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const buildContactItems = (user: UserCV) => {
  const location = formatPdfLocation({
    localidad: user.localidad,
    municipio: user.municipio,
    provincia: user.provincia,
    fallback: user.location,
  });

  return [
    user.fechaNacimiento || "",
    user.dni ? `DNI: ${user.dni}` : "",
    user.phone ? `Tel: ${user.phone}` : "",
    user.email || "",
    location,
  ].filter(Boolean);
};

export const Layout5Body: React.FC<BodyProps> = ({ user, options }) => {
  const styles = createLayout5Styles(options);

  const contactItems = buildContactItems(user);
  const additionalInfoItems = buildAdditionalInfoLines(user);
  const orderedExperience = options.reverseExperience ? [...user.experience].reverse() : user.experience;
  const orderedEducation = options.reverseEducation ? [...user.education].reverse() : user.education;
  const orderedCourses = options.reverseCourses
    ? [...(user.certifications || [])].reverse()
    : user.certifications || [];

  return (
    <View style={styles.contentRow}>
      <View style={styles.leftColumn}>
        {contactItems.length > 0 && (
          <View style={styles.leftSection}>
            <Text style={styles.leftSectionTitle}>INFORMACIÓN</Text>
            {contactItems.map((item, index) => (
              <Text key={index} style={styles.leftText}>
                {item}
              </Text>
            ))}
          </View>
        )}

        {additionalInfoItems.length > 0 && (
          <View style={styles.leftSection}>
            <Text style={styles.leftSectionTitle}>INFORMACIÓN ADICIONAL</Text>
            {additionalInfoItems.map((item, index) => (
              <Text key={index} style={styles.leftText}>
                {item}
              </Text>
            ))}
          </View>
        )}

        {options.showSkills && user.skills.length > 0 && (
          <View style={styles.leftSection}>
            <Text style={styles.leftSectionTitle}>HABILIDADES</Text>
            {user.skills.map((skill, index) => (
              <Text key={index} style={styles.leftText}>
                {skill}
              </Text>
            ))}
          </View>
        )}

        {options.showLanguages && user.languages.length > 0 && (
          <View style={styles.leftSection}>
            <Text style={styles.leftSectionTitle}>IDIOMAS</Text>
            {user.languages.map((language, index) => (
              <View key={index} style={styles.languageItem}>
                <Text style={styles.leftText}>{language.language}</Text>
                <Text style={styles.leftMetaText}>{language.level.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}

        {orderedEducation.length > 0 && (
          <View style={styles.leftSection}>
            <Text style={styles.leftSectionTitle}>EDUCACIÓN</Text>
            {orderedEducation.map((edu, index) => {
              const location = formatPdfLocation({
                localidad: edu.localidad,
                municipio: edu.municipio,
                provincia: edu.provincia,
              });

              return (
                <View key={index} style={styles.courseItem}>
                  <Text style={styles.leftText}>{edu.degree}</Text>
                  <Text style={styles.leftMetaText}>{edu.institution}</Text>
                  <Text style={styles.leftMetaText}>{formatDateRange(edu.startDate, edu.endDate, edu.current)}</Text>
                  {location ? <Text style={styles.leftMetaText}>{location}</Text> : null}
                </View>
              );
            })}
          </View>
        )}

        {options.showCertifications && orderedCourses.length > 0 && (
          <View style={styles.leftSection}>
            <Text style={styles.leftSectionTitle}>CURSOS Y CERTIFICACIONES</Text>
            {orderedCourses.map((course, index) => (
              <View key={index} style={styles.courseItem}>
                <Text style={styles.leftText}>{formatCertificationTitle(course)}</Text>
                <Text style={styles.leftMetaText}>{formatCertificationInstitution(course)}</Text>
                <Text style={styles.leftMetaText}>{formatCertificationDate(course)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.rightColumn}>
        {options.showSummary && user.summary && (
          <View style={styles.section}>
            <Text style={styles.rightSectionTitle}>PERFIL</Text>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        )}

        {orderedExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.rightSectionTitle}>EXPERIENCIA PROFESIONAL</Text>
            {orderedExperience.map((exp, index) => {
              const location = formatPdfLocation({
                localidad: exp.localidad,
                municipio: exp.municipio,
                provincia: exp.provincia,
                fallback: user.location,
              });

              return (
                <View key={index} style={styles.entryContainer}>
                  <Text style={styles.entryMeta}>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</Text>
                  <Text style={styles.entryTitle}>{exp.position}</Text>
                  <Text style={styles.entryCompany}>{exp.company}</Text>
                  {toBulletLines(exp.description).map((line, lineIndex) => (
                    <View key={lineIndex} style={styles.bulletItem}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{line}</Text>
                    </View>
                  ))}
                  {location ? <Text style={styles.entryLocation}>{location}</Text> : null}
                </View>
              );
            })}
          </View>
        )}

      </View>
    </View>
  );
};

export default Layout5Body;