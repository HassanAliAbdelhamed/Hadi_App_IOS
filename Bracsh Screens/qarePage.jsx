import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import Colors from "../assets/Colors";
import { getSwarByQare } from "../assets/Apis/quraaApi";
import SearchInput from "../Components/SearchInput";
import SwaraCard from "../Components/swaraCard";
import { SafeAreaView } from "react-native-safe-area-context";
import AllColors from "../assets/Colors";

function QarePage() {
  const { id } = useRoute().params ?? {};

  const [qare, setQare] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentRwayah, setCurrentRwayah] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadQare = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await getSwarByQare(id);

      setQare(data);

      const firstRwayah = data?.Rwayat?.[0] ?? null;
      setCurrentRwayah(firstRwayah);

      setSearchQuery("");
    } catch (requestError) {
      console.log("Qare page error:", requestError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadQare();
  }, [loadQare]);

  const visibleSwar = useMemo(() => {
    const swar = currentRwayah?.suar ?? [];

    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return swar;
    }

    return swar.filter((swara) =>
      swara.title
        ?.toLowerCase()
        .includes(query)
    );
  }, [currentRwayah, searchQuery]);

  const refreshHandler = useCallback(async () => {
    setRefreshing(true);

    await loadQare();

    setRefreshing(false);
  }, [loadQare]);

  const handleRwayahChange = useCallback((rwayah) => {
    setCurrentRwayah(rwayah);
    setSearchQuery("");
  }, []);

  const renderSwara = useCallback(
    ({ item }) => (
      <SwaraCard
        currentRwayah={currentRwayah}
        cardInfo={item}
        QareCard={qare}
        facIconState={false}
      />
    ),
    [currentRwayah, qare]
  );

  if (loading && !qare) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator
          size="large"
          color={Colors.greenColor}
        />

        <Text style={styles.stateText}>
          جاري تحميل بيانات القارئ...
        </Text>
      </View>
    );
  }

  if (error && !qare) {
    return (
      <View style={styles.centerState}>
        <MaterialIcons
          name="cloud-off"
          size={46}
          color={Colors.greenColor}
        />

        <Text style={styles.stateText}>
          تعذر تحميل بيانات القارئ
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadQare}
        >
          <Text style={styles.retryText}>
            إعادة المحاولة
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AllColors.BlackBackgroundColor }}>
      <View style={styles.container}>
        <FlatList
          data={visibleSwar}
          renderItem={renderSwara}
          keyExtractor={(item, index) =>
            `${item.id ?? index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshHandler}
            />
          }
          ListHeaderComponent={
            <>
              <View style={styles.profileCard}>
                <View style={styles.profileAccent} />

                <Image
                  source={{ uri: qare.img }}
                  style={styles.avatar}
                />

                <View style={styles.profileCopy}>
                  <Text style={styles.eyebrow}>
                    القارئ الشيخ
                  </Text>

                  <Text style={styles.title}>
                    {qare.title}
                  </Text>

                  {!!qare.nationality && (
                    <View style={styles.nationalityRow}>
                      <MaterialIcons
                        name="place"
                        size={16}
                        color={Colors.greenColor}
                      />

                      <Text style={styles.nationality}>
                        {qare.nationality}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {!!qare.description && (
                <View style={styles.aboutSection}>
                  <Text style={styles.sectionTitle}>
                    نبذة عن القارئ
                  </Text>

                  <Text style={styles.description}>
                    {qare.description}
                  </Text>
                </View>
              )}

              {qare.Rwayat?.length > 0 && (
                <View style={styles.rewayatSection}>
                  <Text style={styles.sectionTitle}>
                    الروايات
                  </Text>

                  <FlatList
                    horizontal
                    data={qare.Rwayat}
                    keyExtractor={(item, index) =>
                      `${item.name}-${index}`
                    }
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.rewayatList}
                    renderItem={({ item }) => {
                      const isActive =
                        currentRwayah?.name === item.name;

                      return (
                        <TouchableOpacity
                          style={[
                            styles.rewayah,
                            isActive &&
                              styles.activeRewayah,
                          ]}
                          onPress={() =>
                            handleRwayahChange(item)
                          }
                        >
                          <Text
                            style={[
                              styles.rewayahText,
                              isActive &&
                                styles.activeRewayahText,
                            ]}
                          >
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              )}

              <SearchInput
                searchHandler={setSearchQuery}
                title="أكتب أسم السوره...."
              />

              <View style={styles.listHeading}>
                <View style={styles.headingTitle}>
                  <Text style={styles.sectionTitle}>
                    السور
                  </Text>

                  {currentRwayah?.name && (
                    <Text style={styles.selectedRwayah}>
                      {currentRwayah.name}
                    </Text>
                  )}
                </View>

                <Text style={styles.count}>
                  {visibleSwar.length} سورة
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              لا توجد سور مطابقة للبحث
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BlackBackgroundColor,
    direction: "rtl",
  },

  list: {
    padding: 16,
    paddingBottom: 28,
  },

  profileCard: {
    minHeight: 160,
    marginBottom: 18,
    padding: 18,
    borderRadius: 22,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#26332f",
    borderWidth: 1,
    borderColor: "#3d5b4d",
  },

  profileAccent: {
    position: "absolute",
    left: -30,
    top: -44,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#385d4c",
    opacity: 0.55,
  },

  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: Colors.greenColor,
    backgroundColor: "#1c2522",
  },

  profileCopy: {
    flex: 1,
    paddingHorizontal: 16,
  },

  eyebrow: {
    color: Colors.greenColor,
    fontSize: 13,
    fontFamily: "Cairo",
  },

  title: {
    color: Colors.whiteColor,
    fontSize: 23,
    fontWeight: "700",
    fontFamily: "Cairo",
    marginTop: 2,
  },

  nationalityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  nationality: {
    color: Colors.darkwhiteColor,
    fontSize: 14,
    marginHorizontal: 4,
    fontFamily: "Cairo",
  },

  aboutSection: {
    marginBottom: 18,
    paddingHorizontal: 4,
  },

  sectionTitle: {
    color: Colors.whiteColor,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Cairo",
  },

  description: {
    color: Colors.darkwhiteColor,
    fontSize: 14,
    lineHeight: 25,
    marginTop: 5,
    fontFamily: "Cairo",
  },

  rewayatSection: {
    marginBottom: 16,
  },

  rewayatList: {
    paddingTop: 9,
  },

  rewayah: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 8,
    borderRadius: 18,
    backgroundColor: "#292d31",
    borderWidth: 1,
    borderColor: "#454b4d",
  },

  activeRewayah: {
    backgroundColor: Colors.greenColor,
    borderColor: Colors.greenColor,
  },

  rewayahText: {
    color: Colors.whiteColor,
    fontSize: 13,
    fontFamily: "Cairo",
  },

  activeRewayahText: {
    color: Colors.blackColor,
  },

  listHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 14,
  },

  headingTitle: {
    flex: 1,
  },

  selectedRwayah: {
    color: Colors.greenColor,
    fontSize: 12,
    fontFamily: "Cairo",
    marginTop: 1,
  },

  count: {
    color: Colors.grayColor,
    fontSize: 13,
    fontFamily: "Cairo",
  },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.BlackBackgroundColor,
  },

  stateText: {
    color: Colors.darkwhiteColor,
    marginTop: 12,
    fontFamily: "Cairo",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.greenColor,
  },

  retryText: {
    color: Colors.blackColor,
    fontFamily: "Cairo",
  },

  emptyText: {
    color: Colors.grayColor,
    textAlign: "center",
    paddingVertical: 24,
    fontFamily: "Cairo",
  },
});

export default QarePage;
