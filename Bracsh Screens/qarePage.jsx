import react, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AllSwarWithID from "../assets/Apis/AllSwarWithID";
import quraa from "../assets/Apis/quraa";
import Colors from "../assets/Colors";
import SearchInput from "../Components/SearchInput";
import SwaraCard from "../Components/swaraCard";

function QarePage() {
  // take id of Page
  const route = useRoute();
  let { id } = route.params;

  // Filter swar of qare
  const [swar, setSwar] = useState(AllSwarWithID);
  const currentQare = quraa[id];
  const qareeSwar = currentQare.swar
    ? swar.filter((swara) => currentQare.swar.includes(swara.id))
    : swar;

  // Rwayat
  const [currentRwayah, setCurrentRwayah] = useState(
    currentQare.Rwayat ? currentQare.Rwayat[0] : null
  );

  // Search Handler
  const searchHandler = (value) => {
    if (value) {
      const filteredData = swar.filter((swara) => swara.title.includes(value));
      setSwar(filteredData);
    } else {
      setSwar(AllSwarWithID);
    }
  };

  // Search Handler
  const [refreshing, setRefreshing] = useState(false);
  const refreshHandler = () => {
    setRefreshing(true);
    setSwar(AllSwarWithID);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.header}>
          <View>
            <Text style={styles.preTitle}>القارئ الشيخ : </Text>
            <Text style={styles.title}>{currentQare.title}</Text>
          </View>
          <Image source={{ uri: currentQare.img }} style={styles.avatar} />
        </View>
        <SearchInput
          searchHandler={searchHandler}
          title="أكتب أسم السوره...."
        />
        {currentQare.Rwayat && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            style={{ marginVertical: 10 ,marginLeft:"auto",marginRight:"auto"}}
          >
            {currentQare.Rwayat.map((rwayah, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor:
                    currentRwayah.name === rwayah.name
                      ? Colors.greenColor
                      : "#333",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  marginRight: 10,
                  fontFamily: "Cairo",
                }}
                onPress={() => setCurrentRwayah(rwayah)}
              >
                <Text style={{ color: "white", fontSize: 14 }}>
                  {rwayah.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={qareeSwar}
        renderItem={({ item }) => (
          <SwaraCard
            currentRwayah={currentRwayah}
            cardInfo={item}
            QareCard={currentQare}
            facIconState={true}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshHandler} />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f2125",
    paddingVertical: 16,
    direction: "rtl",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#363a43",
    marginBottom: 20,
    justifyContent: "space-around",
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 100,
    borderColor: Colors.greenColor,
    borderWidth: 2,
  },
  preTitle: {
    textAlign: "left",
    fontSize: 12,
    color: Colors.whiteColor,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontFamily: "Cairo",
    textAlign: "center",
  },
  list: {
    paddingBottom: 20,
  },
});

export default QarePage;
