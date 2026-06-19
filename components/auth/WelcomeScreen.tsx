import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT } from '../../constants/theme';
import {
  AUTH_COLORS,
  BrandLogoHeader,
  CinematicBackground,
  SocialButtonsRow,
  SocialSeparator,
} from './AuthShared';

export function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  // Entrance slide-up-fade for 3 sections
  const logoAnim = useRef(new Animated.Value(0)).current;
  const headAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.stagger(180, [
      Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, tension: 56, friction: 9 }),
      Animated.spring(headAnim, { toValue: 1, useNativeDriver: true, tension: 56, friction: 9 }),
      Animated.spring(ctaAnim, { toValue: 1, useNativeDriver: true, tension: 56, friction: 9 }),
    ]).start();
  }, [logoAnim, headAnim, ctaAnim]);

  const mkEntrance = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
  });

  return (
    <View style={styles.root}>
      <CinematicBackground variant="hero" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.View style={[styles.logoWrap, mkEntrance(logoAnim)]}>
            <BrandLogoHeader />
            <Text style={styles.featureBar}>SIMULADOR IA  |  ALERTAS  |  COMUNIDAD</Text>
          </Animated.View>

          {/* Headline */}
          <Animated.View style={[styles.headlineSection, mkEntrance(headAnim)]}>
            <Text style={styles.headline}>
              Cripto, IA y comunidad en un solo ecosistema
            </Text>
            <Text style={styles.subtitle}>
              Simula escenarios, recibe alertas inteligentes, explora tokens y conecta con la comunidad desde QVEX.
            </Text>
          </Animated.View>

          {/* CTA + social + legal */}
          <Animated.View style={[styles.ctaSection, mkEntrance(ctaAnim)]}>
            <Pressable
              onPress={() => router.push('/register')}
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
              accessibilityRole="button"
            >
              <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/login')}
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnSecondaryPressed]}
              accessibilityRole="button"
            >
              <Text style={styles.btnSecondaryText}>Iniciar sesión</Text>
            </Pressable>

            <SocialSeparator />
            <SocialButtonsRow variant="circle" />

            <Text style={styles.legalText}>
              Al continuar aceptas los{' '}
              <Text style={styles.legalLink}>Términos</Text>
              {' '}y la{' '}
              <Text style={styles.legalLink}>Política de Privacidad</Text>.
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const { bg, primary, border, textPrimary, textMuted } = AUTH_COLORS;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bg,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 28,
    justifyContent: 'space-between',
  },
  logoWrap: {
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  featureBar: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: textMuted,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    opacity: 0.68,
  },
  headlineSection: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  headline: {
    fontFamily: FONT.bold,
    fontSize: 26,
    color: textPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: textMuted,
    lineHeight: 23,
    textAlign: 'center',
  },
  ctaSection: {
    gap: 12,
  },
  btnPrimary: {
    height: 58,
    borderRadius: 14,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  btnPrimaryPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.976 }],
  },
  btnPrimaryText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: bg,
  },
  btnSecondary: {
    height: 58,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.976 }],
  },
  btnSecondaryText: {
    fontFamily: FONT.semibold,
    fontSize: 16,
    color: textPrimary,
  },
  legalText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: textMuted,
    textAlign: 'center',
    lineHeight: 19,
    letterSpacing: 0.2,
    marginTop: 4,
  },
  legalLink: {
    fontFamily: FONT.semibold,
    color: primary,
  },
});
