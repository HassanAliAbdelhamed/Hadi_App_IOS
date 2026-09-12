import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllQuraa, getAllNationalities, getQuraaByNationality } from "../assets/Apis/quraaApi";
import AllColors from "../assets/Colors";
import QaraCard from "../Components/qareCard";
import Header from "../Components/Header";
import NationalityFilter from "../Components/NationalityFilter";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [quraa, setQuraa] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [selectedNationality, setSelectedNationality] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [quraaData, nationalityData] = await Promise.all([getAllQuraa(), getAllNationalities()]);
      setQuraa(quraaData);
      setNationalities(nationalityData);
    } catch (err) {
      console.log("Home data error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleNationalitySelect = useCallback(async (nationalityId) => {
    setFilterVisible(false);
    setSelectedNationality(nationalityId);
    setLoading(true);
    setError(false);
    try {
      const data = nationalityId ? await getQuraaByNationality(nationalityId) : await getAllQuraa();
      setQuraa(data);
    } catch (err) {
      console.log("Nationality error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredQuraa = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query ? quraa.filter((qare) => qare.title?.toLowerCase().includes(query)) : quraa;
  }, [quraa, searchQuery]);

  const refreshHandler = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const renderQari = useCallback(({ item }) => (
    <QaraCard cardinfo={item} facIconState={true} />
  ), []);

  const keyExtractor = useCallback((item, index) => (
    item.id?.toString() || index.toString()
  ), []);

  const selectedNationalityName = nationalities.find((item) => item.id === selectedNationality)?.title;

  return (
    <SafeAreaView style={Styles.safeArea}>
      <View style={Styles.container}>
        <Header />

        <View style={Styles.searchContainer}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن قارئ..."
            placeholderTextColor="#777"
            style={Styles.searchInput}
            textAlign="right"
            selectionColor={AllColors.greenColor}
          />
          {/* <Text style={Styles.searchIcon}>🔍</Text> */}
          <TouchableOpacity
            style={[Styles.filterButton, selectedNationality && Styles.filterButtonActive]}
            onPress={() => setFilterVisible(true)}
          >
            <MaterialIcons name="filter-list" style={[Styles.filterIcon, selectedNationality && Styles.filterIconActive]} />
            {/* <Text >⚙</Text> */}
          </TouchableOpacity>
        </View>

        {selectedNationality && (
          <View style={Styles.selectedFilterRow}>
            <Text style={Styles.filterLabel}>الجنسية:</Text>
            <View style={Styles.selectedChip}>
              <Text style={Styles.selectedChipText}>{selectedNationalityName}</Text>
              <TouchableOpacity onPress={() => handleNationalitySelect(null)} style={Styles.removeButton}>
                <Text style={Styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {loading ? (
          <View style={Styles.centerContainer}>
            <ActivityIndicator size="large" color={AllColors.greenColor} />
            <Text style={Styles.statusText}>جاري تحميل القراء...</Text>
          </View>
        ) : error ? (
          <View style={Styles.centerContainer}>
            <Text style={Styles.errorText}>حدث خطأ في الاتصال، يرجى التأكد من شبكة الإنترنت ومحاولة مرة أخرى.</Text>
            <TouchableOpacity style={Styles.retryButton} onPress={loadData}>
              <Text style={Styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredQuraa}
            renderItem={renderQari}
            keyExtractor={keyExtractor}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshHandler} tintColor={AllColors.greenColor} />}
            contentContainerStyle={Styles.listContainer}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            ListHeaderComponent={
              <View style={Styles.listHeader}>
                <Text style={Styles.listTitle}>القرآء</Text>
                <Text style={Styles.resultCount}>{filteredQuraa.length} قارئ</Text>
              </View>
            }
            ListEmptyComponent={
              <View style={Styles.emptyContainer}>
                <Text style={Styles.emptyTitle}>لا يوجد نتائج</Text>
                <Text style={Styles.emptyText}>لم نجد قارئًا يطابق بحثك</Text>
              </View>
            }
          />
        )}

        <NationalityFilter
          visible={filterVisible}
          nationalities={nationalities}
          selectedNationality={selectedNationality}
          onSelect={handleNationalitySelect}
          onClose={() => setFilterVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AllColors.BlackBackgroundColor },
  container: { flex: 1, backgroundColor: AllColors.BlackBackgroundColor, direction: "rtl" },
  searchContainer: { height: 52, marginHorizontal: 16, marginTop: 8, marginBottom: 10, flexDirection: "row", alignItems: "center", backgroundColor: "#202227", borderRadius: 15, borderWidth: 1, borderColor: "#2B2D32" },
  searchInput: { flex: 1, height: "100%", color: "#fff", fontSize: 14, fontFamily: "Cairo", paddingHorizontal: 14, paddingRight: 45 },
  searchIcon: { position: "absolute", right: 15, fontSize: 17 },
  filterButton: { width: 42, height: 42, borderRadius: 12, marginRight: 5, alignItems: "center", justifyContent: "center", backgroundColor: "#292B30" },
  filterButtonActive: { backgroundColor: AllColors.greenColor },
  filterIcon: { color: "#aaa", fontSize: 19 },
  filterIconActive: { color: "#fff" },
  selectedFilterRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 8 },
  filterLabel: { color: "#777", fontSize: 13, fontFamily: "Cairo", marginRight: 7 },
  selectedChip: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(118,166,141,0.15)", borderWidth: 1, borderColor: AllColors.greenColor, borderRadius: 20, paddingLeft: 5, paddingRight: 12, paddingVertical: 5 },
  selectedChipText: { color: AllColors.greenColor, fontSize: 13, fontWeight: "bold", fontFamily: "Cairo" },
  removeButton: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", marginLeft: 6, backgroundColor: AllColors.greenColor },
  removeText: { color: "#fff", fontSize: 16, lineHeight: 19 },
  listContainer: { paddingBottom: 25, flexGrow: 1 },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 5 },
  listTitle: { color: "#fff", fontSize: 19, fontFamily: "Cairo" },
  resultCount: { color: "#666", fontSize: 12, fontFamily: "Cairo" },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  statusText: { color: "#fff", fontSize: 15, fontFamily: "Cairo", marginTop: 12 },
  errorText: { color: "#ff6b6b", fontSize: 14, fontFamily: "Cairo", textAlign: "center", lineHeight: 23, marginBottom: 15 },
  retryButton: { backgroundColor: AllColors.greenColor, paddingHorizontal: 25, paddingVertical: 10, borderRadius: 10 },
  retryButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold", fontFamily: "Cairo" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 35, marginBottom: 10 },
  emptyTitle: { color: "#fff", fontSize: 17, fontWeight: "bold", fontFamily: "Cairo" },
  emptyText: { color: "#666", fontSize: 13, fontFamily: "Cairo", marginTop: 4 },
});