import { View, Text, SafeAreaView } from "react-native";
import { StyleSheet } from "react-native";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.location}>📍 Dhaka, Bangladesh</Text>
        <Text style={styles.hijriDate}>10 Safar 1448 AH</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
        <Text style={styles.nextPrayer}>Fajr</Text>
        <Text style={styles.time}>04:27 AM</Text>

        <View style={styles.countdownBox}>
          <Text style={styles.countdown}>02:15:36 Remaining</Text>
        </View>
      </View>

      <View style={styles.prayerContainer}>
        <View style={styles.prayerItem}>
          <Text style={styles.prayerName}>Fajr</Text>
          <Text style={styles.prayerTime}>04:27 AM</Text>
        </View>

        <View style={styles.prayerItem}>
          <Text style={styles.prayerName}>Dhuhr</Text>
          <Text style={styles.prayerTime}>12:05 PM</Text>
        </View>

        <View style={styles.prayerItem}>
          <Text style={styles.prayerName}>Asr</Text>
          <Text style={styles.prayerTime}>03:42 PM</Text>
        </View>

        <View style={styles.prayerItem}>
          <Text style={styles.prayerName}>Maghrib</Text>
          <Text style={styles.prayerTime}>06:31 PM</Text>
        </View>

        <View style={styles.prayerItem}>
          <Text style={styles.prayerName}>Isha</Text>
          <Text style={styles.prayerTime}>07:48 PM</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    marginBottom: 30,
  },

  location: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },

  hijriDate: {
    marginTop: 6,
    fontSize: 15,
    color: "#777",
  },

  card: {
    backgroundColor: "#1F7A5C",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 30,
  },

  nextPrayerLabel: {
    color: "#fff",
    fontSize: 16,
  },

  nextPrayer: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 10,
  },

  time: {
    color: "#fff",
    fontSize: 26,
    marginTop: 6,
  },

  countdownBox: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  countdown: {
    color: "#fff",
    fontWeight: "600",
  },

  prayerContainer: {
    gap: 14,
  },

  prayerItem: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  prayerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },

  prayerTime: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F7A5C",
  },
});