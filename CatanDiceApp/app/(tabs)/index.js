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
import { VictoryBar, VictoryChart, VictoryAxis, Data } from "victory-native";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import DeleteGameModal from "../../components/modals/DeleteGameModal";
import ClearGameModal from "../../components/modals/ClearGameModal";
import EndGameModal from "../../components/modals/EndGameModal";
import ChooseWinnerModal from "../../components/modals/ChooseWinnerModal";
import NewGameModal from "../../components/modals/NewGameModal";

const Tab = () => {
  const [lastRoll, setLastRoll] = useState("");
  const [diceHistoryLine, setDiceHistoryLine] = useState("");
  const [totalRolls, setTotalRolls] = useState(0);
  const [trackerType, setTrackerType] = useState("exhibition");
  const [isNewGame, setIsNewGame] = useState(true);
  const [gameID, setGameID] = useState("");
  const [showClearGameModal, setShowClearGameModal] = useState(false);
  const [showEndGameModal, setShowEndGameModal] = useState(false);
  const [showDeleteGameModal, setShowDeleteGameModal] = useState(false);
  const [showChooseWinnerModal, setShowChooseWinnerModal] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
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
      tmpHistory[option - 2].value = tmpHistory[option - 2].value + 1;

      // Convert data to map for firebase
      const updated_dice_history = tmpHistory.reduce(function (map, obj) {
        map[obj.number] = obj.value;
        return map;
      }, {});

      // Get new dice history line
      let updated_dice_history_line = diceHistoryLine;
      if (diceHistoryLine == "No Rolls Recorded" || diceHistoryLine == "") {
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

        if (updated_dice_history_line == "") {
          updated_dice_history_line = "No Rolls Recorded";
        }

        // Find removed number from dice history and decrement the map
        let tmpHistory = graphData;
        tmpHistory[removedNumber - 2].value = tmpHistory[removedNumber - 2].value - 1;

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

    setShowNewGameModal(true);
  };

  const onNewGameModalClose = async (newGameStarted, trackerType) => {
    setShowNewGameModal(false);

    if (newGameStarted) {
      setLastRoll("");
      setTrackerType(trackerType);

      // Add a new document with a generated id.
      await addDoc(collection(db, "History"), {
        trackerType: trackerType,
        dice_history_line: "No Rolls Recorded",
        total_rolls: 0,
        winner: "",
        date: serverTimestamp(),
        duration: "00:00",
        startTime: serverTimestamp(),
        endTime: serverTimestamp(),
        dice_history: {
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
      })
        .then((doc) => {
          console.log("Document written with ID: ", doc.id);
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  };

  const endGame = () => {
    console.log("end game pressed");

    setShowEndGameModal(true);
  };

  const onEndGameModalClose = async (endGame) => {
    // Hide the modal
    setShowEndGameModal(false);

    if (endGame) {
      // If a serious game, need to show the winner options
      if (trackerType === "serious") {
        setShowChooseWinnerModal(true);
      } else {
        // Update the database and make winner exhibition so that the game finishes.
        await updateDoc(doc(db, "History", gameID), {
          winner: "exhibition",
          endTime: serverTimestamp(),
        });
      }

      // Get the game duration and update database
      const endTime = Timestamp.fromDate(new Date());
      await getDocs(query(collection(db, "History"), orderBy("date", "desc"), limit(1))).then(
        async (currentGame) => {
          const startDate = new Date(currentGame.docs[0].data().startTime.toDate());
          const endDate = new Date(endTime.toDate());

          const diffInMs = Math.abs(endDate - startDate);
          const diffInSeconds = Math.floor(diffInMs / 1000);
          const diffInMinutes = Math.floor(diffInSeconds / 60);
          const diffInHours = Math.floor(diffInMinutes / 60);

          const remainingMinutes = diffInMinutes % 60;

          const formattedHours = String(diffInHours); //.padStart(2, "0");
          const formattedMinutes = String(remainingMinutes); //.padStart(2, "0");

          let duration = "";
          diffInHours.toFixed() == 0
            ? (duration = `${formattedMinutes} min`)
            : (duration = `${formattedHours}hr ${formattedMinutes}min`);

          await updateDoc(doc(db, "History", gameID), {
            endTime: endTime,
            duration: duration,
          });
        }
      );
    }
  };

  const onWinnerModalClose = async (winnerChosen, winner) => {
    setShowChooseWinnerModal(false);

    if (winnerChosen) {
      // Update the database and choose a winner, by choosing a winner, the board will clear
      await updateDoc(doc(db, "History", gameID), {
        winner: winner,
      });
    }
  };

  const clearGame = () => {
    setShowClearGameModal(true);
  };

  const onClearGameModalClose = async (clearGame) => {
    setShowClearGameModal(false);

    if (clearGame) {
      // Create blank dice_history map
      let tmpHistory = [
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
      ];

      // Convert data to map for firebase
      const updated_dice_history = tmpHistory.reduce(function (map, obj) {
        map[obj.number] = obj.value;
        return map;
      }, {});

      await updateDoc(doc(db, "History", gameID), {
        total_rolls: 0,
        dice_history: updated_dice_history,
        dice_history_line: "No Rolls Recorded",
        startTime: serverTimestamp(),
        endTime: serverTimestamp(),
      });
    }
  };

  const deleteGame = () => {
    setShowDeleteGameModal(true);
  };

  const onDeleteGameModalClose = async (deleteGame) => {
    setShowDeleteGameModal(false);

    if (deleteGame) {
      await deleteDoc(doc(db, "History", gameID));
    }
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
            </View>

            <View style={styles.rollContainer}>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Total Rolls: </Text>
                {totalRolls}
              </Text>
              <Text style={[styles.text, { paddingTop: SIZES.xxxSmall }]} numberOfLines={2}>
                <Text style={styles.boldText}>Last Roll: </Text>
                {diceHistoryLine}
              </Text>
            </View>

            {totalRolls > 0 ? (
              <View style={styles.currentRollContainer}>
                <Text style={styles.currentRollText}>{lastRoll}</Text>
              </View>
            ) : (
              <View style={styles.currentRollContainer}>
                <Text style={styles.currentRollText}>--</Text>
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
      <View style={styles.btnViewContainer}>
        {isNewGame ? (
          <TouchableOpacity
            style={[styles.newGameBtnContainer, { backgroundColor: COLOURS.green }]}
            onPress={newGame}
          >
            <View>
              <Text style={[styles.btnText, { color: COLOURS.text_grey }]}>New Game</Text>
            </View>
          </TouchableOpacity>
        ) : totalRolls > 0 ? (
          <View style={styles.btnViewContainer}>
            <TouchableOpacity style={styles.newGameBtnContainer} onPress={clearGame}>
              <View>
                <Text style={[styles.btnText, { color: COLOURS.text_grey }]}>Clear</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.endGameBtnContainer} onPress={endGame}>
              <View>
                <Text style={[styles.btnText, { color: COLOURS.text_grey }]}>Finish</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.newGameBtnContainer} onPress={deleteGame}>
            <View>
              <Text style={[styles.btnText, { color: COLOURS.text_grey }]}>Delete Game</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <DeleteGameModal isVisible={showDeleteGameModal} onClose={onDeleteGameModalClose} />
      <ClearGameModal isVisible={showClearGameModal} onClose={onClearGameModalClose} />
      <EndGameModal isVisible={showEndGameModal} onClose={onEndGameModalClose} />
      <ChooseWinnerModal isVisible={showChooseWinnerModal} onClose={onWinnerModalClose} />
      <NewGameModal isVisible={showNewGameModal} onClose={onNewGameModalClose} />
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
    paddingBottom: SIZES.tabBarHeight,
  },
  text: {
    fontSize: SIZES.medium - 1,
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
  endGameBtnContainer: {
    marginVertical: SIZES.large,
    padding: SIZES.small,
    paddingHorizontal: SIZES.xxxLarge + 5,
    backgroundColor: COLOURS.green,
    borderRadius: SIZES.xSmall - 4,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  btnViewContainer: {
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  timeContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SIZES.xSmall,
  },
});
