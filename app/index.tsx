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
              {" "}{locationName}
            </Text>
            <Text style={styles.dateText}>{currentDateStr}</Text>
          </View>
          <View style={styles.iconButton}>
            <MaterialCommunityIcons name="bell-outline" size={20} color="#FFFFFF" />
          </View>
        </View>

        {/* Main Prayer Hero Card */}
        <View style={styles.heroCard}>
          {/* Current Prayer & Remaining Badge */}
          <View style={styles.heroHeader}>
            <View style={styles.currentPrayerGroup}>
              <Text style={styles.currentPrayerLabel}>CURRENT PRAYER</Text>
              <Text style={styles.currentPrayerValue}>{currentPrayer.toUpperCase()}</Text>
            </View>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="timer-sand" size={12} color="#34D399" />
              <Text style={styles.badgeText}>{remainingTime} Left</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          {/* Next Prayer Details */}
          <Text style={styles.nextPrayerLabel}>NEXT PRAYER</Text>
          <Text style={styles.prayerTitle}>{nextPrayer.name}</Text>
          <Text style={styles.prayerTimeText}>
            {nextPrayer.time ? formatTimeDate(nextPrayer.time) : ""}
          </Text>

          {/* Hero Footer */}
          <View style={styles.heroFooter}>
            <MaterialCommunityIcons name="compass-rose" size={18} color="#34D399" />
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
                styles.prayerCard,
                item.active && styles.activePrayerCard,
              ]}
            >
              {/* Left Side: Icon & Prayer Name */}
              <View style={styles.prayerInfoGroup}>
                <View style={[styles.iconContainer, item.active && styles.activeIconContainer]}>
                  <MaterialCommunityIcons
                    name={item.active ? "bell-ring-outline" : "clock-time-four-outline"}
                    size={18}
                    color={item.active ? "#34D399" : "#64748B"}
                  />
                </View>

                <View>
                  <Text style={[styles.prayerName, item.active && styles.activePrayerName]}>
                    {item.name}
                  </Text>
                  {item.active}
                </View>
              </View>

              {/* Right Side: Start & End Times */}
              <View style={styles.timeGroup}>
                <View style={[styles.timeBadge, item.active && styles.activeTimeBadge]}>
                  <Text style={styles.timeLabel}>Start</Text>
                  <Text style={[styles.timeValue, item.active && styles.activeTimeValue]}>
                    {item.startTime}
                  </Text>
                </View>

                <View style={[styles.timeBadge, item.active && styles.activeTimeBadge]}>
                  <Text style={styles.timeLabel}>End</Text>
                  <Text style={[styles.timeValue, item.active && styles.activeTimeValue]}>
                    {item.endTime}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#003332",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  activePrayerCard: {
    backgroundColor: "rgba(52, 211, 153, 0.10)",
    borderWidth: 1,
    borderColor: "#34D399",
  },

  loadingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 30,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.15)",
  },
  loadingTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#003332",
    marginTop: 50,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },

  // Hero Card Styles
  heroCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.18)",
    marginBottom: 24,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentPrayerGroup: {
    gap: 2,
  },
  currentPrayerLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  currentPrayerValue: {
    color: "#34D399",
    fontSize: 14,
    fontWeight: "700",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.2)",
  },
  badgeText: {
    color: "#34D399",
    fontSize: 11,
    fontWeight: "600",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 14,
  },
  nextPrayerLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  prayerTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 4,
  },
  prayerTimeText: {
    color: "#34D399",
    fontSize: 22,
    fontWeight: "600",
    marginTop: 2,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  qiblaText: {
    color: "#CBD5E1",
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "500",
  },

  // Schedule Section Styles
  scheduleSection: {
    gap: 10,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  prayerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.025)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },

  prayerInfoGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeIconContainer: {
    backgroundColor: "rgba(52, 211, 153, 0.15)",
  },
  prayerName: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "600",
  },
  activePrayerName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  timeGroup: {
    flexDirection: "row",
    gap: 8,
    flexShrink: 1,
    justifyContent: "flex-end",
  },
  timeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
  },
  activeTimeBadge: {
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    borderColor: "rgba(52, 211, 153, 0.2)",
  },
  timeLabel: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  timeValue: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  activeTimeValue: {
    color: "#34D399",
    fontWeight: "700",
  },
});