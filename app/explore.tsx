import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import QiblaCompass from './Components/QiblaCompass';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <QiblaCompass />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#003332',
    marginTop: 45, // matching user's recent change logic
  },
});
