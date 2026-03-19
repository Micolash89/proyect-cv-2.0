import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout0Styles } from "./styles";

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

export const Layout0Body: React.FC<BodyProps> = ({ user, options }) => {
  const styles = createLayout0Styles(options);

  const experienceEntries = user.experience.map((exp, index) => (
    <View key={index} style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={styles.institution}>{exp.company}</Text>
        <Text style={styles.dates}>
          {parseDate(exp.startDate)} -{" "}
          {exp.current ? "Actualidad" : parseDate(exp.endDate)}
        </Text>
      </View>
      <Text style={styles.degree}>{exp.position}</Text>
      {exp.description && (
        <Text style={styles.description}>{exp.description}</Text>
      )}
    </View>
  ));

  const educationEntries = user.education.map((edu, index) => (
    <View key={index} style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={styles.institution}>{edu.institution}</Text>
        <Text style={styles.dates}>
          {parseDate(edu.startDate)} -{" "}
          {edu.current ? "Actualidad" : parseDate(edu.endDate)}
        </Text>
      </View>
      <View style={styles.entryHeader}>
        <Text style={styles.degree}>{edu.degree}</Text>
        <Text style={styles.dates}>{edu.municipio} {edu.localidad}</Text>
      </View>
    </View>
  ));

  const orderedExperience = options.reverseExperience
    ? [...experienceEntries].reverse()
    : experienceEntries;

  const orderedEducation = options.reverseEducation
    ? [...educationEntries].reverse()
    : educationEntries;

  return (
    <View>
      {options.showSummary && user.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERFIL PROFESIONAL</Text>
          <Text style={styles.summary}>{user.summary}</Text>
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

      {options.showSkills && user.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HABILIDADES</Text>
          <View style={styles.skills}>
            {user.skills.map((skill, index) => (
              <Text key={index} style={styles.skill}>
                {skill} {index !== user.skills.length - 1 && "·"}
              </Text>
            ))}
          </View>
        </View>
      )}

      {options.showLanguages && user.languages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IDIOMAS</Text>
          {user.languages.map((lang, index) => (
            <View key={index} style={styles.languageItem}>
              <Text>{lang.language}</Text>
              <Text style={styles.dates}>{lang.level}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default Layout0Body;
