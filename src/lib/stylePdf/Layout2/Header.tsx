import React from "react";
import { Image, Text, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout2Styles } from "./styles";
import { formatPdfLocation } from "../utils/location";
import { buildAdditionalInfoLines, formatBirthdateForPdf } from "../utils/certifications";

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

export const Layout2Header: React.FC<HeaderProps> = ({ user, options }) => {
  const styles = createLayout2Styles(options);

  const additionalInfoItems = buildAdditionalInfoLines(user);

  const fullNameText = options.fullName
    ? user.fullName
    : user.fullName.split(" ").slice(0, 2).join(" ");

  const [firstName, ...lastNameParts] = fullNameText.split(" ");
  const lastName = lastNameParts.join(" ");
  const profession = user.targetJob || user.experience[0]?.position || "";

  const contactItems = [
    formatBirthdateForPdf(user.fechaNacimiento),
    user.dni ? `DNI: ${user.dni}` : "",
    user.phone ? `Tel: ${user.phone}` : "",
    user.email || "",
    buildLocationLabel(user),
    user.links || "",
  ].filter(Boolean);

  return (
    <View style={styles.leftColumn}>
      {options.showPhoto && user.photo && (
        <View style={styles.profileImageWrapper}>
          {/* React PDF's Image is not an HTML img element, so alt-text does not apply here. */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={user.photo} style={styles.profileImage} />
        </View>
      )}

      <Text style={styles.name}>{firstName}</Text>
      <Text style={styles.name}>{lastName}</Text>
      {options.showOrientation && profession ? (
        <Text style={styles.profession}>{profession}</Text>
      ) : null}

      <View style={styles.sidebarContactGroup}>
        {contactItems.map((item, index) => (
          <Text key={index} style={styles.contactItem}>
            {item}
          </Text>
        ))}
      </View>

      {options.showSkills && user.skills.length > 0 && (
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionTitle}>Habilidades</Text>
          {user.skills.map((skill, index) => (
            <Text key={index} style={styles.skillPill}>
              {skill}
            </Text>
          ))}
        </View>
      )}

      {options.showLanguages && user.languages.length > 0 && (
        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionTitle}>Idiomas</Text>
          {user.languages.map((lang, index) => (
            <Text key={index} style={styles.sidebarListItem}>
              {lang.language} - {lang.level}
            </Text>
          ))}
        </View>
      )}
      {additionalInfoItems.length > 0 && (
        <View style={[styles.sidebarSection, { marginTop: 10 }]}>
          <Text style={styles.sidebarSectionTitle}>Información adicional</Text>
          {additionalInfoItems.map((item, index) => (
            <Text key={index} style={styles.sidebarListItem}>
              {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default Layout2Header;
