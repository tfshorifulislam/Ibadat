import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.8;

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

export default function QiblaCompass() {
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let sub: any;

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const bearing = getQiblaBearing(location.coords.latitude, location.coords.longitude);
        setQiblaBearing(bearing);
        
        const { status: sensorStatus } = await Magnetometer.requestPermissionsAsync();
        if (sensorStatus !== 'granted') {
          setErrorMsg('Magnetometer permission denied');
          setLoading(false);
          return;
        }

        Magnetometer.setUpdateInterval(50);
        sub = Magnetometer.addListener((data) => {
          let angle = Math.atan2(data.x, data.y) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          setHeading(angle);
        });

        setLoading(false);
      } catch (err: any) {
        setErrorMsg('Error initializing compass: ' + err.message);
        setLoading(false);
      }
    })();

    return () => {
      if (sub) sub.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#34D399" />
        <Text style={styles.loadingText}>Initializing Compass...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qibla Compass</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Current Heading: {Math.round(heading)}°</Text>
        <Text style={styles.infoText}>Qibla Direction: {Math.round(qiblaBearing)}°</Text>
      </View>

      <View style={styles.compassWrapper}>
        <View style={styles.compassOuter}>
          <View style={[styles.compassInner, { transform: [{ rotate: `-${heading}deg` }] }]}>
            
            <View style={styles.compassDial}>
              <Text style={[styles.directionText, styles.north]}>N</Text>
              <Text style={[styles.directionText, styles.east]}>E</Text>
              <Text style={[styles.directionText, styles.south]}>S</Text>
              <Text style={[styles.directionText, styles.west]}>W</Text>

              <View 
                style={[
                  styles.qiblaIndicatorContainer, 
                  { transform: [{ rotate: `${qiblaBearing}deg` }] }
                ]}
              >
                <View style={styles.qiblaArrow} />
                <View style={styles.qiblaLine} />
              </View>

              <View style={styles.centerDot} />
            </View>

          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
    backgroundColor: '#003332',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003332',
  },
  loadingText: {
    color: '#34D399',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    color: '#34D399',
    fontSize: 16,
    marginBottom: 4,
  },
  compassWrapper: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassOuter: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2,
    borderColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  compassInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassDial: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  directionText: {
    position: 'absolute',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  north: { top: 15, alignSelf: 'center', color: '#34D399' },
  south: { bottom: 15, alignSelf: 'center' },
  east: { right: 15, top: '46%' },
  west: { left: 15, top: '46%' },
  centerDot: {
    position: 'absolute',
    top: '48%',
    left: '48%',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34D399',
  },
  qiblaIndicatorContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  qiblaArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#D4AF37',
    marginTop: 15,
  },
  qiblaLine: {
    width: 2,
    height: '40%',
    backgroundColor: '#D4AF37',
  },
});
