import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text as RNText,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  Dimensions,
  Modal,
} from "react-native";
import { GetRandomQuraa, getRandomSuarOfQare } from "../assets/Apis/quraaApi";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Components/Header";
import AllColors from "../assets/Colors";

const { width } = Dimensions.get("window");

const COLORS = ["#2C3E35", "#34493E", "#3D5448", "#26372F", "#455E51"];

const ITEM_HEIGHT = 65;
const VISIBLE_COUNT = 5;
const REEL_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const CENTER_OFFSET = REEL_HEIGHT / 2 - ITEM_HEIGHT / 2;
const ROUNDS_BEFORE_LANDING = 6;
const TRAILING_ROUNDS = 2;

// دالة مساعدة لاستخراج رابط الصورة بأي صيغة كانت من الـ API
const getImageUrl = (qari) => {
  if (!qari) return null;
  const imgData = qari.img || qari.Image || qari.image || qari.photo || qari.imageUrl;

  if (typeof imgData === "string") {
    return imgData;
  } else if (typeof imgData === "object" && imgData !== null) {
    return imgData.url || imgData.uri || null;
  }

  return null;
};

const buildReel = (items, selectedIndex) => {
  const safeItems = Array.isArray(items) ? items : [];
  if (safeItems.length === 0) return { data: [], targetIndex: 0 };

  let data = [];
  for (let r = 0; r < ROUNDS_BEFORE_LANDING; r++) {
    data = data.concat(safeItems);
  }
  const targetIndex = data.length + selectedIndex;
  data = data.concat(safeItems);
  for (let r = 0; r < TRAILING_ROUNDS; r++) {
    data = data.concat(safeItems);
  }
  return { data, targetIndex };
};

function ReelCard({ item, index, reelScroll, colorIndex, isSurahMode }) {
  const itemCenterPos = index * ITEM_HEIGHT - CENTER_OFFSET;
  const distance = Animated.subtract(itemCenterPos, reelScroll);

  const opacity = distance.interpolate({
    inputRange: [-2 * ITEM_HEIGHT, -ITEM_HEIGHT, 0, ITEM_HEIGHT, 2 * ITEM_HEIGHT],
    outputRange: [0.18, 0.5, 1, 0.5, 0.18],
    extrapolate: "clamp",
  });

  const scale = distance.interpolate({
    inputRange: [-2 * ITEM_HEIGHT, -ITEM_HEIGHT, 0, ITEM_HEIGHT, 2 * ITEM_HEIGHT],
    outputRange: [0.72, 0.88, 1.1, 0.88, 0.72],
    extrapolate: "clamp",
  });

  // قراءة نوع السورة سواء كانت swaraType أو type
  const itemType = item?.swaraType || item?.type;

  return (
    <View style={styles.reelSlot}>
      <Animated.View
        style={[
          styles.reelCard,
          {
            backgroundColor: COLORS[colorIndex % COLORS.length],
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <RNText style={styles.reelCardText} numberOfLines={1}>
          {item?.title || item?.name || ""}
          {isSurahMode && itemType ? ` (${itemType})` : ""}
        </RNText>
      </Animated.View>
    </View>
  );
}

export default function RandomPickerScreen({ navigation, playTrack }) {
  const [quraa, setQuraa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [surahLoading, setSurahLoading] = useState(false);

  const [surahOptions, setSurahOptions] = useState([]);

  const [selectedQari, setSelectedQari] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);

  const [mode, setMode] = useState("qari");
  const [isSpinning, setIsSpinning] = useState(false);

  const [reelData, setReelData] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const reelScroll = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  const rawItems = mode === "qari" ? quraa : surahOptions;
  const currentItems = Array.isArray(rawItems) ? rawItems : [];

  const fetchQuraaData = async () => {
    try {
      setLoading(true);
      const quraaData = await GetRandomQuraa();
      const sampledQuraa = Array.isArray(quraaData) ? quraaData : [];
      setQuraa(sampledQuraa);
      setReelData(sampledQuraa);
    } catch (error) {
      console.log("Error loading quraa data:", error);
      setQuraa([]);
      setReelData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuraaData();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowPulse]);

  const handlePlay = (qari, surah) => {
    const baseUrl = qari?.AudioSource || qari?.audioSource || "";
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const fullAudioSrc = `${cleanBaseUrl}${surah?.audioUrl}`;

    const imageUrl = getImageUrl(qari);

    const trackData = {
      swaraId: surah?.id,
      audioSrc: fullAudioSrc,
      image: imageUrl,
      SwaraTitle: surah?.title,
      QareTitle: qari?.title || qari?.Title || qari?.name,
    };

    if (typeof playTrack === "function") {
      playTrack(trackData);
    }

    navigation?.navigate("MiniPlayer", trackData);
  };

  const resetAll = () => {
    setSelectedQari(null);
    setSelectedSurah(null);
    setMode("qari");
    setSurahOptions([]);
    reelScroll.setValue(0);
    fetchQuraaData();
  };

  const handleSpin = () => {
    if (isSpinning || currentItems.length === 0) return;

    setIsSpinning(true);
    const itemCount = currentItems.length;
    const selectedIndex = Math.floor(Math.random() * itemCount);

    const { data, targetIndex } = buildReel(currentItems, selectedIndex);
    setReelData(data);
    reelScroll.setValue(0);

    const targetScrollY =
      targetIndex * ITEM_HEIGHT + ITEM_HEIGHT / 2 - REEL_HEIGHT / 2;

    Animated.timing(reelScroll, {
      toValue: targetScrollY,
      duration: 4200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      setIsSpinning(false);
      const chosenItem = currentItems[selectedIndex];

      if (mode === "qari") {
        setSelectedQari(chosenItem);

        try {
          setSurahLoading(true);
          const suarData = await getRandomSuarOfQare(chosenItem.id);
          const safeSuarData = Array.isArray(suarData) ? suarData : [];
          
          setSurahOptions(safeSuarData);
          setReelData(safeSuarData); // تحديث العجلة بالسور الجديدة مباشرة
          reelScroll.setValue(0);    // إرجاع قيمة السكرول للبداية

          setModalTitle("تم اختيار القارئ 🎧");
          setModalText(`الشيخ ${chosenItem?.title || chosenItem?.name || ""}`);
          setModalVisible(true);

          setMode("surah");
        } catch (error) {
          console.log("Error fetching surah for qari:", error);
          setSurahOptions([]);
          setReelData([]);
        } finally {
          setSurahLoading(false);
        }
      } else {
        setSelectedSurah(chosenItem);
        setMode("completed");

        const surahType = chosenItem?.swaraType || chosenItem?.type || "";
        setModalTitle("تم اختيار السورة 📖");
        setModalText(`${chosenItem?.title || ""} (${surahType})`);
        setModalVisible(true);
      }
    });
  };

  if (loading || surahLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#528265" />
        <RNText style={styles.loadingText}>
          {surahLoading ? "جاري تحميل سور القارئ..." : "جاري تحميل البيانات..."}
        </RNText>
      </View>
    );
  }

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.9],
  });
  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.screenContainer}>
        <View style={styles.headerGroup}>
          <RNText style={styles.headerTitle}>القرعة العشوائية</RNText>
          <RNText style={styles.subtitle}>
            {mode === "qari"
              ? "اضغط ابدأ لاختيار القارئ"
              : mode === "surah"
              ? `القارئ: ${selectedQari?.title || selectedQari?.name} (ابدأ لاختيار السورة)`
              : "تم الاختيار بنجاح!"}
          </RNText>
        </View>

        <View style={styles.reelWrapper}>
          <View style={[styles.sideArrow, styles.sideArrowRight]}>
            <RNText style={styles.arrowText}>◀</RNText>
          </View>

          <View style={[styles.sideArrow, styles.sideArrowLeft]}>
            <RNText style={styles.arrowText}>▶</RNText>
          </View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.highlightFrame,
              { opacity: glowOpacity, transform: [{ scale: glowScale }] },
            ]}
          />

          <View style={styles.reelViewport}>
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: Animated.multiply(reelScroll, -1),
                  },
                ],
              }}
            >
              {Array.isArray(reelData) &&
                reelData.map((item, index) => {
                  const originalIndex = currentItems.findIndex(
                    (it) => it?.id === item?.id
                  );
                  return (
                    <ReelCard
                      key={`reel-${index}`}
                      item={item}
                      index={index}
                      reelScroll={reelScroll}
                      colorIndex={originalIndex >= 0 ? originalIndex : index}
                      isSurahMode={mode === "surah"}
                    />
                  );
                })}
            </Animated.View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {mode !== "completed" ? (
            <TouchableOpacity
              style={[
                styles.button,
                (isSpinning || currentItems.length === 0) && styles.disabledButton,
              ]}
              onPress={handleSpin}
              disabled={isSpinning || currentItems.length === 0}
            >
              <RNText style={styles.buttonText}>
                {isSpinning
                  ? "جاري الاختيار..."
                  : mode === "qari"
                  ? "ابدأ اختيار القارئ"
                  : "ابدأ اختيار السورة"}
              </RNText>
            </TouchableOpacity>
          ) : (
            <View style={styles.resultBox}>
              <RNText style={styles.resultSparkle}>✨</RNText>
              <RNText style={styles.resultText}>
                📖 {selectedSurah?.title} ({selectedSurah?.swaraType || selectedSurah?.type || ""})
              </RNText>
              <RNText style={styles.resultSubText}>
                بصوت الشيخ {selectedQari?.title || selectedQari?.name}
              </RNText>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={resetAll}
                >
                  <RNText style={styles.buttonText}>إعادة الاختيار</RNText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePlay(selectedQari, selectedSurah)}
                >
                  <RNText style={styles.buttonText}>اذهب للاستماع</RNText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <RNText style={styles.modalTitleText}>{modalTitle}</RNText>
            <RNText style={styles.modalBodyText}>{modalText}</RNText>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <RNText style={styles.modalButtonText}>متابعة</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AllColors.BlackBackgroundColor,
  },
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  headerGroup: {
    alignItems: "center",
    width: "100%",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: AllColors.BlackBackgroundColor,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#B0BEC5",
    marginTop: 10,
    fontFamily: "Cairo",
  },
  headerTitle: {
    color: "#689F38",
    fontSize: 22,
    fontFamily: "Cairo",
    fontWeight: "600",
  },
  subtitle: {
    color: "#9E9E9E",
    fontSize: 14,
    fontFamily: "Cairo",
    marginTop: 5,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  reelWrapper: {
    width: width * 0.85,
    alignItems: "center",
    justifyContent: "center",
  },
  reelViewport: {
    width: "100%",
    height: REEL_HEIGHT,
    overflow: "hidden",
  },
  reelSlot: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
  },
  reelCard: {
    flex: 1,
    marginVertical: 3,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0F0F0F",
  },
  reelCardText: {
    color: "#ECEFF1",
    fontSize: 17,
    fontFamily: "Cairo",
  },
  highlightFrame: {
    position: "absolute",
    width: "104%",
    height: ITEM_HEIGHT + 10,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: "#D4AF37",
    zIndex: 5,
  },
  sideArrow: {
    position: "absolute",
    zIndex: 6,
    top: REEL_HEIGHT / 2 - 12,
  },
  sideArrowRight: {
    right: -18,
  },
  sideArrowLeft: {
    left: -18,
  },
  arrowText: {
    color: "#D4AF37",
    fontSize: 20,
  },
  actionsContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#3B6E52",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    marginHorizontal: 5,
  },
  secondaryButton: {
    backgroundColor: "#8C3A3A",
  },
  disabledButton: {
    backgroundColor: "#2A4737",
    opacity: 0.6,
  },
  buttonText: {
    color: "#ECEFF1",
    fontSize: 15,
    fontFamily: "Cairo",
  },
  resultBox: {
    alignItems: "center",
  },
  resultSparkle: {
    fontSize: 22,
    marginBottom: 4,
  },
  resultText: {
    color: "#FFFFFF",
    fontSize: 20,
    marginBottom: 5,
    fontFamily: "Cairo",
  },
  resultSubText: {
    color: "#81C784",
    fontSize: 16,
    marginBottom: 15,
    fontFamily: "Cairo",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#212523",
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3B6E52",
    elevation: 8,
  },
  modalTitleText: {
    color: "#81C784",
    fontSize: 18,
    fontFamily: "Cairo",
    marginBottom: 8,
  },
  modalBodyText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Cairo",
    textAlign: "center",
    marginVertical: 10,
  },
  modalButton: {
    marginTop: 15,
    backgroundColor: "#3B6E52",
    paddingHorizontal: 28,
    paddingVertical: 9,
    borderRadius: 18,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Cairo",
  },
});