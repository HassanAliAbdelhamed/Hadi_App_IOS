import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import AllColors from "../assets/Colors";
import { useNavigation } from "@react-navigation/native";

const QuraaMostListened = ({ cardinfo, horizontal }) => {
  const navigate = useNavigation();

  if (horizontal) {
    return (
      <TouchableOpacity
        style={Styles.verticalCard}
        onPress={() => navigate.navigate('qarePage', { id: cardinfo.id })}
      >
        <Image source={{ uri: cardinfo.img }} style={Styles.verticalImage} />
        <Text style={Styles.verticalTitle} numberOfLines={1}>{cardinfo.title}</Text>
        {cardinfo.subtitle ? (
          <Text style={Styles.verticalSubtitle} numberOfLines={1}>{cardinfo.subtitle}</Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <View style={Styles.bodyStyle}>
      <TouchableOpacity
        style={Styles.card}
        onPress={() => navigate.navigate('qarePage', { id: cardinfo.id })}>
        <View style={Styles.bodyConainer}>
          <Image source={{ uri: cardinfo.img }} style={Styles.cardImage} />
          <View style={Styles.TextsStyle}>
            <Text style={Styles.cardBoxTitle}>القارئ الشيخ</Text>
            <Text style={Styles.cardTitle}>{cardinfo.title}</Text>
          </View>
        </View>

        <MaterialIcons name="headphones" size={26} style={Styles.icon} />
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
    textAlign: 'right',
  },
  cardTitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'right',
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