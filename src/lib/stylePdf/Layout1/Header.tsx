import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { UserCV } from "@/types";
import { OptionsPDF } from "../definitions";
import { createLayout1Styles } from "./styles";

interface HeaderProps {
  user: UserCV;
  options: OptionsPDF;
}

export const Layout1Header: React.FC<HeaderProps> = ({ user, options }) => {
  const styles = createLayout1Styles(options);

  const fullNameText = options.fullName 
    ? user.fullName 
    : user.fullName.split(" ").slice(0, 2).join(" ");

  const nameLines = fullNameText.split(" ");
  const firstName = nameLines[0] || "";
  const lastName = nameLines.slice(1).join(" ");

  return (
    <View style={styles.sidebar} fixed={false}>
      {options.showPhoto && user.photo && (
        <View style={{ marginBottom: 15 }}>
          <Image src={user.photo} style={styles.profileImage} />
        </View>
      )}
      
      <Text style={styles.sidebarName}>{firstName}</Text>
      <Text style={styles.sidebarName}>{lastName}</Text>

      <View style={styles.sidebarContact}>
        {user.phone && (
          <Text style={styles.sidebarContactItem}>Tel: {user.phone}</Text>
        )}
        {user.email && (
          <Text style={styles.sidebarContactItem}>{user.email}</Text>
        )}
        {user.location && (
          <Text style={styles.sidebarContactItem}>{user.location}</Text>
        )}
      </View>

      {options.showSkills && user.skills.length > 0 && (
        <>
          <Text style={styles.sidebarSectionTitle}>HABILIDADES</Text>
          {user.skills.map((skill, index) => (
            <Text key={index} style={styles.skillItem}>• {skill}</Text>
          ))}
        </>
      )}

      {options.showLanguages && user.languages.length > 0 && (
        <>
          <Text style={styles.sidebarSectionTitle}>IDIOMAS</Text>
          {user.languages.map((lang, index) => (
            <Text key={index} style={styles.skillItem}>
              • {lang.language} - {lang.level}
            </Text>
          ))}
        </>
      )}
    </View>
  );
};

export default Layout1Header;
