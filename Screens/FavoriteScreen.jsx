import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Image } from 'react-native';
import AllColors from '../assets/Colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import quraa from '../assets/Apis/quraa';
import QaraCard from '../Components/qareCard';
import SwaraCard from '../Components/swaraCard';
import AllSwar from '../assets/Apis/AllSwarWithID';

export default function FavoriteScreen() {
  const [activeTab, setActiveTab] = useState('quraa');
  const navigate = useNavigation();
  const [favQuraaArr, setFavQuraaArr] = useState(null);
  const [favSuwar, setFavSuwar] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const getFavQuraa = async () => {
        try {
          const existingFavQuraa = await AsyncStorage.getItem('FavQuraa');
          const curFavQuraa = JSON.parse(existingFavQuraa);
          if (curFavQuraa && curFavQuraa.length > 0) {
            setFavQuraaArr(curFavQuraa);
          } else {
            setFavQuraaArr(null);
          }
        } catch (e) {
          console.log(`Error get Favorite Quraa`, e);
        }

        try {
          const storedFavSuwar = await AsyncStorage.getItem('favSwar');
          if (storedFavSuwar) {
            const parsed = JSON.parse(storedFavSuwar);
            setFavSuwar(parsed);
          } else {
            setFavSuwar([]);
          }
        } catch (e) {
          console.log('Error getting favorite suwar:', e);
        }
      };

      getFavQuraa();
    }, [])
  );

  function FavQuraaDiv() {
    if (favQuraaArr != null) {
      const sortedQuraa = [...favQuraaArr].sort();
      return sortedQuraa.map((Qare) => <QaraCard key={Qare} cardinfo={quraa[Qare - 1]} facIconState={false}/>);
    } else {
      return (
        <View style={styles.emptyWrapper}>
          <Text style={styles.contentText}>القائمه فارغه</Text>
          <Text style={styles.addReaderButton} onPress={() => navigate.navigate('الرئسية')}>
            أضف قارئ
          </Text>
        </View>
      );
    }
  }
  function FavSuwarDiv() {
    if (!Array.isArray(favSuwar) || favSuwar.length === 0) {
      return (
        <View style={styles.emptyWrapper}>
          <Text style={styles.contentText}>لا توجد سور مفضلة بعد</Text>
        </View>
      );
    }

    return (
      <View style={{paddingHorizontal: 10 ,display:"flex" , flex:1}} >
        {favSuwar.map((item, index) => {
          if (!item || !item.qareID || !Array.isArray(item.favSwar)) return null;

          const qare = quraa.find((q) => q.id === item.qareID);
          if (!qare) return null;

          return (
            <View key={index} style={styles.qareCard}>
              <View style={styles.qareHeader}>
                <Image source={{ uri: qare.img }} style={styles.cardImage} />
                <Text style={styles.QareTitle}>{qare.title}</Text>
              </View>

              <View style={styles.swaraGrid}>
                {item.favSwar.map((swaraId) => (
                  <SwaraCard key={swaraId} cardInfo={AllSwar[swaraId-1]} QareCard={qare} facIconState={false}/>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <Image source={favIconImg} style={styles.HeaderImg} /> */}
        <Text style={styles.HeaderText}>المفضلة</Text>

        {/* Toggle Tabs */}
        <View style={styles.toggleWrapper}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'quraa' && styles.activeToggleButton]}
            onPress={() => setActiveTab('quraa')}>
            <Text style={[styles.toggleText, activeTab === 'quraa' && styles.activeToggleText]}>
              القرآء
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'suwar' && styles.activeToggleButton]}
            onPress={() => setActiveTab('suwar')}>
            <Text style={[styles.toggleText, activeTab === 'suwar' && styles.activeToggleText]}>
              السور
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* المحتوى حسب التبويب */}
      {activeTab === 'quraa' ? (
        <FlatList
          data={[{ key: 'favQuraa' }]}
          renderItem={() => <FavQuraaDiv />}
          contentContainerStyle={styles.content}
        />
      ) : (
        <FlatList
          data={[{ key: 'favSurahs' }]}
          renderItem={() => <FavSuwarDiv />}
          contentContainerStyle={styles.content}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AllColors.BlackBackgroundColor,
    direction: 'rtl',
  },
  header: {
    backgroundColor: AllColors.shadowblackColor,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  HeaderText: {
    alignSelf: 'center',
    fontFamily: 'Cairo',
    fontSize: 32,
    marginTop: 50,
    marginBottom: 75,
    color: 'white',
  },
  toggleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: AllColors.shadowblackColor,
    marginBottom: 25,
  },
  toggleButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: AllColors.BlackBackgroundColor,
    flex: 1,
  },
  activeToggleButton: {
    backgroundColor: AllColors.whiteColor,
  },
  toggleText: {
    fontSize: 18,
    fontFamily: 'Cairo',
    color: AllColors.whiteColor,
  },
  activeToggleText: {
    color: AllColors.BlackBackgroundColor,
    fontWeight: 'bold',
    fontFamily: 'Cairo',
  },
  content: {
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    color: AllColors.whiteColor,
    fontSize: 18,
    fontFamily: 'Cairo',
    textAlign: 'center',
    marginTop: 50,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  addReaderButton: {
    fontSize: 18,
    fontFamily: 'Cairo',
    color: 'white',
    backgroundColor: '#639c6d',
    padding: 10,
    borderRadius: 50,
    marginTop: 20,
    textAlign: 'center',
  },
  QareTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Cairo',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  cardImage: {
    width: 75,
    height: 75,
    borderRadius: 50,
    borderColor: AllColors.greenColor,
    borderWidth: 1,
    marginHorizontal:10
  },
    qareCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor:'#282a2f'
  },
  qareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    display:"flex",
    justifyContent:"space-around"
  },
  QareTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Cairo',
    marginLeft: 15,
  },
  swaraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  swaraTag: {
    backgroundColor: '#639c6d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 5,
  },
  swaraText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Cairo',
  },

});
