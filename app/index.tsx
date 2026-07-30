import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Home() {
  const prayerTimes = [
    { name: "Fajr", time: "04:30 AM", active: false },
    { name: "Sunrise", time: "05:45 AM", active: false },
    { name: "Dhuhr", time: "12:15 PM", active: false },
    { name: "Asr", time: "04:15 PM", active: true }, // Current Next Prayer
    { name: "Maghrib", time: "06:30 PM", active: false },
    { name: "Isha", time: "07:45 PM", active: false },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationText}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color="#34D399" />
              {" "}Dhaka, Bangladesh
            </Text>
            <Text style={styles.dateText}>Friday, 31 July 2026</Text>
          </View>
        </View>

        {/* Main Prayer Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.nextPrayerLabel}>NEXT PRAYER</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>In 01h 15m</Text>
            </View>
          </View>

          <Text style={styles.prayerTitle}>Asr</Text>
          <Text style={styles.prayerTimeText}>04:15 PM</Text>

          <View style={styles.heroFooter}>
            <MaterialCommunityIcons name="compass-rose" size={20} color="#34D399" />
            <Text style={styles.qiblaText}>Qibla Direction: 268° W</Text>
          </View>
        </View>

        {/* Today's Prayer Schedule List */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>

          {prayerTimes.map((item, index) => (
            <View
              key={index}
              style={[
                styles.prayerRow,
                item.active && styles.activePrayerRow,
              ]}
            >
              <View style={styles.prayerNameGroup}>
                <MaterialCommunityIcons
                  name={
                    item.name === "Sunrise"
                      ? "weather-sunset-up"
                      : "clock-time-four-outline"
                  }
                  size={20}
                  color={item.active ? "#34D399" : "#64748B"}
                />
                <Text
                  style={[
                    styles.prayerName,
                    item.active && styles.activePrayerName,
                  ]}
                >
                  {item.name}
                </Text>
              </View>

              <Text
                style={[
                  styles.prayerTime,
                  item.active && styles.activePrayerTime,
                ]}
              >
                {item.time}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#003332",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 100, // Bottom menu-র জায়গা রাখার জন্য
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  locationText: {
    color: "#34D399",
    fontSize: 14,
    fontWeight: "600",
  },
  dateText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.15)",
    marginBottom: 28,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextPrayerLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#34D399",
    fontSize: 12,
    fontWeight: "600",
  },
  prayerTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 12,
  },
  prayerTimeText: {
    color: "#34D399",
    fontSize: 24,
    fontWeight: "600",
    marginTop: 2,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  qiblaText: {
    color: "#E2E8F0",
    fontSize: 13,
    marginLeft: 8,
  },
  scheduleSection: {
    gap: 10,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  prayerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  activePrayerRow: {
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    borderColor: "rgba(52, 211, 153, 0.3)",
  },
  prayerNameGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  prayerName: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "500",
  },
  activePrayerName: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  prayerTime: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "500",
  },
  activePrayerTime: {
    color: "#34D399",
    fontWeight: "700",
  },
});