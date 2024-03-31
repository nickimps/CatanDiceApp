import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { COLOURS } from "../../constants/theme";

const Tab = () => {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        backgroundColor: COLOURS.bg_black,
      }}
    >
      <Text>Tab [history]</Text>
    </View>
  );
};

export default Tab;

const styles = StyleSheet.create({});
