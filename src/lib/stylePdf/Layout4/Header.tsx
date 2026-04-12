import React from "react";
import { Image, Text, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout4Styles } from "./styles";
import { formatPdfLocation } from "../utils/location";
import {
  buildAdditionalInfoLines,
  formatCertificationDate,
  formatCertificationInstitution,
  formatCertificationTitle,
} from "../utils/certifications";

interface HeaderProps {
  user: UserCV;
  options: OptionsPDF;
}

const buildLocationLabel = (user: UserCV) => {
  return formatPdfLocation({
    localidad: user.localidad,
    municipio: user.municipio,
    provincia: user.provincia,
    fallback: user.location,
  });
};

export const Layout4Header: React.FC<HeaderProps> = ({ user, options }) => {
  const styles = createLayout4Styles(options);

  const contactItems = [
    user.fechaNacimiento,
    user.dni ? `DNI: ${user.dni}` : "",
    user.phone ? `Tel: ${user.phone}` : "",
    user.email || "",
    buildLocationLabel(user),
  ].filter(Boolean);

  const additionalInfoItems = buildAdditionalInfoLines(user);

  const orderedCourses = options.reverseCourses
    ? [...(user.certifications || [])].reverse()
    : user.certifications || [];

  return (
    <View style={styles.leftColumn}>
      {options.showPhoto && user.photo && (
        <View style={styles.photoWrap}>
          {/* React PDF's Image is not an HTML img element, so alt-text does not apply here. */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={user.photo} style={styles.profileImage} />
        </View>
      )}

      {contactItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.leftSectionTitle}>CONTACTO</Text>
          {contactItems.map((item, index) => (
            <Text key={index} style={styles.leftText}>
              {item}
            </Text>
          ))}
        </View>
      )}

      {additionalInfoItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.leftSectionTitle}>INFORMACIÓN ADICIONAL</Text>
          {additionalInfoItems.map((item, index) => (
            <Text key={index} style={styles.leftText}>
              {item}
            </Text>
          ))}
        </View>
      )}

      {options.showCertifications && orderedCourses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.leftSectionTitle}>CURSOS Y CERTIFICACIONES</Text>
          {orderedCourses.map((course, index) => (
            <View key={index} style={styles.leftItemGroup}>
              <Text style={styles.leftItemTitle}>{formatCertificationTitle(course)}</Text>
              <Text style={styles.leftText}>{formatCertificationInstitution(course)}</Text>
              <Text style={styles.leftMeta}>{formatCertificationDate(course)}</Text>
            </View>
          ))}
        </View>
      )}

      {options.showSkills && user.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.leftSectionTitle}>HABILIDADES</Text>
          {user.skills.map((skill, index) => (
            <Text key={index} style={styles.leftBulletItem}>
              • {skill}
            </Text>
          ))}
        </View>
      )}

      {options.showLanguages && user.languages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.leftSectionTitle}>IDIOMAS</Text>
          {user.languages.map((lang, index) => (
            <Text key={index} style={styles.leftBulletItem}>
              • {lang.language}: {lang.level}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default Layout4Header;