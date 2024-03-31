import { StyleSheet, Text, View, Modal, TouchableOpacity } from "react-native";
import React from "react";
import { COLOURS, SIZES } from "../../constants/theme";

const ChooseWinnerModal = ({ isVisible, onClose, players }) => {
  // need to create a flatlist of the players that are playing and show
  // them as clickable sections so that they can be chosen in this pop up

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Please choose the winner:</Text>

        <View style={styles.btnViewContainer}>
          <TouchableOpacity
            style={[styles.btnContainer, { backgroundColor: COLOURS.green }]}
            onPress={() => onClose(true, "nick")}
          >
            <View>
              <Text style={[styles.btnText, { color: COLOURS.text_grey }]}>Yes</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnContainer, { backgroundColor: COLOURS.dark_orange }]}
            onPress={() => onClose(false, "")}
          >
            <View>
              <Text style={[styles.btnText, { color: COLOURS.text_grey }]}>No</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ChooseWinnerModal;

const styles = StyleSheet.create({
  modalContent: {
    height: "25%",
    width: "100%",
    backgroundColor: COLOURS.light_black,
    borderTopRightRadius: SIZES.large,
    borderTopLeftRadius: SIZES.large,
    position: "absolute",
    bottom: 0,
    padding: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: COLOURS.text_grey,
    fontSize: SIZES.large - 2,
  },
  btnText: {
    color: COLOURS.bg_black,
    fontSize: SIZES.large,
    fontWeight: "bold",
  },
  btnViewContainer: {
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  btnContainer: {
    marginVertical: SIZES.large,
    padding: SIZES.small,
    paddingHorizontal: SIZES.xxxLarge + 5,
    borderRadius: SIZES.xSmall - 4,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
});
