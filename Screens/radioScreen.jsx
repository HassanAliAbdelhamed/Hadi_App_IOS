import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import quraa from "../assets/Apis/radioQuraa";
import AllColors from "../assets/Colors";
import playTrack from "../Components/playTrack";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Components/Header";

export default function RadioScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const refreshHandler = useCallback(() => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  const handlePlay = useCallback((item) => {
    playTrack({
      swaraId: item.id,
      audioSrc: item.Audiosource,
      image: item.img,
      SwaraTitle: item.title,
      QareTitle: "مباشر",
    });
  }, []);

  const renderCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={Styles.card}
      activeOpacity={0.7}
      onPress={() => handlePlay(item)}
    >
      <Image source={{ uri: item.img }} style={Styles.cardImage} resizeMode="cover" />
      <View style={Styles.textContainer}>
        <Text style={Styles.subtitle}>القارئ الشيخ</Text>
        <Text style={Styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
      <MaterialIcons name="radio" size={24} color={AllColors.greenColor} style={Styles.icon} />
    </TouchableOpacity>
  ), [handlePlay]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AllColors.BlackBackgroundColor }}>
    <View style={Styles.container}>
      <Header title="الراديو" />
      <FlatList
        data={quraa}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={Styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshHandler} />
        }
      />
    </View>
    </SafeAreaView>

  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AllColors.blackCardColor,
  },
  listContent: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 8,
    aspectRatio: 1,
    backgroundColor: AllColors.BlackBackgroundColor,
    borderRadius: 16,
    overflow: "hidden", // مهم لجعل حواف الصورة متناسقة مع حواف الكارد
    borderWidth: 1,
  },
  cardImage: {
    width: "100%",
    height: "60%", // تأخذ 60% من طول الكارد
  },
  textContainer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  subtitle: {
    fontSize: 10,
    color: "#AAA",
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    color: "#FFF",
    textAlign: "center",
    fontFamily: "Cairo",
  },
  icon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 2,
  },
});