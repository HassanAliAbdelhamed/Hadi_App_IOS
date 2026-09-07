import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // مكتبة أيقونات إكسبو
import AllColors from "../assets/Colors";
import Logo from "../assets/images/Logo.png";

function Header() {
  return (
    <View style={Styles.Header}>
      <View style={Styles.HeaderRow}>
        <Image source={Logo} style={Styles.Logo} />        
        <TouchableOpacity 
          style={Styles.SettingsButton} 
          onPress={() => {}}
        >
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Styles = StyleSheet.create({
  Header: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 3,
    borderBottomColor: AllColors.shadowblackColor,
  },
  HeaderRow: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    flexDirection: "row",
  },
  HeaderText: {
    color: "white",
    fontSize: 22,
    fontFamily: "Cairo",
  },
  Logo: {
    width: 60,  
    height: 60,
  },
  SettingsButton: {
    padding: 8,
    borderRadius: 8,
  },
  Plus: {
    color: AllColors.greenColor,
  },
});

export default Header;