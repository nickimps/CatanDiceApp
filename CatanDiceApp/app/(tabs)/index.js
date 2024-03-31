import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as Device from "expo-device";
import { COLOURS, SIZES } from "../../constants/theme";
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis } from "victory-native";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const Tab = () => {
  const [lastRoll, setLastRoll] = useState("");
  const [diceHistoryLine, setDiceHistoryLine] = useState("");
  const [totalRolls, setTotalRolls] = useState(0);
  const [isNewGame, setIsNewGame] = useState(true);
  const [gameID, setGameID] = useState("");
  const [graphData, setGraphData] = useState([
    { number: 1, value: 0 },
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

  const { height, width } = Dimensions.get("window");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "History"), orderBy("date", "desc"), limit(1)),
      (snapshot) => {
        // Adds the dice history values from DB to the graphData in the same mapping format
        snapshot.forEach((game) => {
          if (game.data().winner == "") {
            setIsNewGame(false);
            const tmpHistory = [];
            for (number in game.data().dice_history) {
              tmpHistory.push({
                number: number,
                value: game.data().dice_history[number],
              });
            }
            setGraphData(tmpHistory);

            setTotalRolls(game.data().total_rolls);
            setDiceHistoryLine(game.data().dice_history_line);
            setGameID(game.id);
          } else {
            setIsNewGame(true);
          }
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const buttonPressed = async (option) => {
    console.log(option + " pressed");

    if (option != "undo") {
      setLastRoll(option);

      let tmpHistory = graphData;
      tmpHistory[option - 1].value = tmpHistory[option - 1].value + 1;

      // Convert data to map for firebase
      const updated_dice_history = tmpHistory.reduce(function (map, obj) {
        map[obj.number] = obj.value;
        return map;
      }, {});

      // Get new dice history line
      let updated_dice_history_line = diceHistoryLine;
      if (diceHistoryLine == "No Rolls Recorded") {
        updated_dice_history_line = option;
      } else {
        updated_dice_history_line = option + ", " + updated_dice_history_line;
      }

      // Update DB with new total rolls and dice history info
      await updateDoc(doc(db, "History", gameID), {
        total_rolls: totalRolls + 1,
        dice_history: updated_dice_history,
        dice_history_line: updated_dice_history_line,
      });
    } else {
      if (totalRolls > 0) {
        // Split apart dice history line and remove the first index
        const historySplit = diceHistoryLine.split(", ");
        const removedNumber = historySplit.shift();

        let updated_dice_history_line = "";
        for (number in historySplit) {
          number == 0
            ? (updated_dice_history_line = historySplit[number])
            : (updated_dice_history_line = updated_dice_history_line + ", " + historySplit[number]);
        }

        // Find removed number from dice history and decrement the map
        let tmpHistory = graphData;
        tmpHistory[removedNumber - 1].value = tmpHistory[removedNumber - 1].value - 1;

        // Convert data to map for firebase
        const updated_dice_history = tmpHistory.reduce(function (map, obj) {
          map[obj.number] = obj.value;
          return map;
        }, {});

        // Make `lastRoll` equal to new last roll number
        setLastRoll(historySplit[0]);

        // Update DB with new total rolls and dice history info
        await updateDoc(doc(db, "History", gameID), {
          total_rolls: totalRolls - 1,
          dice_history: updated_dice_history,
          dice_history_line: updated_dice_history_line,
        });
      }
    }
  };

  const newGame = async () => {
    console.log("newGame pressed");

    setLastRoll("");

    // should add popup asking if they are sure

    // need to get players names with popup too
    const players = ["Nick", "Other"];

    // need to get expansion too from popup
    const expansion = "";

    // Add a new document with a generated id.
    await addDoc(collection(db, "History"), {
      players: players,
      date: serverTimestamp(),
      dice_history: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
      },
      dice_history_line: "No Rolls Recorded",
      expansion: expansion,
      total_rolls: 0,
      winner: "",
    })
      .then((doc) => {
        console.log("Document written with ID: ", doc.id);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={{ flex: 1 }}>
        {isNewGame ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: COLOURS.text_grey }}>
              To start a new game, press the button below.
            </Text>
          </View>
        ) : (
          <View>
            <View style={styles.graphContainer}>
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
                  // label={"Roll"}
                />
                {/* <VictoryAxisdependentAxisstyle={{ axis: {stroke: COLOURS.text_grey, 
                //CHANGE COLOR OF Y-AXIS},tickLabels: {
                fill: COLOURS.text_grey, //CHANGE COLOR OF Y-AXIS LABELS},grid: {
                stroke: COLOURS.placeholder_grey, //CHANGE COLOR OF Y-AXIS GRID LINES
                strokeDasharray: "7",},}}/> */}
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
                  animate
                />
              </VictoryChart>
            </View>

            <View style={styles.rollContainer}>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Total Rolls: </Text>
                {totalRolls}
              </Text>
              <Text style={[styles.text, { paddingTop: SIZES.xxxSmall }]}>
                <Text style={styles.boldText}>Last Roll: </Text>
                {diceHistoryLine}
              </Text>
            </View>

            {lastRoll != "" && (
              <View style={styles.currentRollContainer}>
                <Text style={styles.currentRollText}>{lastRoll}</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  style={styles.numberBtnContainer}
                  onPress={() => {
                    buttonPressed("2");
                  }}
                >
                  <View>
                    <Text style={styles.btnText}>2</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.numberBtnContainer}
                  onPress={() => {
                    buttonPressed("3");
                  }}
                >
                  <View>
                    <Text style={styles.btnText}>3</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.numberBtnContainer}
                  onPress={() => {
                    buttonPressed("4");
                  }}
                >
                  <View>
                    <Text style={styles.btnText}>4</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  style={styles.numberBtnContainer}
                  onPress={() => {
                    buttonPressed("5");
                  }}
                >
                  <View>
                    <Text style={styles.btnText}>5</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.numberBtnContainer}
                  onPress={() => {
                    buttonPressed("6");
                  }}
                >
                  <View>
                    <Text style={styles.btnText}>6</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.numberBtnContainer}
                  onPress={() => {
                    buttonPressed("7");
                  }}
                >
                  <View>
                    <Text style={styles.btnText}>7</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  style={styles.numberBtnContainer}
                  onPress={() => {
                    buttonPressed("8");
                  }}
                >
                  <View>
                    <Text style={styles.btnText}>8</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.numberBtnContainer}
                  onPress={() => {
                    buttonPressed("9");
                  }}
                >
                  <View>
                    <Text style={styles.btnText}>9</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.numberBtnContainer}
                  onPress={() => {
                    buttonPressed("10");
                  }}
                >
                  <View>
                    <Text style={styles.btnText}>10</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  style={styles.numberBtnContainer}
                  onPress={() => {
                    buttonPressed("11");
                  }}
                >
                  <View>
                    <Text style={styles.btnText}>11</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.numberBtnContainer}
                  onPress={() => {
                    buttonPressed("12");
                  }}
                >
                  <View>
                    <Text style={styles.btnText}>12</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={
                    totalRolls > 0
                      ? [styles.numberBtnContainer, { backgroundColor: COLOURS.ice_blue }]
                      : { width: 120, backgroundColor: COLOURS.bg_black }
                  }
                  onPress={() => {
                    buttonPressed("undo");
                  }}
                  disabled={totalRolls < 0}
                >
                  <View>
                    <FontAwesome size={25} name="undo" color={COLOURS.bg_black} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={{ alignSelf: "center" }}>
        <TouchableOpacity style={styles.newGameBtnContainer} onPress={newGame}>
          <View>
            <Text style={[styles.btnText, { color: COLOURS.text_grey }]}>New Game</Text>
          </View>
        </TouchableOpacity>
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
  text: {
    color: COLOURS.text_grey,
  },
  boldText: {
    color: COLOURS.text_grey,
    fontWeight: "bold",
  },
  currentRollText: {
    color: COLOURS.bg_black,
    fontWeight: "bold",
    fontSize: SIZES.large,
  },
  btnText: {
    color: COLOURS.bg_black,
    fontSize: SIZES.large,
    fontWeight: "bold",
  },
  graphContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLOURS.light_black,
    borderRadius: SIZES.xxSmall,
  },
  rollContainer: {
    marginTop: SIZES.small,
    padding: SIZES.small,
    backgroundColor: COLOURS.light_black,
    borderRadius: SIZES.xxSmall,
  },
  currentRollContainer: {
    marginTop: SIZES.small,
    padding: SIZES.small,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLOURS.ice_blue,
    borderRadius: SIZES.xxSmall,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  numberBtnContainer: {
    width: 120,
    marginTop: SIZES.large,
    padding: SIZES.small,
    paddingHorizontal: SIZES.xxxLarge + 5,
    backgroundColor: COLOURS.teal,
    borderRadius: SIZES.xSmall - 4,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  newGameBtnContainer: {
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
