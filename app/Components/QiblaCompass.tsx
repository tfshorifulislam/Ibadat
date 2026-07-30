import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.85;

// Kaaba Coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const getQiblaBearing = (lat: number, lng: number) => {
  const PI = Math.PI;
  const kaabaLat = KAABA_LAT * (PI / 180);
  const kaabaLng = KAABA_LNG * (PI / 180);
  const phi = lat * (PI / 180);
  const lambda = lng * (PI / 180);

  const y = Math.sin(kaabaLng - lambda);
  const x = Math.cos(phi) * Math.tan(kaabaLat) - Math.sin(phi) * Math.cos(kaabaLng - lambda);

  let bearing = Math.atan2(y, x) * (180 / PI);
  return (bearing + 360) % 360;
};

const getDirectionString = (heading: number) => {
  const directions = [
    'উত্তর দিক ⬆️', 
    'উত্তর-পূর্ব', 
    'পূর্ব দিক ➡️', 
    'দক্ষিণ-পূর্ব', 
    'দক্ষিণ দিক ⬇️', 
    'দক্ষিণ-পশ্চিম', 
    'পশ্চিম দিক ⬅️', 
    'উত্তর-পশ্চিম'
  ];
  const index = Math.round(((heading %= 360) < 0 ? heading + 360 : heading) / 45) % 8;
  return directions[index];
};

export default function QiblaCompass() {
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Smooth rotation logic
  const animatedHeading = useRef(new Animated.Value(0)).current;
  const animatedQibla = useRef(new Animated.Value(0)).current;
  const _lastHeading = useRef(0);
  const _lastQibla = useRef(0);

  useEffect(() => {
    let sub: any;

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied. Please enable location services.');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const bearing = getQiblaBearing(location.coords.latitude, location.coords.longitude);
        setQiblaBearing(bearing);
        
        const { status: sensorStatus } = await Magnetometer.requestPermissionsAsync();
        if (sensorStatus !== 'granted') {
          setErrorMsg('Magnetometer permission denied. Cannot access compass.');
          setLoading(false);
          return;
        }

        Magnetometer.setUpdateInterval(100);
        sub = Magnetometer.addListener((data) => {
          // Compass heading calculation
          let angle = Math.atan2(data.x, data.y) * (180 / Math.PI);
          let currentHeading = -angle; // Fix correct clockwise orientation
          if (currentHeading < 0) currentHeading += 360;
          
          setHeading(currentHeading);

          // 1. Smooth dial rotation interpolation
          let diffHeading = currentHeading - (_lastHeading.current % 360);
          if (diffHeading > 180) diffHeading -= 360;
          else if (diffHeading < -180) diffHeading += 360;
          
          _lastHeading.current += diffHeading;

          // 2. Relative Qibla angle calculation (Formula provided)
          let relativeQiblaAngle = bearing - currentHeading;
          if (relativeQiblaAngle > 180) relativeQiblaAngle -= 360;
          else if (relativeQiblaAngle < -180) relativeQiblaAngle += 360;

          // Smooth Qibla arrow interpolation
          let diffQibla = relativeQiblaAngle - (_lastQibla.current % 360);
          if (diffQibla > 180) diffQibla -= 360;
          else if (diffQibla < -180) diffQibla += 360;
          
          _lastQibla.current += diffQibla;

          Animated.parallel([
            Animated.timing(animatedHeading, {
              toValue: _lastHeading.current,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(animatedQibla, {
              toValue: _lastQibla.current,
              duration: 150,
              useNativeDriver: true,
            })
          ]).start();
        });

        setLoading(false);
      } catch (err: any) {
        setErrorMsg('Error: ' + err.message);
        setLoading(false);
      }
    })();

    return () => {
      if (sub) {
        sub.remove();
      }
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Calibrating Compass...</Text>
        </View>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      </View>
    );
  }

  const renderDegreeMarks = () => {
    const marks = [];
    for (let i = 0; i < 72; i++) {
      const isMajor = i % 9 === 0;
      marks.push(
        <View
          key={i}
          style={[
            styles.degreeMarkContainer,
            { transform: [{ rotate: `${i * 5}deg` }] },
          ]}
        >
          <View style={[styles.degreeMark, isMajor && styles.majorDegreeMark]} />
        </View>
      );
    }
    return marks;
  };

  const isFacingQibla = Math.abs(heading - qiblaBearing) < 3 || Math.abs(heading - qiblaBearing) > 357;

  const rotateDialInterpolation = animatedHeading.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ['360deg', '0deg', '-360deg'] // Reverses angle for compass dial logic
  });

  const rotateQiblaInterpolation = animatedQibla.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ['-360deg', '0deg', '360deg'] // Rotates dynamically relative to phone
  });

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Qibla</Text>
        <Text style={styles.subtitle}>{getDirectionString(heading)}</Text>
      </View>

      {/* Compass Area */}
      <View style={styles.compassWrapper}>
        <View style={[styles.compassOuter, isFacingQibla && styles.compassOuterActive]}>
          
          {/* Rotating Compass Dial */}
          <Animated.View style={[styles.compassInner, { transform: [{ rotate: rotateDialInterpolation }] }]}>
            {/* Degree Marks */}
            {renderDegreeMarks()}

            {/* Directions */}
            <Text style={[styles.directionText, styles.north]}>N</Text>
            <Text style={[styles.directionText, styles.east]}>E</Text>
            <Text style={[styles.directionText, styles.south]}>S</Text>
            <Text style={[styles.directionText, styles.west]}>W</Text>
          </Animated.View>

          {/* Qibla Indicator (Independent of dial, rotates based on relative heading) */}
          <Animated.View 
            style={[
              styles.qiblaIndicatorContainer, 
              { transform: [{ rotate: rotateQiblaInterpolation }] }
            ]}
          >
            <View style={styles.qiblaArrowWrapper}>
              <Text style={styles.kaabaText}>🕋</Text>
              <View style={styles.qiblaArrow} />
              <View style={styles.qiblaLine} />
            </View>
          </Animated.View>

          {/* Center Pivot */}
          <View style={styles.centerDotOuter}>
            <View style={styles.centerDotInner} />
          </View>

        </View>
      </View>

      {/* Information Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Heading</Text>
            <Text style={styles.infoValue}>{Math.round(heading)}°</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Qibla</Text>
            <Text style={styles.infoValue}>{Math.round(qiblaBearing)}°</Text>
          </View>
        </View>
        <Text style={[styles.instructionText, isFacingQibla && styles.instructionTextActive]}>
          {isFacingQibla 
            ? "You are facing the Qibla ✨" 
            : "Rotate your phone until the arrow points to Qibla"}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#003332',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003332',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  loadingText: {
    color: '#D4AF37',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    maxWidth: '90%',
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  errorText: {
    color: '#FECACA',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#34D399',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  compassWrapper: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  compassOuter: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  compassOuterActive: {
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  compassInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  degreeMarkContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  degreeMark: {
    width: 2,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 4,
    borderRadius: 1,
  },
  majorDegreeMark: {
    width: 3,
    height: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.5)',
  },
  directionText: {
    position: 'absolute',
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  north: { top: 25, color: '#34D399' },
  south: { bottom: 25 },
  east: { right: 25, top: '46%' },
  west: { left: 25, top: '46%' },
  qiblaIndicatorContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  qiblaArrowWrapper: {
    alignItems: 'center',
    marginTop: 15,
  },
  kaabaText: {
    fontSize: 22,
    marginBottom: -4,
    zIndex: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  qiblaArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#D4AF37',
  },
  qiblaLine: {
    width: 2,
    height: COMPASS_SIZE * 0.35,
    backgroundColor: 'rgba(212, 175, 55, 0.6)',
  },
  centerDotOuter: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  centerDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4AF37',
  },
  infoCard: {
    marginTop: 50,
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  instructionText: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  instructionTextActive: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
});
