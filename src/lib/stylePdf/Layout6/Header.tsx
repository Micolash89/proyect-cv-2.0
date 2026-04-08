import React from "react";
import { Image, Text, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout6Styles } from "./styles";
import { formatPdfLocation } from "../utils/location";

interface HeaderProps {
  user: UserCV;
  options: OptionsPDF;
}

interface ContactLine {
  label: string;
  value: string;
}

const buildContactLines = (user: UserCV): ContactLine[] => {
  const location = formatPdfLocation({
    localidad: user.localidad,
    municipio: user.municipio,
    provincia: user.provincia,
    fallback: user.location,
  });
  const social = user.github || user.linkedin || user.links || "";

  return [
    { label: "Correo:", value: user.email || "" },
    { label: "Teléfono:", value: user.phone || "" },
    { label: "Dirección:", value: location },
    { label: "Redes sociales:", value: social },
  ].filter((item) => Boolean(item.value));
};

export const Layout6Header: React.FC<HeaderProps> = ({ user, options }) => {
  const styles = createLayout6Styles(options);
  const contactLines = buildContactLines(user);

  const fullNameText = options.fullName
    ? user.fullName
    : user.fullName.split(" ").slice(0, 2).join(" ");

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {options.showPhoto && user.photo ? (
          // React PDF's Image is not an HTML img element, so alt-text does not apply here.
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={user.photo} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImageFallback} />
        )}
      </View>

      <View style={styles.headerCenter}>
        <Text style={styles.name}>{fullNameText}</Text>
        <View style={styles.contactInfo}>
          {contactLines.map((item, index) => (
            <View key={index} style={styles.contactRow}>
              <Text style={styles.contactLabel}>{item.label}</Text>
              <Text style={styles.contactValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default Layout6Header;