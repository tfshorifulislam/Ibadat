import { StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import BottomMenu from "./Components/BottomMenu";

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />


      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});