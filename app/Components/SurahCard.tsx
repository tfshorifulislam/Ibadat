import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

interface SurahCardProps {
  id: number;
  nameArabic: string;
  nameSimple: string;
  versesCount: number;
  revelationPlace: string;
  translatedName: string;
}

export default function SurahCard({
  id,
  nameArabic,
  nameSimple,
  versesCount,
  revelationPlace,
  translatedName,
}: SurahCardProps) {
  const handlePress = () => {
    router.push(`/surah/${id}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressedCard]}
      onPress={handlePress}
    >
      {/* Left Section */}
      <View style={styles.leftSection}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{id}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.englishName} numberOfLines={1}>
            {nameSimple}
          </Text>
          <Text style={styles.translatedName} numberOfLines={1}>
            {translatedName}
          </Text>
        </View>
      </View>

      {/* Right Section (Fixed Overflows) */}
      <View style={styles.rightSection}>
        <Text style={styles.arabicName} numberOfLines={1}>
          {nameArabic}
        </Text>
        <View style={styles.metaGroup}>
          <Text style={styles.metaText}>{versesCount} Verses</Text>
          <Text style={styles.metaDot}> • </Text>
          <Text style={styles.metaText}>
            {revelationPlace?.toLowerCase() === 'makkah' ? 'Meccan' : 'Medinan'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pressedCard: {
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1, // বামের অংশ ফ্লেক্স করা হলো
    marginRight: 8,
  },
  numberBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1, // টেক্সট বাইরে যাওয়া আটকাবে
  },
  englishName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  translatedName: {
    color: '#94A3B8',
    fontSize: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 1, // এটি যোগ করার ফলে ডানপাশের লেখা বাইরে যাওয়া বন্ধ হবে
  },
  arabicName: {
    color: '#34D399',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'right',
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  metaText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaDot: {
    color: '#64748B',
    fontSize: 10,
    marginHorizontal: 3,
  },
});