import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout0Styles } from "./styles";
import { formatPdfLocation } from "../utils/location";
import { formatBirthdateForPdf } from "../utils/certifications";

export interface HeaderProps {
  user: UserCV;
  options: OptionsPDF;
}

export const Layout0Header: React.FC<HeaderProps> = ({ user, options }) => {
  const styles = createLayout0Styles(options);

  const fullNameText = options.fullName
    ? user.fullName
    : user.fullName.split(" ").slice(0, 2).join(" ");

  const locationLabel = formatPdfLocation({
    localidad: user.localidad,
    municipio: user.municipio,
    provincia: user.provincia,
    fallback: user.location,
  });
  const contactItems = [
    locationLabel,
    formatBirthdateForPdf(user.fechaNacimiento),
    user.linkedin,
    user.phone,
    user.email,
  ].filter(Boolean);

  return (
    <View style={styles.header}>
      <View style={styles.headerInfo}>
        <Text style={styles.name}>{fullNameText}</Text>
        <View style={styles.contactInfo}>
          {contactItems.map((item, index) => (
            <Text key={index} style={styles.contactItem}>
              {index > 0 ? ` · ${item}` : item}
            </Text>
          ))}
        </View>
      </View>
      {options.showPhoto && user.photo && (
        // React PDF's Image is not an HTML img element, so alt-text does not apply here.
         // eslint-disable-next-line jsx-a11y/alt-text
        <Image src={user.photo} style={styles.photo} />
      )}
    </View>
  );
};

export default Layout0Header;
