import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF, DEFAULT_OPTIONS_PDF } from "../definitions";
import { createLayout7Styles } from "./styles";

const parseDate = (d: string | undefined) => { if (!d) return ""; try { const da = new Date(d); return `${da.getMonth()+1}/${da.getFullYear()}`; } catch { return d; } };

export const Layout7: React.FC<{ user: UserCV; options?: Partial<OptionsPDF> }> = ({ user, options }) => {
  const opts = { ...DEFAULT_OPTIONS_PDF, ...options };
  const styles = createLayout7Styles(opts);
  const name = options?.fullName ? user.fullName : user.fullName.split(" ").slice(0,2).join(" ");

  const exp = user.experience.map((e,i) => <View key={i} style={styles.entryContainer}><View style={styles.entryHeader}><Text style={styles.institution}>{e.company}</Text><Text style={styles.dates}>{parseDate(e.startDate)} - {e.current?"Actualidad":parseDate(e.endDate)}</Text></View><Text style={styles.degree}>{e.position}</Text>{e.description && <Text style={styles.description}>{e.description}</Text>}</View>);
  const edu = user.education.map((e,i) => <View key={i} style={styles.entryContainer}><View style={styles.entryHeader}><Text style={styles.institution}>{e.institution}</Text><Text style={styles.dates}>{parseDate(e.startDate)} - {parseDate(e.endDate)}</Text></View><Text style={styles.degree}>{e.degree}</Text></View>);

  return (
    <Document title={`CV - ${user.fullName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}><View><Text style={styles.name}>{name}</Text></View><View style={styles.contactInfo}>{user.phone&&<Text>{user.phone}</Text>}{user.email&&<Text>{user.email}</Text>}{user.location&&<Text>{user.location}</Text>}</View></View>
        {opts.showSummary && user.summary && <View style={styles.section}><Text style={styles.sectionTitle}>PERFIL</Text><Text style={styles.summary}>{user.summary}</Text></View>}
        {user.experience.length>0 && <View style={styles.section}><Text style={styles.sectionTitle}>EXPERIENCIA</Text>{opts.reverseExperience?[...exp].reverse():exp}</View>}
        {user.education.length>0 && <View style={styles.section}><Text style={styles.sectionTitle}>EDUCACIÓN</Text>{opts.reverseEducation?[...edu].reverse():edu}</View>}
        {opts.showSkills && user.skills.length>0 && <View style={styles.section}><Text style={styles.sectionTitle}>HABILIDADES</Text><View style={styles.skills}>{user.skills.map((s,i) => <Text key={i} style={styles.skill}>{s}</Text>)}</View></View>}
      </Page>
    </Document>
  );
};
export default Layout7;
