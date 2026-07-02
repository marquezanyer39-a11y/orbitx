import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT } from '../../constants/theme';
import { useI18n } from '../../hooks/useI18n';
import {
  AUTH_COLORS,
  BrandLogoHeader,
  CinematicBackground,
  SocialButtonsRow,
  SocialSeparator,
} from './AuthShared';

export function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

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
          {/* Branding & info block */}
          <View style={styles.topBlock}>
            <Animated.View style={[styles.logoWrap, mkEntrance(logoAnim)]}>
              <BrandLogoHeader />
              <Text style={styles.featureBar}>{t('authFlow.featureBar')}</Text>
            </Animated.View>

            <Animated.View style={[styles.headlineSection, mkEntrance(headAnim)]}>
              <Text style={styles.headline}>{t('authFlow.headline')}</Text>
              <Text style={styles.subtitle}>{t('authFlow.subtitle')}</Text>
            </Animated.View>
          </View>

          {/* Action section: buttons + social + legal */}
          <Animated.View style={[styles.ctaSection, mkEntrance(ctaAnim)]}>
            <View style={styles.buttonsGroup}>
              <Pressable
                onPress={() => router.push('/register')}
                style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
                accessibilityRole="button"
              >
                <Text style={styles.btnPrimaryText}>{t('authFlow.createAccount')}</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/login')}
                style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnSecondaryPressed]}
                accessibilityRole="button"
              >
                <Text style={styles.btnSecondaryText}>{t('common.login')}</Text>
              </Pressable>
            </View>

            <View style={styles.socialGroup}>
              <SocialSeparator />
              <SocialButtonsRow variant="circle" />
            </View>

            <Text style={styles.legalText}>
              {t('authFlow.legalPrefix')}
              <Text style={styles.legalLink}>{t('authFlow.termsLink')}</Text>
              {t('authFlow.legalMid')}
              <Text style={styles.legalLink}>{t('authFlow.privacyTitle')}</Text>.
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
    paddingHorizontal: 32,
    paddingTop: 48,
    justifyContent: 'space-between',
  },
  topBlock: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 48,
  },
  featureBar: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  headlineSection: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  },
  headline: {
    fontFamily: FONT.bold,
    fontSize: 32,
    color: textPrimary,
    letterSpacing: -0.64,
    lineHeight: 37,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: textMuted,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 16,
    opacity: 0.9,
  },
  ctaSection: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    gap: 40,
  },
  buttonsGroup: {
    gap: 16,
  },
  socialGroup: {
    alignSelf: 'stretch',
    gap: 24,
  },
  btnPrimary: {
    height: 58,
    borderRadius: 14,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
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
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  legalLink: {
    fontFamily: FONT.bold,
    color: primary,
  },
});
