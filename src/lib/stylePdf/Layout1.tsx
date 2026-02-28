import React from "react";
import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF, DEFAULT_OPTIONS_PDF } from "./definitions";
import { createBaseStyles } from "./baseStyles";

interface LayoutProps {
  user: UserCV;
  options?: Partial<OptionsPDF>;
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

export const Layout1: React.FC<LayoutProps> = ({ user, options }) => {
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createBaseStyles(opts.primaryColor, opts.fontSize);
  const sidebarWidth = 180;

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={styles.page}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: sidebarWidth, backgroundColor: opts.primaryColor, padding: 15, marginRight: 15 }}>
            {opts.showPhoto && user.photo && (
              <View style={{ marginBottom: 15 }}>
                <Image src={user.photo} style={{ width: 80, height: 80, borderRadius: 40, alignSelf: "center" }} />
              </View>
            )}
            
            <Text style={{ color: "#ffffff", fontSize: 10, fontWeight: 700, marginBottom: 5, marginTop: 10 }}>CONTACTO</Text>
            {user.phone && <Text style={{ color: "#ffffff", fontSize: 8, marginBottom: 3 }}>{user.phone}</Text>}
            {user.email && <Text style={{ color: "#ffffff", fontSize: 8, marginBottom: 3 }}>{user.email}</Text>}
            {user.location && <Text style={{ color: "#ffffff", fontSize: 8, marginBottom: 3 }}>{user.location}</Text>}
            {user.linkedin && <Text style={{ color: "#ffffff", fontSize: 8, marginBottom: 3 }}>LinkedIn</Text>}

            {opts.showSkills && user.skills.length > 0 && (
              <>
                <Text style={{ color: "#ffffff", fontSize: 10, fontWeight: 700, marginBottom: 5, marginTop: 15 }}>HABILIDADES</Text>
                {user.skills.map((skill, index) => (
                  <Text key={index} style={{ color: "#ffffff", fontSize: 8, marginBottom: 3 }}>• {skill}</Text>
                ))}
              </>
            )}

            {opts.showLanguages && user.languages.length > 0 && (
              <>
                <Text style={{ color: "#ffffff", fontSize: 10, fontWeight: 700, marginBottom: 5, marginTop: 15 }}>IDIOMAS</Text>
                {user.languages.map((lang, index) => (
                  <Text key={index} style={{ color: "#ffffff", fontSize: 8, marginBottom: 3 }}>
                    {lang.language}: {lang.level}
                  </Text>
                ))}
              </>
            )}
          </View>

          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={{ fontSize: 22, fontWeight: 700, color: opts.primaryColor, marginBottom: 3 }}>
              {user.fullName}
            </Text>

            {opts.showSummary && user.summary && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PERFIL</Text>
                <Text style={styles.summary}>{user.summary}</Text>
              </View>
            )}

            {user.experience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>EXPERIENCIA</Text>
                {user.experience.map((exp, index) => (
                  <View key={index} style={styles.entryContainer}>
                    <Text style={[styles.jobTitle, { color: opts.primaryColor }]}>{exp.position}</Text>
                    <Text style={styles.company}>{exp.company}</Text>
                    <Text style={styles.date}>
                      {parseDate(exp.startDate)} - {exp.current ? "Actualidad" : parseDate(exp.endDate)}
                    </Text>
                    {exp.description && <Text style={styles.description}>{exp.description}</Text>}
                  </View>
                ))}
              </View>
            )}

            {user.education.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>EDUCACIÓN</Text>
                {user.education.map((edu, index) => (
                  <View key={index} style={styles.entryContainer}>
                    <Text style={styles.degree}>{edu.degree}</Text>
                    <Text style={styles.institution}>{edu.institution}</Text>
                    <Text style={styles.date}>
                      {parseDate(edu.startDate)} - {edu.current ? "Actualidad" : parseDate(edu.endDate)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
