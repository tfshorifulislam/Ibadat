import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface QuranHeaderProps {
  title: string;
  subtitle: string;
}

export default function QuranHeader({ title, subtitle }: QuranHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 15,
    marginTop: 4,
  },
});
