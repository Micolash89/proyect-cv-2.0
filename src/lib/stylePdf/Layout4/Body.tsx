import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout4Styles } from "./styles";
import { formatPdfLocation } from "../utils/location";
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
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
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
    .split(/\r?\n|•|·/)
    .map((line) => line.trim())
    .filter(Boolean);
};

export const Layout4Body: React.FC<BodyProps> = ({ user, options }) => {
  const styles = createLayout4Styles(options);

  const fullNameText = options.fullName
    ? user.fullName
    : user.fullName.split(" ").slice(0, 2).join(" ");

  const nameParts = fullNameText.trim().split(" ").filter(Boolean);
  const surname =
    nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullNameText;

  const orderedExperience = options.reverseExperience
    ? [...user.experience].reverse()
    : user.experience;

  const orderedEducation = options.reverseEducation
    ? [...user.education].reverse()
    : user.education;

  return (
    <View style={styles.rightColumn}>
      <View style={styles.nameHeader}>
        <Text style={styles.name}>{fullNameText.toUpperCase()}</Text>
        <Text style={styles.watermarkSurname}>{surname}</Text>
      </View>

      {options.showSummary && user.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERFIL</Text>
          <Text style={styles.summary} hyphenationCallback={(word) => [word]}>
            {user.summary}
          </Text>
        </View>
      )}

      {orderedExperience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPERIENCIA LABORAL</Text>
          {orderedExperience.map((exp, index) => {
            const location = formatPdfLocation({
              localidad: exp.localidad,
              municipio: exp.municipio,
              provincia: exp.provincia,
              fallback: user.location,
            });

            return (
              <View key={index} style={styles.entryContainer} wrap={false}>
                <Text style={styles.entryTitle}>{exp.company}</Text>
                <Text style={styles.entrySubtitle}>{exp.position}</Text>
                <Text style={styles.entryMeta}>
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  {location ? ` | ${location}` : ""}
                </Text>
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
          })}
        </View>
      )}

      {orderedEducation.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EDUCACIÓN</Text>
          {orderedEducation.map((edu, index) => {
            const location = formatPdfLocation({
              localidad: edu.localidad,
              municipio: edu.municipio,
              provincia: edu.provincia,
            });

            return (
              <View key={index} style={styles.entryContainer} wrap={false}>
                <Text style={styles.entryTitle}>{edu.institution}</Text>
                <Text style={styles.entrySubtitle}>
                  {formatEducationDegreeWithStatus(edu.degree, edu.status)}
                </Text>
                <Text style={styles.entryMeta}>
                  {formatDateRange(
                    edu.startDate,
                    edu.endDate,
                    isEducationInProgress(edu.status),
                  )}
                  {location ? ` | ${location}` : ""}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default Layout4Body;
