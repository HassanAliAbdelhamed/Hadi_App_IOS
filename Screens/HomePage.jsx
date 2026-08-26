import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import quraa from "../assets/Apis/quraa";
import { useCallback, useState } from "react";
import SearchInput from "../Components/SearchInput";
import AllColors from "../assets/Colors";
import QaraCard from "../Components/qareCard";
import homeIconImg from "../assets/images/homeIconImage.png";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const Quraa = quraa;
  const [allQuraa, setQuraa] = useState(Quraa);

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

  // Refresh Handler
  const refreshHandler = () => {
    setRefreshing(true);
    setQuraa(Quraa);
    setRefreshing(false);
  };

  return (
    <View style={Styles.container}>
      <View style={Styles.Header}>
        <Image source={homeIconImg} style={Styles.HeaderImg} />
        <SearchInput searchHandler={searchHandler} title="أكتب اسم القارئ..." />
      </View>

      <FlatList
        data={allQuraa}
        renderItem={({ item }) => (
          <QaraCard cardinfo={item} facIconState={true} />
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshHandler} />
        }
        contentContainerStyle={Styles.listContainer}
        initialNumToRender={10} // عدد العناصر التي يتم عرضها مبدأيًا
        maxToRenderPerBatch={10} // أقصى عدد يتم تحميله في كل دفعة
        windowSize={5} // عدد الشاشات المسبقة التي يتم تحضيرها
        removeClippedSubviews={true}
      />
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AllColors.BlackBackgroundColor,
    direction: "rtl",
  },
  Header: {
    backgroundColor: AllColors.shadowblackColor,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // marginHorizontal:'auto',
  },
  HeaderImg: {
    alignSelf: "center",
    marginTop: -50,
    position: "relative",
    top: 0,
    width: 400,
    height: 230,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    marginTop: 5,
    width: "100%",
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginLeft: 20,
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
