import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import BottomMenu from "./Components/BottomMenu";

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#003332" },
        }}
      />

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003332",
  },
});