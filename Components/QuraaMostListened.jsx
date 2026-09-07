import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AllColors from "../assets/Colors";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const QuraaMostListened = ({ cardinfo, facIconState, horizontal }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigation();

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const favData = await AsyncStorage.getItem('FavQuraa');
        if (favData) {
          const favList = JSON.parse(favData);
          setIsFavorite(favList.includes(cardinfo.id));
        }
     } catch (e) {
        console.warn("Error checking favorites:", e.message);
      }
    };
    checkFavorite();
  }, [cardinfo.id]);

  const handleToggleFavorite = async () => {
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    if (newValue) {
      await addQareToFav(cardinfo.id);
    } else {
      await removeQareFromFav(cardinfo.id);
    }
  };

  const removeQareFromFav = async (id) => {
    try {
      const existingFavQuraa = await AsyncStorage.getItem('FavQuraa');
      if (existingFavQuraa !== null) {
        let favQuraaArr = JSON.parse(existingFavQuraa);
        const updatedFav = favQuraaArr.filter((qareId) => qareId !== id);
        await AsyncStorage.setItem('FavQuraa', JSON.stringify(updatedFav));
      }
    } catch (e) {
      console.log(`Error removing ${id} from favorites`);
    }
  };

  const addQareToFav = async (id) => {
    try {
      const existingFavQuraa = await AsyncStorage.getItem('FavQuraa');
      let favQuraaArr = [];
      if (existingFavQuraa != null) {
        favQuraaArr = JSON.parse(existingFavQuraa);
      }
      if (!favQuraaArr.includes(id)) {
        favQuraaArr.push(id);
        await AsyncStorage.setItem('FavQuraa', JSON.stringify(favQuraaArr));
      }
    } catch (e) {
      console.log(`Error adding ${id} to favorite quraa`);
    }
  };

  // شكل عمودي (دايرة + اسم تحتها) زي كروت "الأكثر استماعاً" في التصميم
  if (horizontal) {
    return (
      <TouchableOpacity
        style={Styles.verticalCard}
        onPress={() => navigate.navigate('qarePage', { id: cardinfo.id - 1 })}
      >
        <Image source={{ uri: cardinfo.img }} style={Styles.verticalImage} />
        <Text style={Styles.verticalTitle} numberOfLines={1}>{cardinfo.title}</Text>
        {cardinfo.subtitle ? (
          <Text style={Styles.verticalSubtitle} numberOfLines={1}>{cardinfo.subtitle}</Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  // الشكل الأفقي الأصلي (المستخدم في القوائم الطولية)
  return (
    <View style={Styles.bodyStyle}>
      <TouchableOpacity
        style={Styles.card}
        onPress={() => navigate.navigate('qarePage', { id: cardinfo.id - 1 })}>
        <View style={Styles.bodyConainer}>
          <Image source={{ uri: cardinfo.img }} style={Styles.cardImage} />
          <View style={Styles.TextsStyle}>
            <Text style={Styles.cardBoxTitle}>القارئ الشيخ</Text>
            <Text style={Styles.cardTitle}>{cardinfo.title}</Text>
          </View>
        </View>

        <MaterialIcons name="headphones" size={26} style={Styles.icon} />
        {facIconState &&
          <TouchableOpacity onPress={handleToggleFavorite}>
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={23}
              color={isFavorite ? 'red' : 'white'}
              style={Styles.icon}
            />
          </TouchableOpacity>
        }
      </TouchableOpacity>
    </View>
  );
};

const Styles = StyleSheet.create({
  bodyStyle: {
    backgroundColor: AllColors.BlackBackgroundColor,
    paddingHorizontal: 8,
    flex: 1,
  },
  card: {
    marginTop: 5,
    width: '100%',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#27292f',
  },
  bodyConainer: {
    flex: 1,
    flexDirection: 'row',
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
    color: 'white',
    textAlign: 'left',
  },
  cardTitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
    fontWeight: '600',
    fontFamily: 'Cairo',
  },
  TextsStyle: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'column',
  },
  icon: {
    padding: 5,
    color: AllColors.greenColor,
  },
  // ستايلات الشكل العمودي (للأكثر استماعاً)
  verticalCard: {
    width: 160, // زيادة العرض
    marginHorizontal: 6,
    alignItems: 'center',
  },
  verticalImage: {
    width: 150, // زيادة حجم الصورة
    height: 150, // زيادة حجم الصورة
    borderRadius: 16,
    borderColor: AllColors.greenColor,
    borderWidth: 1,
    marginBottom: 8,
  },
  verticalTitle: {
    fontSize: 18, // زيادة حجم الخط
    color: 'white',
    fontWeight: '600',
    fontFamily: 'Cairo',
    textAlign: 'center',
  },
  verticalSubtitle: {
    fontSize: 12, // زيادة حجم خط العنوان الفرعي
    color: AllColors.greenColor,
    textAlign: 'center',
  },
});

export default React.memo(QuraaMostListened);