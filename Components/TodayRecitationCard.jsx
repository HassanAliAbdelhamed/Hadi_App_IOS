import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AllColors from "../assets/Colors";
import { getTodayRecitation } from "../assets/Apis/quraaApi";
import playTrack from "./playTrack";

const TodayRecitationCard = ({ data: initialData }) => {
  const [recitation, setRecitation] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  useEffect(() => {
    if (!initialData) {
      const fetchData = async () => {
        try {
          const res = await getTodayRecitation();
          setRecitation(res);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [initialData]);

  if (loading) {
    return (
      <View style={[styles.cardContainer, styles.center]}>
        <ActivityIndicator color={AllColors.greenColor || "#2b8a3e"} size="large" />
      </View>
    );
  }

  if (!recitation) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardContainer}
      onPress={() => {
        playTrack({
          swaraId: recitation.surahId,
          qareId: recitation.qareId,
          surahNumber: recitation.surahId,
          audioSrc: recitation.audioUrl,
          image: recitation.imageUrl,
          SwaraTitle: recitation.surahName,
          QareTitle: recitation.qareName,
        });
      }}
    >
      <ImageBackground
        source={{ uri: recitation.imageUrl }}
        style={styles.backgroundImage}
        imageStyle={{ borderRadius: 16 }}
      >
        {/* طبقة تظليل داكنة لإبراز النصوص */}
        <View style={styles.overlay}>
          {/* شارة تلاوة اليوم */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>تلاوة اليوم</Text>
          </View>

          {/* اسم السورة والقارئ */}
          <View style={styles.contentContainer}>
            <Text style={styles.surahTitle}>سورة {recitation.surahName}</Text>
            <Text style={styles.subTitle}>
              الشيخ {recitation.qareName}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    direction:"ltr",
    width: "100%",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 10,
    backgroundColor: "#1c1e22",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "flex-end", // لترتيب العناصر جهة اليمين (RTL)
  },
  badge: {
    backgroundColor: "rgba(40, 90, 70, 0.75)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "flex-end",
  },
  badgeText: {
    color: "#a4e5bc",
    fontSize: 12,
    // fontWeight: "bold",
    fontFamily: "Cairo",
  },
  contentContainer: {
    width: "100%",
    alignItems: "flex-end",
  },
  surahTitle: {
    fontSize: 28,
    // fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "Cairo",
    marginBottom: 2,
    textAlign: "right",
  },
  subTitle: {
    fontSize: 14,
    color: "#d0d0d0",
    fontFamily: "Cairo",
    textAlign: "right",
  },
});

export default TodayRecitationCard;