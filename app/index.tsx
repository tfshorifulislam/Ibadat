import { SafeAreaView, Text } from "react-native";

export default function Home() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello Expo Router 🚀</Text>
    </SafeAreaView>
  );
}