import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { COLOURS, SIZES } from "../../constants/theme";

const PreviousGameItem = ({ item, handleGamePress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{new Date(item.date.toDate()).toDateString()}</Text>
      <Text style={styles.valueText}>
        <Text style={styles.attributeText}>Total Rolls: </Text>
        {item.total_rolls}
      </Text>
      <Text style={styles.valueText}>
        <Text style={styles.attributeText}>Duration: </Text>
        {item.duration}
      </Text>
      {item.trackerType == "serious" ? (
        <Text style={styles.valueText}>
          <Text style={styles.attributeText}>Winner: </Text>
          {item.winner}
        </Text>
      ) : (
        <Text style={[styles.valueText, { fontStyle: "italic", color: COLOURS.dark_blue }]}>
          Exhibition Game
        </Text>
      )}
    </View>
  );
};

export default PreviousGameItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLOURS.light_grey,
    marginVertical: SIZES.xxSmall,
    marginBottom: SIZES.xSmall,
    shadowColor: COLOURS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderRadius: SIZES.xSmall - 4,
    padding: SIZES.small,
  },
  attributeText: {
    color: COLOURS.light_black,
    fontSize: SIZES.medium,
    fontWeight: "bold",
  },
  valueText: {
    fontSize: SIZES.medium,
    color: COLOURS.light_black,
  },
  dateText: {
    fontSize: SIZES.medium + 1,
    color: COLOURS.light_black,
    fontWeight: "bold",
    alignSelf: "center",
  },
});
