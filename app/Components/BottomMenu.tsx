import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, router } from "expo-router";

interface BottomMenuProps {
  activeTab?: string;
  onTabPress?: (tabName: string) => void;
}

const NAV_ITEMS = [
  { id: "home", icon: "home-variant-outline", activeIcon: "home-variant" },
  { id: "book", icon: "book-open-page-variant-outline", activeIcon: "book-open-page-variant" },
  { id: "explore", icon: "compass-outline", activeIcon: "compass" },
];

const BottomMenu = ({ activeTab: propActiveTab, onTabPress }: BottomMenuProps) => {
  const pathname = usePathname();
  
  let currentTab = "home";
  if (pathname.startsWith("/book")) currentTab = "book";
  else if (pathname.startsWith("/explore")) currentTab = "explore";
  
  const activeTab = propActiveTab || currentTab;
  
  const activeColor = "#34D399";   
  const inactiveColor = "#64748B";

  const handlePress = (id: string) => {
    if (onTabPress) {
      onTabPress(id);
      return;
    }
    
    if (id === "home") router.replace("/");
    else if (id === "book") router.replace("/book");
    else if (id === "explore") router.replace("/explore");
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => handlePress(item.id)}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.pressed,
              ]}
            >
              {/* Active Pill Highlight */}
              {isActive && <View style={styles.activeIndicator} />}

              <MaterialCommunityIcons
                name={(isActive ? item.activeIcon : item.icon) as any}
                size={26}
                color={isActive ? activeColor : inactiveColor}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default BottomMenu;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#003332",
    paddingVertical: 20,
    paddingHorizontal: 8,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,

    // টপ বর্ডারে হালকা গ্লো লাইন
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  item: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },
  activeIndicator: {
    position: "absolute",
    width: 44,
    height: 44,
    backgroundColor: "rgba(52, 211, 153, 0.12)", // এক্টিভ আইকনের চারপাশে সাবটেল অ্যাকসেন্ট গ্লো
    borderRadius: 22,
    zIndex: -1,
  },
});