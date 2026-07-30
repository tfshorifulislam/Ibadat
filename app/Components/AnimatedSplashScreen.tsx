import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Props {
  onAnimationComplete?: () => void;
}

export default function AnimatedSplashScreen({ onAnimationComplete }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // 1. Fade in the whole screen and scale up logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Trigger completion after a set time (e.g. 2.5s)
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        // Fade out transition
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          onAnimationComplete();
        });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, glowAnim, onAnimationComplete]);

  return (
    <View style={styles.container}>
      {/* Soft background glow */}
      <Animated.View style={[styles.glow, { opacity: glowAnim }]} />
      
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="star-crescent" size={54} color="#D4AF37" style={styles.iconOffset} />
          <MaterialCommunityIcons name="book-open-page-variant" size={32} color="#34D399" style={styles.iconOverlap} />
        </View>
        
        <Text style={styles.appName}>Ibadah</Text>
        <Text style={styles.subtitle}>Your Daily Companion</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#001A18', // Deep dark green base
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  glow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(52, 211, 153, 0.12)', // Soft emerald glow
    top: '50%',
    left: '50%',
    transform: [{ translateX: -(width * 0.75) }, { translateY: -(width * 0.75) }],
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: 'rgba(212, 175, 55, 0.05)', // Very faint gold circle
    borderRadius: 65,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  iconOffset: {
    position: 'absolute',
    top: 24,
  },
  iconOverlap: {
    position: 'absolute',
    bottom: 28,
  },
  appName: {
    color: '#D4AF37', // Premium gold
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    color: '#34D399', // Emerald
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    opacity: 0.9,
    fontWeight: '600',
  },
});
