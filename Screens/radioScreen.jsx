import quraa from "../assets/Apis/radioQuraa";
import {
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFonts } from "expo-font";
import { useCallback, useState } from "react";
import SearchInput from "../Components/SearchInput";
import { useNavigation } from "@react-navigation/native";
import AllColors from "../assets/Colors";
import { MaterialIcons } from "@expo/vector-icons";
// import { useAudio } from 'Components/audioContext';
import radioIconImg from "../assets/images/readioHeadIcon.png";
import playTrack from "../Components/playTrack";
export default function RadioScreen() {
  // const { playAudio } = useAudio();
  // Navigation Var
  const navigate = useNavigation();
  // Quraa Var
  const Quraa = quraa;
  const [allQuraa, setQuraa] = useState(Quraa);
  // Refresh Var
  const [refreshing, setRefreshing] = useState(false);

  // Search Handler
  const searchHandler = useCallback(
    (value) => {
      if (value) {
        const filteredData = Quraa.filter((qure) => qure.title.includes(value));
        setQuraa(filteredData);
      } else {
        setQuraa(Quraa);
      }
    },
    [Quraa]
  );

  // Refreshing handler
  const refreshHandler = () => {
    setRefreshing(true);
    setQuraa(Quraa);
    setRefreshing(false);
  };

  // Qare Card
  const QaraCard = ({ cardinfo }) => (
    <View style={Styles.bodyStyle}>
      <TouchableOpacity
        style={Styles.card}
        onPress={() => {
          const swaraId = cardinfo.id;
          const audioSrc = cardinfo.Audiosource;
          const image = cardinfo.img;
          const QareTitle = "مباشر";
          const SwaraTitle = cardinfo.title;
          playTrack({ swaraId, audioSrc, image, SwaraTitle, QareTitle });
        }}
      >
        <View style={Styles.bodyConainer}>
          <Image source={{ uri: cardinfo.img }} style={Styles.cardImage} />
          <View style={Styles.TextsStyle}>
            <Text style={Styles.cardBoxTitle}>القارئ الشيخ</Text>
            <Text style={Styles.cardTitle}>{cardinfo.title}</Text>
          </View>
        </View>
        <MaterialIcons name="radio" size={28} style={Styles.icon} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={Styles.container}>
      <View style={Styles.Header}>
        <Image source={(require = radioIconImg)} style={Styles.HeaderImg} />
        <SearchInput
          searchHandler={searchHandler}
          title="أكتب أسم القارئ...."
        />
      </View>
      <FlatList
        data={allQuraa}
        renderItem={({ item }) => <QaraCard cardinfo={item} />}
        keyExtractor={(item, index) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshHandler} />
        }
      />
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: AllColors.BlackBackgroundColor,
    direction: "rtl",
  },
  Header: {
    backgroundColor: AllColors.shadowblackColor,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  HeaderImg: {
    marginHorizontal: "auto",
    marginTop: -30,
    position: "relative",
    top: 20,
    width: 300,
    height: 210,
  },
  listContainer: {
    paddingBottom: 20,
  },
  bodyStyle: {
    backgroundColor: AllColors.BlackBackgroundColor,
    paddingHorizontal: 8,
    flex: 1,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    marginTop: 5,
    width: "100%",
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    width: "100%",
    backgroundColor: "#27292f",
  },
  bodyConainer: {
    flex: 1,
    flexDirection: "row",
  },
  cardImage: {
    width: 75,
    height: 75,
    borderRadius: 50,
    marginHorizontal: 10,
    borderColor: AllColors.greenColor,
    borderWidth: 1,
  },
  cardBoxTitle: {
    fontSize: 10,
    color: "white",
    textAlign: "left",
  },
  cardTitle: {
    fontSize: 16,
    color: "white",
    textAlign: "left",
    fontWeight: "600",
    fontFamily: "Cairo",
  },
  TextsStyle: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
  },
  icon: {
    padding: 5,
    color: AllColors.greenColor,
  },
});
