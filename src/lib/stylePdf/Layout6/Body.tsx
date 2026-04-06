import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout6Styles } from "./styles";

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

const formatLocation = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(", ");

export const Layout6Body: React.FC<BodyProps> = ({ user, options }) => {
  const styles = createLayout6Styles(options);

  const orderedExperience = options.reverseExperience ? [...user.experience].reverse() : user.experience;
  const orderedEducation = options.reverseEducation ? [...user.education].reverse() : user.education;
  const additionalInfoLines = [
    user.licencia || "",
    user.disponibilidad || "",
    user.movilidad ? "Cuenta con movilidad propia" : "",
    user.office ? "Disponible para oficina" : "",
    user.incorporacion ? `Incorporación: ${user.incorporacion}` : "",
  ].filter(Boolean);

  return (
    <View style={styles.mainContent}>
      {options.showSummary && user.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil profesional</Text>
          <Text style={styles.summary}>{user.summary}</Text>
        </View>
      )}

        {options.showSkills && user.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <View style={styles.skillList}>
              {user.skills.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>
                  • {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

      {orderedExperience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experiencia de trabajo</Text>
          <View style={styles.timelineContainer}>
            {orderedExperience.map((exp, index) => {
              const location = formatLocation(exp.localidad, exp.municipio, exp.provincia) || user.location || "";

              return (
                <View key={index} style={styles.timelineEntry}>
                  <View style={styles.timelineLeft}>
                    <Text style={styles.timelineSideTitle}>{exp.position}</Text>
                    {location ? <Text style={styles.timelineSideMeta}>{location}</Text> : null}
                  </View>
                  <View style={styles.timelineRail}>
                    <View style={styles.timelineDot} />
                    {index !== orderedExperience.length - 1 ? <View style={styles.timelineLine} /> : null}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>{exp.company}</Text>
                    <Text style={styles.timelineSubtitle}>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</Text>
                    {toBulletLines(exp.description).map((line, lineIndex) => (
                      <Text key={lineIndex} style={styles.timelineDescription}>
                        {line}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {orderedEducation.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educación</Text>
          <View style={styles.educationTimeline}>
            {orderedEducation.map((edu, index) => {
              const location = formatLocation(edu.localidad, edu.municipio, edu.provincia);

              return (
                <View key={index} style={styles.educationTimelineEntry}>
                  <View style={styles.educationTimelineLeft}>
                    <Text style={styles.educationDate}>{formatDateRange(edu.startDate, edu.endDate, edu.current)}</Text>
                  </View>
                  <View style={styles.educationTimelineRail}>
                    <View style={styles.educationDot} />
                    {index !== orderedEducation.length - 1 ? <View style={styles.educationLine} /> : null}
                  </View>
                  <View style={styles.educationTimelineContent}>
                    <Text style={styles.educationTitle}>{edu.degree}</Text>
                    <Text style={styles.educationSubtitle}>{edu.institution}</Text>
                    {location ? <Text style={styles.educationLocation}>{location}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {(additionalInfoLines.length > 0 || (options.showLanguages && user.languages.length > 0)) && (
        <View style={styles.bottomSplit}>
          <View style={styles.bottomColumn}>
            {additionalInfoLines.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Información adicional</Text>
                <Text style={styles.additionalText}>{additionalInfoLines.join(". ")}</Text>
              </>
            )}
          </View>

          <View style={styles.bottomColumnRight}>
            {options.showLanguages && user.languages.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Idiomas</Text>
                {user.languages.map((lang, index) => (
                  <View key={index} style={styles.languageItem}>
                    <Text style={styles.languageName}>{lang.language}</Text>
                    <Text style={styles.languageLevel}>{lang.level}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default Layout6Body;