import React from "react";
import { Image, Text, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout5Styles } from "./styles";

interface HeaderProps {
  user: UserCV;
  options: OptionsPDF;
}

export const Layout5Header: React.FC<HeaderProps> = ({ user, options }) => {
  const styles = createLayout5Styles(options);

  const fullNameText = options.fullName
    ? user.fullName
    : user.fullName.split(" ").slice(0, 2).join(" ");

  const [firstName = "", ...lastNameParts] = fullNameText.split(" ");
  const lastName = lastNameParts.join(" ") || firstName;
  const profileOrientation = user.targetJob || user.experience[0]?.position || "";

  return (
    <View style={styles.topHeader}>
      <View style={styles.headerImageColumn}>
        {options.showPhoto && user.photo ? (
          // React PDF's Image is not an HTML img element, so alt-text does not apply here.
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={user.photo} style={styles.headerImage} />
        ) : (
          <View style={styles.headerImageFallback} />
        )}
      </View>

      <View style={styles.headerNameColumn}>
        <Text style={styles.firstName}>{firstName.toUpperCase()}</Text>
        <Text style={styles.lastName}>{lastName.toUpperCase()}</Text>
        {options.showOrientation && profileOrientation ? (
          <Text style={styles.orientationText}>{profileOrientation}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default Layout5Header;