import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import * as Device from "expo-device";
import React, { useEffect, useState } from "react";
import { COLOURS, SIZES } from "../../constants/theme";
import { VictoryAxis, VictoryBar, VictoryChart } from "victory-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";
import { Svg } from "react-native-svg";

const Tab = () => {
  const { height, width } = Dimensions.get("window");
  const [graphData, setGraphData] = useState([
    { number: 2, value: 0 },
    { number: 3, value: 0 },
    { number: 4, value: 0 },
    { number: 5, value: 0 },
    { number: 6, value: 0 },
    { number: 7, value: 0 },
    { number: 8, value: 0 },
    { number: 9, value: 0 },
    { number: 10, value: 0 },
    { number: 11, value: 0 },
    { number: 12, value: 0 },
  ]);
  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "History"));

      const tmpHistory = [];
      querySnapshot.forEach((doc) => {
        for (number in doc.data().dice_history) {
          tmpHistory.push({
            number: number,
            value: doc.data().dice_history[number],
          });
        }

        const result = sumValuesByNumber(tmpHistory);

        const finalHistory = [];
        for (number in result) {
          finalHistory.push({
            number: number,
            value: result[number],
          });
        }
        setGraphData(finalHistory);
      });
    };

    fetchData();
  }, [refresh]);

  const sumValuesByNumber = (data) => {
    const sums = {};

    data.forEach((item) => {
      const number = item.number;
      const value = item.value;

      if (sums[number]) {
        sums[number] += value;
      } else {
        sums[number] = value;
      }
    });

    return sums;
  };

  const handleRefresh = () => {
    console.log("refreshing");
    setRefresh(!refresh);
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.graphContainer}>
        <Svg width={width} onPress={handleRefresh}>
          <VictoryChart width={width} domainPadding={{ x: 7 }}>
            <VictoryAxis
              style={{
                axis: {
                  stroke: COLOURS.teal, //CHANGE COLOR OF X-AXIS
                },
                tickLabels: {
                  fill: COLOURS.text_grey, //CHANGE COLOR OF X-AXIS LABELS
                },
                axisLabel: {
                  fill: COLOURS.text_grey, //CHANGE COLOR OF LABEL
                  padding: 30,
                },
                ticks: {
                  stroke: COLOURS.teal,
                  size: 3,
                },
              }}
            />
            <VictoryBar
              data={graphData}
              x="number"
              y="value"
              labels={({ datum }) => String(Math.round(datum.value))}
              cornerRadius={{ top: 3 }}
              style={{
                data: { fill: COLOURS.teal, width: 18, color: COLOURS.teal },
                labels: { fontSize: SIZES.medium, fill: COLOURS.teal },
              }}
            />
          </VictoryChart>
        </Svg>
      </View>
      <View style={styles.btnViewContainer}>
        <TouchableOpacity
          style={[styles.btnContainer, { backgroundColor: COLOURS.green }]}
          onPress={handleRefresh}
        >
          <View>
            <Text style={[styles.btnText, { color: COLOURS.text_grey }]}>Refresh</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.btnViewContainer}>
        <Text>
          Add cards for the last X games, use a flatlist or something like from vantageprotection so
          its efficient
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Tab;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLOURS.bg_black,
    paddingTop: Device.manufacturer == "Apple" ? 0 : StatusBar.currentHeight,
    paddingHorizontal: SIZES.small,
  },
  graphContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLOURS.light_black,
    borderRadius: SIZES.xxSmall,
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
    backgroundColor: COLOURS.dark_orange,
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
