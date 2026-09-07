import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AllColors from "../assets/Colors";

export default function NationalityFilter({
  visible,
  nationalities,
  selectedNationality,
  onSelect,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={Styles.overlay}>
        <View style={Styles.modalContainer}>

          {/* Header */}

          <View style={Styles.header}>
            <Text style={Styles.title}>
              اختيار الجنسية
            </Text>

            <TouchableOpacity
              onPress={onClose}
              style={Styles.closeButton}
            >
              <Text style={Styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>


          {/* All Nationalities */}

          <TouchableOpacity
            style={[
              Styles.item,
              selectedNationality === null &&
                Styles.selectedItem,
            ]}
            onPress={() => onSelect(null)}
          >
            <View
              style={[
                Styles.radio,
                selectedNationality === null &&
                  Styles.radioSelected,
              ]}
            >
              {selectedNationality === null && (
                <View style={Styles.radioDot} />
              )}
            </View>

            <Text
              style={[
                Styles.itemText,
                selectedNationality === null &&
                  Styles.selectedText,
              ]}
            >
              كل الجنسيات
            </Text>
          </TouchableOpacity>


          {/* Nationalities */}

          <FlatList
            data={nationalities}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected =
                selectedNationality === item.id;

              return (
                <TouchableOpacity
                  style={[
                    Styles.item,
                    isSelected && Styles.selectedItem,
                  ]}
                  onPress={() => onSelect(item.id)}
                >
                  <View
                    style={[
                      Styles.radio,
                      isSelected &&
                        Styles.radioSelected,
                    ]}
                  >
                    {isSelected && (
                      <View style={Styles.radioDot} />
                    )}
                  </View>

                  <Text
                    style={[
                      Styles.itemText,
                      isSelected &&
                        Styles.selectedText,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

        </View>
      </View>
    </Modal>
  );
}


const Styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#1B1D21",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,

    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,

    maxHeight: "75%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 15,
  },

  title: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    fontFamily: "Cairo",
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#27292F",
  },

  closeText: {
    color: "#aaa",
    fontSize: 16,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 14,
    paddingHorizontal: 12,

    borderRadius: 12,

    marginBottom: 5,
  },

  selectedItem: {
    backgroundColor: "rgba(118,166,141,0.12)",
  },

  radio: {
    width: 21,
    height: 21,

    borderRadius: 11,

    borderWidth: 2,
    borderColor: "#555",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  radioSelected: {
    borderColor: AllColors.greenColor,
  },

  radioDot: {
    width: 11,
    height: 11,

    borderRadius: 6,

    backgroundColor: AllColors.greenColor,
  },

  itemText: {
    color: "#aaa",
    fontSize: 15,
    fontFamily: "Cairo",
  },

  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
