import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AllColors from "../assets/Colors";

export default function OfflineState({ onRetry, message = "تعذر تحميل البيانات" }) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="cloud-off" size={46} color={AllColors.greenColor} />
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>إعادة المحاولة</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  message: {
    color: "white",
    fontFamily: "Cairo",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: AllColors.greenColor,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: "white",
    fontFamily: "Cairo",
    fontSize: 14,
  },
});
