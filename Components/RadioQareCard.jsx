import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CARD_COLORS = ["#2C3E35", "#34493E", "#3D5448", "#26372F", "#455E51"];
const GOLD = "#D4AF37";
const GREEN = "#689F38";
const TEXT_LIGHT = "#ECEFF1";
const TEXT_MUTED = "#9E9E9E";
const BG_DARK = "#161817";

const EQ_BARS = 5;

const RadioQareCard = ({ cardinfo, facIconState, horizontal, index = 0 }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigation();
  const cardColor = CARD_COLORS[index % CARD_COLORS.length];

  // نبضة مؤشر "البث المباشر"
  const liveDotPulse = useRef(new Animated.Value(0.4)).current;
  // أعمدة الـ equalizer الصغيرة اللي بتتحرك زي مؤشر صوت شغال
  const eqAnims = useRef(
    Array.from({ length: EQ_BARS }, () => new Animated.Value(4))
  ).current;

  useEffect(() => {
    const dotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotPulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(liveDotPulse, {
          toValue: 0.35,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    dotLoop.start();

    const eqLoops = eqAnims.map((val, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 8 + ((i * 5) % 12),
            duration: 380 + i * 90,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(val, {
            toValue: 3,
            duration: 380 + i * 90,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      )
    );
    eqLoops.forEach((l) => l.start());

    return () => {
      dotLoop.stop();
      eqLoops.forEach((l) => l.stop());
    };
  }, []);

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const favData = await AsyncStorage.getItem("FavQuraa");
        if (favData) {
          const favList = JSON.parse(favData);
          setIsFavorite(favList.includes(cardinfo.id));
        }
      } catch (e) {
        console.warn("Error checking favorites:", e.message);
      }
    };
    checkFavorite();
  }, [cardinfo.id]);

  const handleToggleFavorite = async () => {
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    if (newValue) {
      await addQareToFav(cardinfo.id);
    } else {
      await removeQareFromFav(cardinfo.id);
    }
  };

  const removeQareFromFav = async (id) => {
    try {
      const existingFavQuraa = await AsyncStorage.getItem("FavQuraa");
      if (existingFavQuraa !== null) {
        let favQuraaArr = JSON.parse(existingFavQuraa);
        const updatedFav = favQuraaArr.filter((qareId) => qareId !== id);
        await AsyncStorage.setItem("FavQuraa", JSON.stringify(updatedFav));
      }
    } catch (e) {
      console.log(`Error removing ${id} from favorites`);
    }
  };

  const addQareToFav = async (id) => {
    try {
      const existingFavQuraa = await AsyncStorage.getItem("FavQuraa");
      let favQuraaArr = [];
      if (existingFavQuraa != null) {
        favQuraaArr = JSON.parse(existingFavQuraa);
      }
      if (!favQuraaArr.includes(id)) {
        favQuraaArr.push(id);
        await AsyncStorage.setItem("FavQuraa", JSON.stringify(favQuraaArr));
      }
    } catch (e) {
      console.log(`Error adding ${id} to favorite quraa`);
    }
  };

  const EqualizerRow = ({ style }) => (
    <View style={[Styles.eqRow, style]} pointerEvents="none">
      {eqAnims.map((val, i) => (
        <Animated.View key={i} style={[Styles.eqBar, { height: val }]} />
      ))}
    </View>
  );

  // شكل عمودي (دايرة + اسم تحتها) زي كروت "الأكثر استماعاً" في التصميم
  if (horizontal) {
    return (
      <TouchableOpacity
        style={Styles.verticalCard}
        onPress={() => navigate.navigate("qarePage", { id: cardinfo.id - 1 })}
      >
        <View style={Styles.verticalImageRing}>
          <Image source={{ uri: cardinfo.img }} style={Styles.verticalImage} />
          <View style={Styles.verticalLiveBadge}>
            <Animated.View
              style={[Styles.liveDot, { opacity: liveDotPulse }]}
            />
          </View>
        </View>
        <Text style={Styles.verticalTitle} numberOfLines={1}>
          {cardinfo.title}
        </Text>
        {cardinfo.subtitle ? (
          <Text style={Styles.verticalSubtitle} numberOfLines={1}>
            {cardinfo.subtitle}
          </Text>
        ) : null}
        <EqualizerRow style={{ marginTop: 6 }} />
      </TouchableOpacity>
    );
  }

  // الشكل الأفقي - جسم "راديو" بإطار دهبي ومؤشر بث ومؤشر صوت
  return (
    <View style={Styles.bodyStyle}>
      <TouchableOpacity
        style={[Styles.card, { backgroundColor: cardColor }]}
        onPress={() => navigate.navigate("qarePage", { id: cardinfo.id - 1 })}
      >
        {/* خطوط الأنتينا الزخرفية أعلى الكارت */}
        <View style={Styles.antennaWrap} pointerEvents="none">
          <View style={[Styles.antennaLine, Styles.antennaLineLeft]} />
          <View style={[Styles.antennaLine, Styles.antennaLineRight]} />
        </View>

        <View style={Styles.bodyConainer}>
          <View style={Styles.imageRing}>
            <Image source={{ uri: cardinfo.img }} style={Styles.cardImage} />
          </View>
          <View style={Styles.TextsStyle}>
            <View style={Styles.liveRow}>
              <Animated.View
                style={[Styles.liveDot, { opacity: liveDotPulse }]}
              />
              <Text style={Styles.cardBoxTitle}>القارئ الشيخ</Text>
            </View>
            <Text style={Styles.cardTitle} numberOfLines={1}>
              {cardinfo.title}
            </Text>
            <EqualizerRow />
          </View>
        </View>

        <View style={Styles.knobsColumn}>
          <View style={Styles.iconKnob}>
            <MaterialIcons name="headphones" size={22} style={Styles.icon} />
          </View>
          {facIconState && (
            <TouchableOpacity
              style={Styles.iconKnob}
              onPress={handleToggleFavorite}
            >
              <FontAwesome
                name={isFavorite ? "heart" : "heart-o"}
                size={17}
                color={isFavorite ? GOLD : TEXT_LIGHT}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const Styles = StyleSheet.create({
  bodyStyle: {
    backgroundColor: BG_DARK,
    paddingHorizontal: 8,
    flex: 1,
  },
  card: {
    marginTop: 5,
    width: "100%",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: GOLD,
    overflow: "hidden",
  },
  antennaWrap: {
    position: "absolute",
    top: -6,
    right: 18,
  },
  antennaLine: {
    position: "absolute",
    width: 2,
    height: 16,
    backgroundColor: GOLD,
    borderRadius: 1,
    opacity: 0.6,
  },
  antennaLineLeft: {
    transform: [{ rotate: "-18deg" }],
    left: -6,
  },
  antennaLineRight: {
    transform: [{ rotate: "18deg" }],
    left: 6,
  },
  bodyConainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  imageRing: {
    borderRadius: 42,
    borderWidth: 2,
    borderColor: GOLD,
    padding: 2,
    marginHorizontal: 10,
  },
  cardImage: {
    width: 68,
    height: 68,
    borderRadius: 36,
  },
  cardBoxTitle: {
    fontSize: 10,
    color: TEXT_MUTED,
    textAlign: "left",
    fontFamily: "Cairo",
  },
  cardTitle: {
    fontSize: 16,
    color: TEXT_LIGHT,
    textAlign: "left",
    fontWeight: "600",
    fontFamily: "Cairo",
    marginTop: 2,
  },
  TextsStyle: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E53935",
    marginRight: 5,
  },
  eqRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 6,
    height: 16,
  },
  eqBar: {
    width: 3,
    marginRight: 3,
    borderRadius: 2,
    backgroundColor: GREEN,
  },
  knobsColumn: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconKnob: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: GOLD,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  icon: {
    color: GREEN,
  },
  // ستايلات الشكل العمودي (للأكثر استماعاً)
  verticalCard: {
    width: 160,
    marginHorizontal: 6,
    alignItems: "center",
  },
  verticalImageRing: {
    width: 150,
    height: 150,
    borderRadius: 18,
    borderColor: GOLD,
    borderWidth: 2,
    marginBottom: 8,
    padding: 2,
  },
  verticalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  verticalLiveBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(22,24,23,0.85)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: GOLD,
  },
  verticalTitle: {
    fontSize: 18,
    color: TEXT_LIGHT,
    fontWeight: "600",
    fontFamily: "Cairo",
    textAlign: "center",
  },
  verticalSubtitle: {
    fontSize: 12,
    color: GREEN,
    textAlign: "center",
  },
});

export default React.memo(RadioQareCard);