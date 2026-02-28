import React from "react";
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
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

export const Layout2: React.FC<LayoutProps> = ({ user, options }) => {
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createBaseStyles(opts.primaryColor, opts.fontSize);

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={[styles.page, { paddingTop: 25 }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15, paddingBottom: 15, borderBottomWidth: 2, borderBottomColor: opts.primaryColor }}>
          <View>
            <Text style={[styles.name, { fontSize: 24 }]}>{user.fullName}</Text>
            <Text style={styles.subtitle}>{user.email}</Text>
            <Text style={styles.subtitle}>{user.phone}</Text>
          </View>
          {opts.showPhoto && user.photo && (
            <Image src={user.photo} style={{ width: 60, height: 60, borderRadius: 8 }} />
          )}
        </View>

        {opts.showSummary && user.summary && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 11, borderBottomWidth: 0, paddingBottom: 0 }]}>RESUMEN</Text>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        )}

        {user.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 11, borderBottomWidth: 0, paddingBottom: 0 }]}>EXPERIENCIA PROFESIONAL</Text>
            {user.experience.map((exp, index) => (
              <View key={index} style={[styles.entryContainer, { marginTop: 8 }]}>
                <View style={styles.entryHeader}>
                  <Text style={[styles.jobTitle, { color: opts.primaryColor }]}>{exp.position}</Text>
                  <Text style={styles.date}>{parseDate(exp.startDate)} - {exp.current ? "Ahora" : parseDate(exp.endDate)}</Text>
                </View>
                <Text style={styles.company}>{exp.company}</Text>
                {exp.description && <Text style={styles.description}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {user.education.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 11, borderBottomWidth: 0, paddingBottom: 0 }]}>FORMACIÓN</Text>
            {user.education.map((edu, index) => (
              <View key={index} style={[styles.entryContainer, { marginTop: 8 }]}>
                <View style={styles.entryHeader}>
                  <Text style={styles.degree}>{edu.degree}</Text>
                  <Text style={styles.date}>{parseDate(edu.startDate)} - {parseDate(edu.endDate)}</Text>
                </View>
                <Text style={styles.institution}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        )}

        {opts.showSkills && user.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 11, borderBottomWidth: 0, paddingBottom: 0 }]}>COMPETENCIAS</Text>
            <View style={[styles.skills, { marginTop: 5 }]}>
              {user.skills.map((skill, index) => (
                <Text key={index} style={[styles.skill, { backgroundColor: opts.primaryColor + "20", color: opts.primaryColor }]}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};
