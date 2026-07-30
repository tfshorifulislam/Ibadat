import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, Text, TextInput, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QuranHeader from './Components/QuranHeader';
import SurahCard from './Components/SurahCard';

export default function BookScreen() {
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChapters = async () => {
    try {
      const response = await fetch('https://api.quran.com/api/v4/chapters?language=en');
      if (!response.ok) throw new Error('Failed to fetch chapters');
      const data = await response.json();
      setChapters(data.chapters);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChapters();
  };

  const filteredChapters = chapters.filter((chapter) => {
    const q = searchQuery.toLowerCase();
    return (
      chapter.name_simple.toLowerCase().includes(q) ||
      chapter.name_arabic.includes(q) ||
      chapter.translated_name.name.toLowerCase().includes(q) ||
      chapter.id.toString() === q
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <QuranHeader title="Quran" subtitle="Read and explore the Holy Quran" />
      
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={22} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Surah by name ..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#34D399" />
          <Text style={styles.loadingText}>Loading Surahs...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChapters}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#34D399" colors={["#34D399"]} />
          }
          renderItem={({ item }) => (
            <SurahCard
              id={item.id}
              nameArabic={item.name_arabic}
              nameSimple={item.name_simple}
              versesCount={item.verses_count}
              revelationPlace={item.revelation_place}
              translatedName={item.translated_name.name}
            />
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
    marginTop: 35,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110, // accommodate bottom menu
    paddingTop: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#34D399',
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 12,
    fontSize: 16,
  },
});
