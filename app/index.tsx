import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Prayer = {
  name: string;
  startTime: string;
  endTime: string;
  active: boolean;
  rawTime: Date;
};

// --- Helpers ---
const getFormattedDateForApi = (date: Date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

const formatTime12Hour = (timeStr: string) => {
  // e.g. "14:30" or "04:08 (BST)"
  const clean = timeStr.split(" ")[0];
  const [hourStr, minStr] = clean.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, "0")}:${minStr} ${ampm}`;
};

const formatTimeDate = (date: Date) => {
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
};

const parseTimeToDate = (timeStr: string, baseDate: Date) => {
  const clean = timeStr.split(" ")[0];
  const [h, m] = clean.split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
};

export default function Home() {
  const [prayerTimes, setPrayerTimes] = useState<Prayer[]>([]);
  const [locationName, setLocationName] = useState("Locating...");
  const [isLoading, setIsLoading] = useState(true);

  const [currentPrayer, setCurrentPrayer] = useState<string>("None");
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date | null }>({
    name: "Loading...",
    time: null,
  });
  const [remainingTime, setRemainingTime] = useState("00:00:00");

  const [currentDateStr, setCurrentDateStr] = useState("");

  const updateCurrentDateStr = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    setCurrentDateStr(new Date().toLocaleDateString("en-GB", options));
  };

  const fetchPrayerTimes = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow location access to fetch accurate prayer times.");
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode.length > 0) {
          const place = geocode[0];
          setLocationName(`${place.city || place.region || "Unknown"}, ${place.country}`);
        }
      } catch (geocodeError) {
        setLocationName("Location found"); // Fallback if reverse geocode fails
      }

      const today = new Date();
      const dateStr = getFormattedDateForApi(today);
      const cacheKey = `prayers_${dateStr}_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;

      let timings: any = null;
      let tomorrowFajrTimeStr: string | null = null;

      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        timings = data.timings;
        tomorrowFajrTimeStr = data.tomorrowFajr;
      } else {
        // Fetch Today
        const res = await fetch(
          `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`
        );
        const json = await res.json();

        // Fetch Tomorrow (to get Isha end time)
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDateStr = getFormattedDateForApi(tomorrow);
        const tomorrowRes = await fetch(
          `https://api.aladhan.com/v1/timings/${tomorrowDateStr}?latitude=${latitude}&longitude=${longitude}&method=2`
        );
        const tomorrowJson = await tomorrowRes.json();

        if (json.code === 200 && tomorrowJson.code === 200) {
          timings = json.data.timings;
          tomorrowFajrTimeStr = tomorrowJson.data.timings.Fajr;
          await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify({ timings, tomorrowFajr: tomorrowFajrTimeStr })
          );
        }
      }

      if (timings && tomorrowFajrTimeStr) {
        processPrayerData(timings, tomorrowFajrTimeStr, today);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Fetch error", error);
      Alert.alert("Offline", "Unable to load prayer times. Check your internet connection.");
      setIsLoading(false);
    }
  };

  const processPrayerData = (timings: any, tomorrowFajrStr: string, baseDate: Date) => {
    const formatClean = (t: string) => formatTime12Hour(t.split(" ")[0]);

    const pData: Prayer[] = [
      {
        name: "Fajr",
        startTime: formatClean(timings.Fajr),
        endTime: formatClean(timings.Sunrise),
        active: false,
        rawTime: parseTimeToDate(timings.Fajr, baseDate),
      },
      {
        name: "Dhuhr",
        startTime: formatClean(timings.Dhuhr),
        endTime: formatClean(timings.Asr),
        active: false,
        rawTime: parseTimeToDate(timings.Dhuhr, baseDate),
      },
      {
        name: "Asr",
        startTime: formatClean(timings.Asr),
        endTime: formatClean(timings.Maghrib),
        active: false,
        rawTime: parseTimeToDate(timings.Asr, baseDate),
      },
      {
        name: "Maghrib",
        startTime: formatClean(timings.Maghrib),
        endTime: formatClean(timings.Isha),
        active: false,
        rawTime: parseTimeToDate(timings.Maghrib, baseDate),
      },
      {
        name: "Isha",
        startTime: formatClean(timings.Isha),
        endTime: `Next Day ${formatClean(tomorrowFajrStr)}`,
        active: false,
        rawTime: parseTimeToDate(timings.Isha, baseDate),
      },
    ];

    setPrayerTimes(pData);
    updatePrayerStatus(pData);
  };

  const updatePrayerStatus = (prayers: Prayer[]) => {
    if (!prayers || prayers.length === 0) return;

    const now = new Date();
    let current = "Isha"; // default if before Fajr or after Isha
    let next = { name: "Fajr", time: new Date() };

    let foundNext = false;
    for (let i = 0; i < prayers.length; i++) {
      if (now < prayers[i].rawTime) {
        next = { name: prayers[i].name, time: prayers[i].rawTime };
        current = i === 0 ? "Isha" : prayers[i - 1].name;
        foundNext = true;
        break;
      }
    }

    if (!foundNext) {
      current = "Isha";
      const tomorrowFajrTime = new Date(prayers[0].rawTime);
      tomorrowFajrTime.setDate(tomorrowFajrTime.getDate() + 1);
      next = { name: "Fajr", time: tomorrowFajrTime };
    }

    const updatedPrayers = prayers.map((p) => ({
      ...p,
      active: p.name === current,
    }));

    setPrayerTimes(updatedPrayers);
    setCurrentPrayer(current);
    setNextPrayer(next);
  };

  const calculateRemainingTime = () => {
    if (!nextPrayer.time) return;

    const now = new Date();
    const diff = nextPrayer.time.getTime() - now.getTime();

    if (diff <= 0) {
      updatePrayerStatus(prayerTimes);
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    setRemainingTime(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    );
  };

  useEffect(() => {
    updateCurrentDateStr();
    fetchPrayerTimes();
  }, []);

  // Update countdown every second and check midnight
  useEffect(() => {
    if (prayerTimes.length === 0) return;

    const timer = setInterval(() => {
      calculateRemainingTime();

      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      const todayFormatted = new Date().toLocaleDateString("en-GB", options);

      if (currentDateStr && todayFormatted !== currentDateStr) {
        updateCurrentDateStr();
        fetchPrayerTimes();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextPrayer, prayerTimes, currentDateStr]);

  if (isLoading && prayerTimes.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#10B981" />

          <Text style={styles.loadingTitle}>
            Fetching Prayer Times
          </Text>

          <Text style={styles.loadingSubtitle}>
            Please wait while we prepare today's prayer schedule.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
              {" "}
              {locationName}
            </Text>
            <Text style={styles.dateText}>{currentDateStr}</Text>
          </View>
        </View>

        {/* Main Prayer Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.nextPrayerLabel}>
              CURRENT PRAYER: {currentPrayer.toUpperCase()}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{remainingTime} Re:</Text>
            </View>
          </View>

          <Text style={[styles.nextPrayerLabel, { marginTop: 12 }]}>NEXT PRAYER</Text>
          <Text style={[styles.prayerTitle, { marginTop: 2 }]}>{nextPrayer.name}</Text>
          <Text style={styles.prayerTimeText}>
            {nextPrayer.time ? formatTimeDate(nextPrayer.time) : ""}
          </Text>

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
                  name="clock-time-four-outline"
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

              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={[
                    styles.prayerTime,
                    item.active && styles.activePrayerTime,
                  ]}
                >
                  Start: {item.startTime}
                </Text>
                <Text
                  style={[
                    styles.prayerTime,
                    item.active && styles.activePrayerTime,
                    { fontSize: 13, marginTop: 2 },
                  ]}
                >
                  End: {item.endTime}
                </Text>
              </View>
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
    width: "100%",
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingCard: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },

  loadingTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  loadingSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },

});