import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { authService } from '../services/auth';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const bgAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const motoOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createAnimationCycle = (cycleNumber: number) => {
      return Animated.sequence([
        // État initial selon le cycle
        ...(cycleNumber % 2 === 0 ? [
          // bg blanc, yobbou #0044C1, moto bleue
          Animated.timing(bgAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
          Animated.timing(textAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
          Animated.timing(motoOpacity, { toValue: 1, duration: 0, useNativeDriver: false }),
        ] : [
          // bg #0044C1, yobbou blanc, moto blanche
          Animated.timing(bgAnim, { toValue: 1, duration: 0, useNativeDriver: false }),
          Animated.timing(textAnim, { toValue: 1, duration: 0, useNativeDriver: false }),
          Animated.timing(motoOpacity, { toValue: 0, duration: 0, useNativeDriver: false }),
        ]),
        
        // Pause
        Animated.delay(1500),
        
        // Transition
        Animated.parallel([
          Animated.timing(bgAnim, { toValue: cycleNumber % 2 === 0 ? 1 : 0, duration: 1000, useNativeDriver: false }),
          Animated.timing(textAnim, { toValue: cycleNumber % 2 === 0 ? 1 : 0, duration: 1000, useNativeDriver: false }),
          Animated.timing(motoOpacity, { toValue: cycleNumber % 2 === 0 ? 0 : 1, duration: 1000, useNativeDriver: false }),
        ]),
        
        // Pause
        Animated.delay(1500),
      ]);
    };

    // Créer 4 cycles d'animation
    const fullAnimation = Animated.sequence([
      createAnimationCycle(0),
      createAnimationCycle(1),
      createAnimationCycle(2),
      createAnimationCycle(3),
    ]);

    fullAnimation.start(() => {
      // Navigation vers la page d'accueil après 4 cycles
      setTimeout(async () => {
        const isAuthenticated = await authService.isAuthenticated();
        if (isAuthenticated) {
          router.replace('/');
        } else {
          router.replace('/login');
        }
      }, 500);
    });

    return () => fullAnimation.stop();
  }, []);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#0044C1'],
  });

  const textColor = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#0044C1', '#FFFFFF'],
  });

  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <Animated.Text style={[styles.logo, { color: textColor }]}>
            yobbou
          </Animated.Text>
          
          <Animated.View 
            style={[
              styles.underline,
              {
                backgroundColor: textColor,
                transform: [{ scaleX: scaleAnim }],
              }
            ]}
          />
        </Animated.View>
        
        <Animated.Text style={[styles.subtitle, { color: textColor }]}>
          Découvrez l'innovation
        </Animated.Text>
      </View>
      
      <Animated.View style={[styles.motoContainer]}>
        <Animated.Image
          source={require('@/assets/images/motobleu.png')}
          style={[styles.motoImage, { opacity: motoOpacity }]}
        />
        <Animated.Image
          source={require('@/assets/images/motoblan.png')}
          style={[styles.motoImage, { opacity: Animated.subtract(1, motoOpacity) }]}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: width * 0.18,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'lowercase',
    marginBottom: 15,
  },
  underline: {
    height: 2,
    width: width * 0.3,
    borderRadius: 1,
    transformOrigin: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '200',
    letterSpacing: 2,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  motoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  motoImage: {
    width: width * 0.25,
    height: width * 0.15,
    resizeMode: 'contain',
    position: 'absolute',
  },
});
