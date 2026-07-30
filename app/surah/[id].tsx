import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SurahDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [chapter, setChapter] = useState<any>(null);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurahData = async () => {
      try {
        setLoading(true);
        // Fetch chapter metadata
        const chapterRes = await fetch(`https://api.quran.com/api/v4/chapters/${id}?language=en`);
        if (!chapterRes.ok) throw new Error('Failed to fetch chapter details');
        const chapterData = await chapterRes.json();
        setChapter(chapterData.chapter);

        // Fetch verses (Uthmani script)
        const versesRes = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`);
        if (!versesRes.ok) throw new Error('Failed to fetch verses');
        const versesData = await versesRes.json();
        setVerses(versesData.verses);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSurahData();
  }, [id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{chapter?.name_simple || 'Loading...'}</Text>
          {chapter && (
            <Text style={styles.headerSubtitle}>{chapter.translated_name.name}</Text>
          )}
        </View>
        <View style={{ width: 40 }}>
          {/* balance for back button */}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#34D399" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            chapter?.bismillah_pre && id !== "1" && id !== "9" ? (
              <View style={styles.bismillahContainer}>
                <Text style={styles.bismillahText}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</Text>
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <View style={styles.verseCard}>
              <View style={styles.verseHeader}>
                <View style={styles.verseNumberBadge}>
                  <Text style={styles.verseNumber}>{index + 1}</Text>
                </View>
                <MaterialCommunityIcons name="share-variant-outline" size={20} color="#64748B" />
              </View>
              <Text style={styles.verseText}>{item.text_uthmani}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#003332',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#34D399',
    fontSize: 12,
    marginTop: 2,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Accommodate Bottom Menu layout if present
    paddingTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginTop: 12,
  },
  bismillahContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
    borderRadius: 16,
  },
  bismillahText: {
    color: '#34D399',
    fontSize: 24,
  },
  verseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseNumber: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: 'bold',
  },
  verseText: {
    color: '#FFFFFF',
    fontSize: 28,
    textAlign: 'right',
    lineHeight: 48,
  },
});
