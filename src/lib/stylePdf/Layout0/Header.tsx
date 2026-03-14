import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout0Styles } from "./styles";

interface HeaderProps {
  user: UserCV;
  options: OptionsPDF;
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

export const Layout0Header: React.FC<HeaderProps> = ({ user, options }) => {
  const styles = createLayout0Styles(options);

  const fullNameText = options.fullName 
    ? user.fullName 
    : user.fullName.split(" ").slice(0, 2).join(" ");

  return (
    <View style={styles.header} fixed={false}>
      <View style={styles.headerInfo}>
        <Text style={styles.name}>{fullNameText}</Text>
        <View style={styles.contactInfo}>
          {user.location && (
            <Text style={styles.contactItem}>{user.location}</Text>
          )}
          {user.phone && (
            <Text style={styles.contactItem}>{user.phone}</Text>
          )}
          {user.email && (
            <Text style={styles.contactItem}>{user.email}</Text>
          )}
          {user.linkedin && (
            <Text style={styles.contactItem}>LinkedIn</Text>
          )}
        </View>
      </View>
      {options.showPhoto && user.photo && (
        <Image src={user.photo} style={styles.photo} />
      )}
    </View>
  );
};

export default Layout0Header;
