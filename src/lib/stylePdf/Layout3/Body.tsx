import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout3Styles } from "./styles";
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
    return `${date.getFullYear()}`;
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

const buildInfoItems = (user: UserCV) => {
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

export const Layout3Body: React.FC<BodyProps> = ({ user, options }) => {
  const styles = createLayout3Styles(options);

  const infoItems = buildInfoItems(user);
  const additionalInfoItems = buildAdditionalInfoLines(user);

  const experienceEntries = user.experience.map((exp, index) => {
    const location = formatPdfLocation({
      localidad: exp.localidad,
      municipio: exp.municipio,
      provincia: exp.provincia,
    });

    return (
      <View key={index} style={styles.entryContainer}>
        <View style={styles.entryHeader}>
          <Text style={styles.institution}>{exp.company}</Text>
          <Text style={styles.dates}>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</Text>
        </View>
        <Text style={styles.degree}>{exp.position}</Text>
        {location ? <Text style={styles.location}>{location}</Text> : null}
        {toBulletLines(exp.description).map((line, lineIndex) => (
          <View key={lineIndex} style={styles.bulletItem}>
            <Text style={styles.bulletDot}>·</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}
      </View>
    );
  });

  const educationEntries = user.education.map((edu, index) => {
    const location = formatPdfLocation({
      localidad: edu.localidad,
      municipio: edu.municipio,
      provincia: edu.provincia,
    });

    return (
      <View key={index} style={styles.entryContainer}>
        <View style={styles.entryHeader}>
          <Text style={styles.institution}>{edu.institution}</Text>
          <Text style={styles.dates}>{formatDateRange(edu.startDate, edu.endDate, edu.current)}</Text>
        </View>
        <Text style={styles.degree}>{edu.degree}</Text>
        {location ? <Text style={styles.location}>{location}</Text> : null}
      </View>
    );
  });

  const certificationEntries = (user.certifications || []).map((cert, index) => (
    <View key={index} style={styles.entryContainer}>
      <Text style={styles.institution}>{formatCertificationTitle(cert)}</Text>
      <Text style={styles.certificationMeta}>
        {formatCertificationInstitution(cert)}
        {formatCertificationDate(cert) ? ` | ${formatCertificationDate(cert)}` : ""}
      </Text>
    </View>
  ));

  const orderedExperience = options.reverseExperience ? [...experienceEntries].reverse() : experienceEntries;
  const orderedEducation = options.reverseEducation ? [...educationEntries].reverse() : educationEntries;
  const orderedCourses = options.reverseCourses ? [...certificationEntries].reverse() : certificationEntries;

  return (
    <View style={styles.bodyContainer}>
      <View style={styles.leftColumn}>
        {infoItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.leftSectionTitle}>INFORMACIÓN</Text>
            {infoItems.map((item, index) => (
              <Text key={index} style={styles.leftInfoItem}>
                {item}
              </Text>
            ))}
          </View>
        )}

        {options.showSkills && user.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.leftSectionTitle}>HABILIDADES</Text>
            {user.skills.map((skill, index) => (
              <Text key={index} style={styles.leftBulletItem}>
                · {skill}
              </Text>
            ))}
          </View>
        )}

        {options.showLanguages && user.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.leftSectionTitle}>LENGUAJES</Text>
            {user.languages.map((lang, index) => (
              <View key={index} style={styles.languageItem}>
                <Text style={styles.leftInfoItem}>{lang.language}</Text>
                <Text style={styles.leftInfoMeta}>{lang.level}</Text>
              </View>
            ))}
          </View>
        )}

        {additionalInfoItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.leftSectionTitle}>INFORMACIÓN ADICIONAL</Text>
            {additionalInfoItems.map((item, index) => (
              <Text key={index} style={styles.leftInfoItem}>
                {item}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.rightColumn}>
        {options.showSummary && user.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERFIL</Text>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        )}

        {orderedExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCIA</Text>
            {orderedExperience}
          </View>
        )}

        {orderedEducation.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCACIÓN</Text>
            {orderedEducation}
          </View>
        )}

        {options.showCertifications && orderedCourses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CURSOS Y CERTIFICACIONES</Text>
            {orderedCourses}
          </View>
        )}
      </View>
    </View>
  );
};

export default Layout3Body;