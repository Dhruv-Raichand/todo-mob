import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(50)).current;
  const decorCircle1Anim = useRef(new Animated.Value(0)).current;
  const decorCircle2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ✅ Professional Animation Sequence
    Animated.sequence([
      // Step 1: Logo appears with smooth scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Step 2: Text slides up smoothly
      Animated.timing(textSlideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // ✅ Continuous floating animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // ✅ Decorative circles animation
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(decorCircle1Anim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(decorCircle1Anim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(decorCircle2Anim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(decorCircle2Anim, {
            toValue: 0,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Navigate after animation
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Decorative circle movements
  const decorCircle1Transform = decorCircle1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const decorCircle2Transform = decorCircle2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  return (
    <LinearGradient
      colors={[COLORS.primary, '#8B9DC3', '#E8ECF4']} // ✅ Blue to White Gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* ✅ Animated Logo (No Rotation, Just Float) */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: floatAnim }, // ✅ Smooth floating up/down
            ],
          },
        ]}
      >
        {/* Icon Circle with Blue Theme */}
        <View style={styles.iconCircle}>
          <Image
            source={require('../../assets/task2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* ✅ App Name & Tagline (Slide Up Animation) */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: textSlideAnim }],
        }}
      >
        <Text style={styles.appName}>TaskMaster</Text>
        <Text style={styles.tagline}>Faculty Task Management</Text>
      </Animated.View>

      {/* ✅ Decorative Floating Circles (Smooth Movement) */}
      <Animated.View
        style={[
          styles.decorativeCircle1,
          {
            opacity: fadeAnim,
            transform: [{ translateY: decorCircle1Transform }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeCircle2,
          {
            opacity: fadeAnim,
            transform: [{ translateY: decorCircle2Transform }],
          },
        ]}
      />

      {/* ✅ Footer */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>Powered by Arvind Singh</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff', // ✅ White background for icon
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary, // ✅ Primary blue color
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.primary, // ✅ Primary blue color
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.8,
  },
  // ✅ Decorative floating circles for professional look
  decorativeCircle1: {
    position: 'absolute',
    top: 100,
    right: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 150,
    left: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    color: COLORS.primary, // ✅ Primary blue color
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.7,
  },
});

export default SplashScreen;
