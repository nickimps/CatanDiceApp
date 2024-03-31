import { Stack } from "expo-router/stack";
import * as NavigationBar from "expo-navigation-bar";
import * as StatusBar from "expo-status-bar";
import { useEffect } from "react";
import { COLOURS } from "../constants/theme";

export default function AppLayout() {
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(COLOURS.light_black);

    StatusBar.setStatusBarStyle("light");
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
