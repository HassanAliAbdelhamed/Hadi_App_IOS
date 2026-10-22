import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../assets/Colors";
import playTrack from "./playTrack";

 function SwaraCard({
  cardInfo,
  QareCard,
  facIconState,
  currentRwayah,
}) {
  // const { playAudio } = useAudio();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      const favData = await AsyncStorage.getItem("favSwar");
      if (favData) {
        const favList = JSON.parse(favData);
        const qareFav = favList.find((item) => item.qareID === QareCard.id);
        if (qareFav && qareFav.favSwar.includes(cardInfo.id)) {
          setIsFavorite(true);
        }
      }
    };
    checkFavorite();
  }, []);

  function convertToThreeDigitString(number) {
    let numberString = number.toString();
    while (numberString.length < 3) {
      numberString = "0" + numberString;
    }
    return numberString;
  }

  const handleToggleFavorite = async () => {
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    if (newValue) {
      await addQareToFav(cardInfo.id);
    } else {
      await removeQareFromFav(cardInfo.id);
    }
  };

  const addQareToFav = async (swaraID) => {
    try {
      const existingfavSwar = await AsyncStorage.getItem("favSwar");
      let favData = [];

      if (existingfavSwar != null) {
        favData = JSON.parse(existingfavSwar);
      }

      const qareIndex = favData.findIndex(
        (item) => item.qareID === QareCard.id
      );

      if (qareIndex !== -1) {
        if (!favData[qareIndex].favSwar.includes(swaraID)) {
          favData[qareIndex].favSwar.push(swaraID);
        }
      } else {
        favData.push({
          qareID: QareCard.id,
          favSwar: [swaraID],
        });
      }

      await AsyncStorage.setItem("favSwar", JSON.stringify(favData));
    } catch (e) {
      console.log(`Error adding ${swaraID} to favorite qare ${QareCard.id}`);
    }
  };

  const removeQareFromFav = async (swaraID) => {
    try {
      const existingfavSwar = await AsyncStorage.getItem("favSwar");
      if (existingfavSwar !== null) {
        let favData = JSON.parse(existingfavSwar);
        const qareIndex = favData.findIndex(
          (item) => item.qareID === QareCard.id
        );

        if (qareIndex !== -1) {
          favData[qareIndex].favSwar = favData[qareIndex].favSwar.filter(
            (id) => id !== swaraID
          );

          // احذف الشيخ إذا لم يعد لديه سور مفضلة
          if (favData[qareIndex].favSwar.length === 0) {
            favData.splice(qareIndex, 1);
          }

          await AsyncStorage.setItem("favSwar", JSON.stringify(favData));
        }
      }
    } catch (e) {
      console.log(
        `Error removing ${swaraID} from favorites of qare ${QareCard.id}`
      );
    }
  };

  return (
    <View style={styles.swaraItem}>
      <TouchableOpacity
        onPress={() => {
          const swaraId = cardInfo.id;
          const audioSrc = cardInfo.audioUrl || (
            currentRwayah?.link
              ? `${currentRwayah.link}${convertToThreeDigitString(cardInfo.id)}.mp3`
              : `${QareCard.Audiosource}${convertToThreeDigitString(cardInfo.id)}.mp3`
          );
          const image = QareCard.img;
          let SwaraTitle = cardInfo.title;
          let QareTitle = QareCard.title;
          let qareId = QareCard.id;          
          playTrack({
            swaraId,
            qareId,
            rwayahId: currentRwayah?.id,
            rwayahName: currentRwayah?.name,
            surahNumber: cardInfo.surahNumber ?? cardInfo.id,
            audioBaseUrl: currentRwayah?.link || QareCard.Audiosource,
            audioSrc,
            image,
            SwaraTitle,
            QareTitle,
          })
        }}
      >
        <View style={styles.linkContainer}>
          <Text style={styles.swaraTitle}>{cardInfo.title}</Text>
          <View style={styles.left}>
            <MaterialIcons
              name="play-circle-fill"
              size={28}
              color="white"
              style={styles.icon}
            />
            {facIconState && (
              <TouchableOpacity onPress={handleToggleFavorite}>
                <FontAwesome
                  name={isFavorite ? "heart" : "heart-o"}
                  size={23}
                  color={isFavorite ? "red" : "white"}
                  style={styles.icon}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  swaraItem: {
    marginBottom: 20,
    marginHorizontal:16,
  },
  left: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingBottom: 20,
  },
  linkContainer: {
    backgroundColor: "#27292f",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Noto",
    flex: 1,
  },
  swaraTitle: {
    color: "white",
    fontSize: 18,
    fontFamily: "Noto",
  },
  icon: {
    borderRadius: 10,
    padding: 5,
    color: Colors.greenColor,
    transform: [{ scaleX: -1 }],
  },
});
export default React.memo(SwaraCard)