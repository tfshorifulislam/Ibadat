import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BottomMenu = () => {
  const activeColor = "#16A34A";
  const inactiveColor = "#9CA3AF";

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item}>
        <MaterialCommunityIcons
          name="home-variant"
          size={28}
          color={activeColor}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <MaterialCommunityIcons
          name="book-open-page-variant"
          size={28}
          color={inactiveColor}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <MaterialCommunityIcons
          name="compass-outline"
          size={28}
          color={inactiveColor}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <MaterialCommunityIcons
          name="counter"
          size={28}
          color={inactiveColor}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <MaterialCommunityIcons
          name="account-circle-outline"
          size={30}
          color={inactiveColor}
        />
      </TouchableOpacity>
    </View>
  );
};

export default BottomMenu;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    backgroundColor: "#FFFFFF",
    paddingVertical: 16,

    borderRadius: 22,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 10,
  },

  item: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});