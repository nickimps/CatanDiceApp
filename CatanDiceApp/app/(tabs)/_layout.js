import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { COLOURS } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLOURS.teal,
        tabBarInactiveTintColor: COLOURS.ice_blue,
        tabBarStyle: {
          backgroundColor: COLOURS.light_black,
          borderTopWidth: 0,
          position: "absolute",
          height: 49,
        },
        headerStyle: { backgroundColor: COLOURS.light_black },
        headerTitleStyle: { color: COLOURS.text_grey },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Track",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="bar-chart" color={color} />,
          headerShown: false,
          // This tab will no longer show up in the tab bar.
          // href: null,
        }}
      />
    </Tabs>
  );
}
