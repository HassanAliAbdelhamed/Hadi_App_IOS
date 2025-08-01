import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useAudio } from "./audioContext";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function MiniPlayer() {
  
  const navigate = useNavigation();
  const {
    isPlaying,
    togglePlayPause,
    currentAudio,
    currentInfo,
    position,
    duration,
    seekTo,
    isExpanded,
    setIsExpanded,
  } = useAudio();

  if (!currentAudio || !currentInfo) return null;

  const { qareID, title, image, qaree } = currentInfo;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={toggleExpand}
      style={[styles.container, isExpanded && styles.expandedContainer]}
    >
      {isExpanded ? (
        <View style={styles.fullContainer} className="h-full">
          {/* زر الرجوع */}
          <TouchableOpacity style={styles.backButton} onPress={toggleExpand}>
            <SimpleLineIcons name="arrow-down" size={30} color="white" />
          </TouchableOpacity>

          {/* عنوان السورة واسم القارئ */}
          <View style={styles.header}>
            <Text style={styles.fullTitle}>{title}</Text>
            <Text style={styles.subTitle}>{qaree}</Text>
          </View>

          {/* صورة الغلاف */}
          <Image source={{ uri: image }} style={styles.fullCover} />

          {/* شريط التمرير */}

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={seekTo} // لا حاجة لضرب القيمة
            minimumTrackTintColor="#1DB954"
            maximumTrackTintColor="#888"
            thumbTintColor="#1DB954"
          />

          {/* الوقت */}
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* أزرار التحكم */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={() => seekTo(position - 10)}>
              <Ionicons name="play-back" size={40} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={40}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => seekTo(position + 10)}>
              <Ionicons name="play-forward" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.miniContent} className="w-full">
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            style={styles.iconWrapper}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={26}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.PressableImage}
            onPress={() => {
              qaree != "مباشر" &&
                navigate.navigate("qarePage", { id: qareID - 1 });
            }}
          >
            <Image source={{ uri: image }} style={styles.cover} />
          </TouchableOpacity>
          <View style={styles.left}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 47,
    width,
    backgroundColor: "#1c1c1c",
    borderTopColor: "#333",
    borderTopWidth: 1,
    zIndex: 100,
  },
  expandedContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width,
    height,
    backgroundColor: "#000",
    zIndex: 1000,
  },

  miniContent: {
    position: "relative",
    paddingVertical: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    backgroundColor: "#27292f",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderTopColor: "#639c6d",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    // flex: 1,
    gap: 12,
  },
  cover: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#639c6d",
    borderStyle: "solid",
    borderRadius: 25,
  },
  PressableImage: {
    position: "absolute",
    width:width -40,
    top: -25,
    left: width / 2 - 25,
    marginHorizontal: 8,
  },
  title: {
    color: "white",
    fontSize: 16,
    flexShrink: 1,
    fontFamily: "Cairo",
  },
  iconWrapper: {
    padding: 8,
  },
  fullContainer: {
    flex: 1,
    height: "100%",
    backgroundColor: "#27292f",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: '"#27292f"',
    borderRadius: 30,
    padding: 8,
    // borderRadius
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  fullTitle: {
    color: "white",
    fontSize: 28,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Noto",
  },
  subTitle: {
    color: "#ccc",
    fontSize: 18,
    fontFamily: "Cairo",
    textAlign: "center",
  },
  fullCover: {
    width: width - 40,
    height: width - 40,
    borderRadius: 20,
    marginBottom: 30,
    alignSelf: "center",
  },
  slider: {
    width: "100%",
    height: 40,
    marginTop: 30,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -10,
    marginBottom: 10,
  },
  timeText: {
    color: "#bbb",
    fontSize: 14,
    fontFamily: "Cairo",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
  },
  playButton: {
    backgroundColor: "#1DB954",
    borderRadius: 50,
    padding: 20,
  },
});
