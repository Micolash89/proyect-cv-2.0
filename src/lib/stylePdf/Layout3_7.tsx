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

export const Layout3: React.FC<LayoutProps> = ({ user, options }) => {
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createBaseStyles(opts.primaryColor, opts.fontSize);

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={styles.page}>
        <View style={{ backgroundColor: opts.primaryColor, padding: 20, marginBottom: 15, borderRadius: 4 }}>
          <Text style={{ fontSize: 20, fontWeight: 700, color: "#ffffff" }}>{user.fullName}</Text>
          <View style={{ flexDirection: "row", gap: 15, marginTop: 5 }}>
            {user.email && <Text style={{ color: "#ffffff", fontSize: 8 }}>{user.email}</Text>}
            {user.phone && <Text style={{ color: "#ffffff", fontSize: 8 }}>{user.phone}</Text>}
            {user.location && <Text style={{ color: "#ffffff", fontSize: 8 }}>{user.location}</Text>}
          </View>
        </View>

        {opts.showSummary && user.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SOBRE MÍ</Text>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        )}

        {user.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCIA</Text>
            {user.experience.map((exp, index) => (
              <View key={index} style={styles.entryContainer}>
                <Text style={[styles.jobTitle, { color: opts.primaryColor }]}>{exp.position}</Text>
                <Text style={styles.company}>{exp.company} | {parseDate(exp.startDate)} - {exp.current ? "Actual" : parseDate(exp.endDate)}</Text>
                {exp.description && <Text style={styles.description}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {user.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ESTUDIOS</Text>
            {user.education.map((edu, index) => (
              <View key={index} style={styles.entryContainer}>
                <Text style={styles.degree}>{edu.degree}</Text>
                <Text style={styles.institution}>{edu.institution} | {parseDate(edu.startDate)} - {parseDate(edu.endDate)}</Text>
              </View>
            ))}
          </View>
        )}

        {opts.showSkills && user.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            <View style={styles.skills}>
              {user.skills.map((skill, index) => (
                <Text key={index} style={styles.skill}>{skill}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export const Layout4: React.FC<LayoutProps> = ({ user, options }) => {
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createBaseStyles(opts.primaryColor, opts.fontSize);

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={styles.page}>
        <View style={{ flexDirection: "row", borderLeftWidth: 4, borderLeftColor: opts.primaryColor, paddingLeft: 10, marginBottom: 15 }}>
          <Text style={[styles.name, { fontSize: 20 }]}>{user.fullName}</Text>
        </View>
        <View style={styles.contactInfo}>
          {user.email && <Text style={styles.contactItem}>{user.email}</Text>}
          {user.phone && <Text style={styles.contactItem}>{user.phone}</Text>}
          {user.location && <Text style={styles.contactItem}>{user.location}</Text>}
        </View>

        {opts.showSummary && user.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERFIL</Text>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        )}

        {user.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCIA LABORAL</Text>
            {user.experience.map((exp, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.jobTitle}>{exp.position}</Text>
                  <Text style={styles.date}>{parseDate(exp.startDate)}/{parseDate(exp.endDate)}</Text>
                </View>
                <Text style={styles.company}>{exp.company}</Text>
                {exp.description && <Text style={styles.description}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {user.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FORMACIÓN</Text>
            {user.education.map((edu, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.degree}>{edu.degree}</Text>
                  <Text style={styles.date}>{parseDate(edu.startDate)}/{parseDate(edu.endDate)}</Text>
                </View>
                <Text style={styles.institution}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export const Layout5: React.FC<LayoutProps> = ({ user, options }) => {
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createBaseStyles(opts.primaryColor, opts.fontSize);

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={styles.page}>
        <View style={{ alignItems: "center", marginBottom: 15 }}>
          {opts.showPhoto && user.photo && (
            <Image src={user.photo} style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 8 }} />
          )}
          <Text style={[styles.name, { textAlign: "center" }]}>{user.fullName}</Text>
          <View style={styles.contactInfo}>
            {user.email && <Text style={styles.contactItem}>{user.email}</Text>}
            {user.phone && <Text style={styles.contactItem}>{user.phone}</Text>}
          </View>
        </View>

        {opts.showSummary && user.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RESUMEN PROFESIONAL</Text>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        )}

        {user.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCIA</Text>
            {user.experience.map((exp, index) => (
              <View key={index} style={styles.entryContainer}>
                <Text style={styles.jobTitle}>{exp.position}</Text>
                <Text style={styles.company}>{exp.company}</Text>
                <Text style={styles.date}>{parseDate(exp.startDate)} - {exp.current ? "Actual" : parseDate(exp.endDate)}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export const Layout6: React.FC<LayoutProps> = ({ user, options }) => {
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createBaseStyles(opts.primaryColor, opts.fontSize);

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={styles.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#000" }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: 700, color: opts.primaryColor }}>{user.fullName}</Text>
            <Text style={{ fontSize: 9, color: "#666" }}>{user.email} | {user.phone}</Text>
          </View>
          {opts.showPhoto && user.photo && (
            <Image src={user.photo} style={{ width: 50, height: 50 }} />
          )}
        </View>

        {opts.showSummary && user.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFILE</Text>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        )}

        {user.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>
            {user.experience.map((exp, index) => (
              <View key={index} style={styles.entryContainer}>
                <Text style={styles.jobTitle}>{exp.position} @ {exp.company}</Text>
                <Text style={styles.date}>{parseDate(exp.startDate)} - {exp.current ? "Present" : parseDate(exp.endDate)}</Text>
                {exp.description && <Text style={styles.description}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {user.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            {user.education.map((edu, index) => (
              <View key={index} style={styles.entryContainer}>
                <Text style={styles.degree}>{edu.degree}</Text>
                <Text style={styles.institution}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export const Layout7: React.FC<LayoutProps> = ({ user, options }) => {
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createBaseStyles(opts.primaryColor, opts.fontSize);

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={[styles.page, { padding: 30 }]}>
        <View style={{ backgroundColor: "#f9fafb", padding: 15, marginBottom: 15, borderRadius: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 700, color: opts.primaryColor }}>{user.fullName}</Text>
          <Text style={{ fontSize: 9, color: "#666", marginTop: 3 }}>{user.email} • {user.phone} • {user.location}</Text>
        </View>

        {opts.showSummary && user.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACERCA DE MÍ</Text>
            <Text style={styles.summary}>{user.summary}</Text>
          </View>
        )}

        {user.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCIA LABORAL</Text>
            {user.experience.map((exp, index) => (
              <View key={index} style={[styles.entryContainer, { backgroundColor: "#f9fafb", padding: 8, marginBottom: 5, borderRadius: 4 }]}>
                <Text style={[styles.jobTitle, { color: opts.primaryColor }]}>{exp.position}</Text>
                <Text style={styles.company}>{exp.company}</Text>
                <Text style={styles.date}>{parseDate(exp.startDate)} - {exp.current ? "Actual" : parseDate(exp.endDate)}</Text>
              </View>
            ))}
          </View>
        )}

        {opts.showSkills && user.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>APTITUDES</Text>
            <View style={styles.skills}>
              {user.skills.map((skill, index) => (
                <Text key={index} style={[styles.skill, { borderWidth: 1, borderColor: opts.primaryColor, backgroundColor: "transparent", color: opts.primaryColor }]}>
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
