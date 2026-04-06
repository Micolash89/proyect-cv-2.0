import React from "react";
import { Image, Text, View } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout3Styles } from "./styles";

interface HeaderProps {
  user: UserCV;
  options: OptionsPDF;
}

export const Layout3Header: React.FC<HeaderProps> = ({ user, options }) => {
  const styles = createLayout3Styles(options);

  const fullNameText = options.fullName
    ? user.fullName
    : user.fullName.split(" ").slice(0, 2).join(" ");

  const profession = user.targetJob || user.experience[0]?.position || "";

  return (
    <View style={styles.topHeader}>
      {options.showPhoto && user.photo && (
        <View style={styles.photoFrame}>
          {/* React PDF's Image is not an HTML img element, so alt-text does not apply here. */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={user.photo} style={styles.profileImage} />
        </View>
      )}

      <View style={styles.headerTextBlock}>
        <Text style={styles.name}>{fullNameText}</Text>
        {profession ? <Text style={styles.profession}>{profession}</Text> : null}
      </View>
    </View>
  );
};

export default Layout3Header;