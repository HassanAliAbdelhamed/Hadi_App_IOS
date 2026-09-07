import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import AllColors from "../assets/Colors";
import QaraCard from "../Components/qareCard";
import { getAllQuraa, getQuraaByNationality } from "../assets/Apis/quraaApi";
import { SafeAreaView } from "react-native-safe-area-context";
import QuraaMostListened from "../Components/QuraaMostListened";
import Header from "../Components/Header";
import TodayRecitationCard from "../Components/TodayRecitationCard";

const NATIONALITY_EGYPT_ID = 4;
const NATIONALITY_SAUDI_ID = 1;
const NATIONALITY_SUDAN_ID = 7;
const NATIONALITY_PALESTINE_ID = 16;

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // حالة متابعة الخطأ

  const [allQuraa, setAllQuraa] = useState([]);
  const [filteredQuraa, setFilteredQuraa] = useState([]);
  const [egyptianQuraa, setEgyptianQuraa] = useState([]);
  const [saudiQuraa, setSaudiQuraa] = useState([]);
  const [sudaneseQuraa, setSudaneseQuraa] = useState([]);
  const [palestinianQuraa, setPalestinianQuraa] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false); // إعادة ضبط حالة الخطأ عند البدء

    try {
      // جلب كل البيانات بطلب واحد متوازي
      const [all, egyptians, saudis, sudanese, palestinians] = await Promise.all([
        getAllQuraa(),
        getQuraaByNationality(NATIONALITY_EGYPT_ID),
        getQuraaByNationality(NATIONALITY_SAUDI_ID),
        getQuraaByNationality(NATIONALITY_SUDAN_ID),
        getQuraaByNationality(NATIONALITY_PALESTINE_ID),
      ]);

      setAllQuraa(all);
      setFilteredQuraa(all);
      setEgyptianQuraa(egyptians);
      setSaudiQuraa(saudis);
      setSudaneseQuraa(sudanese);
      setPalestinianQuraa(palestinians);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(true); // تفعيل حالة الخطأ في حالة انقطاع النت أو فشل الطلب
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshHandler = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AllColors.BlackBackgroundColor }}>
      <ScrollView
        style={Styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshHandler} />
        }
      >
        <Header />

        {/* 1. حالة التحميل */}
        {loading ? (
          <View style={Styles.centerContainer}>
            <ActivityIndicator size="large" color={AllColors.greenColor} />
            <Text style={Styles.statusText}>جاري التحميل...</Text>
          </View>
        ) : error ? (
          /* 2. حالة وجود خطأ أو انقطاع الإنترنت */
          <View style={Styles.centerContainer}>
            <Text style={Styles.errorText}>
              حدث خطأ في الاتصال، يرجى التأكد من شبكة الإنترنت ومحاولة مرة أخرى.
            </Text>
            <TouchableOpacity style={Styles.retryButton} onPress={loadData}>
              <Text style={Styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* 3. عرض المحتوى بعد نجاح جلب البيانات */
          <>
            <TodayRecitationCard/>
            {/* قراء مصريين */}
            {egyptianQuraa.length > 0 && (
              <View style={Styles.sectionContainer}>
                <View style={Styles.sectionHeaderRow}>
                  <TouchableOpacity>
                    <Text style={Styles.showAllText}>عرض الكل</Text>
                  </TouchableOpacity>
                  <Text style={Styles.sectionTitle}>قراء مصريين</Text>
                </View>
                <FlatList
                  data={egyptianQuraa}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => `egypt-${item.id}`}
                  renderItem={({ item }) => (
                    <QuraaMostListened cardinfo={item} horizontal facIconState={false} />
                  )}
                  contentContainerStyle={{ paddingHorizontal: 8 }}
                />
              </View>
            )}

            {/* قراء سعوديين */}
            {saudiQuraa.length > 0 && (
              <View style={Styles.sectionContainer}>
                <View style={Styles.sectionHeaderRow}>
                  <TouchableOpacity>
                    <Text style={Styles.showAllText}>عرض الكل</Text>
                  </TouchableOpacity>
                  <Text style={Styles.sectionTitle}>قراء سعوديين</Text>
                </View>
                <FlatList
                  data={saudiQuraa}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => `saudi-${item.id}`}
                  renderItem={({ item }) => (
                    <QaraCard cardinfo={item} horizontal facIconState={false} />
                  )}
                  contentContainerStyle={{ paddingHorizontal: 8 }}
                />
              </View>
            )}

            {/* قراء سودانيين */}
            {sudaneseQuraa.length > 0 && (
              <View style={Styles.sectionContainer}>
                <View style={Styles.sectionHeaderRow}>
                  <TouchableOpacity>
                    <Text style={Styles.showAllText}>عرض الكل</Text>
                  </TouchableOpacity>
                  <Text style={Styles.sectionTitle}>قراء سودانيين</Text>
                </View>
                <FlatList
                  data={sudaneseQuraa}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => `sudan-${item.id}`}
                  renderItem={({ item }) => (
                    <QaraCard cardinfo={item} horizontal facIconState={false} />
                  )}
                  contentContainerStyle={{ paddingHorizontal: 8 }}
                />
              </View>
            )}

            {/* قراء فلسطينيين */}
            {palestinianQuraa.length > 0 && (
              <View style={Styles.sectionContainer}>
                <View style={Styles.sectionHeaderRow}>
                  <TouchableOpacity>
                    <Text style={Styles.showAllText}>عرض الكل</Text>
                  </TouchableOpacity>
                  <Text style={Styles.sectionTitle}>قراء فلسطينيين</Text>
                </View>
                <FlatList
                  data={palestinianQuraa}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => `palestine-${item.id}`}
                  renderItem={({ item }) => (
                    <QaraCard cardinfo={item} horizontal facIconState={false} />
                  )}
                  contentContainerStyle={{ paddingHorizontal: 8 }}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AllColors.BlackBackgroundColor,
    direction: "rtl",
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontFamily: "Cairo",
  },
  showAllText: {
    color: AllColors.greenColor,
    fontSize: 13,
    fontFamily: "Cairo",
  },
  listContainer: {
    paddingBottom: 20,
  },
  // الأنماط المضافة لحالات التحميل والخطأ
  centerContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  statusText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Cairo",
    marginTop: 12,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 15,
    fontFamily: "Cairo",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: AllColors.greenColor,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
});