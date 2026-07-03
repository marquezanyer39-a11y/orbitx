/**
 * Shared cinematic components for the auth flow (Welcome + Login).
 * Single source of truth — never duplicate these into individual screens.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { FONT, withOpacity } from '../../constants/theme';
import { useI18n } from '../../hooks/useI18n';
import { useUiStore } from '../../src/store/uiStore';

// ─── Design tokens (Kinetic Obsidian) ────────────────────────────────────────
export const AUTH_COLORS = {
  bg: '#080B10',
  panel: '#0D1220',
  border: '#22314A',
  primary: '#00E5FF',
  textPrimary: '#F8FBFF',
  textMuted: '#8A94A6',
} as const;

// ─── Star field — deterministic via golden-angle distribution ─────────────────
const STAR_DATA = Array.from({ length: 32 }, (_, i) => ({
  left: (i * 137.508) % 100,
  top: (i * 97.3) % 100,
  size: 0.5 + (i % 3) * 1.0,
  group: i % 5,
  baseOpacity: 0.1 + (i % 4) * 0.1,
}));

// ─── CinematicBackground ─────────────────────────────────────────────────────
// variant='hero'  → heavier gradient, planet is atmosphere, Welcome screen
// variant='form'  → lighter gradient, planet shows more, Login screen
interface CinematicBackgroundProps {
  variant?: 'hero' | 'form';
}

export function CinematicBackground({ variant = 'hero' }: CinematicBackgroundProps) {
  const planetScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(planetScale, { toValue: 1.06, duration: 50_000, useNativeDriver: true }),
        Animated.timing(planetScale, { toValue: 1.0, duration: 50_000, useNativeDriver: true }),
      ]),
    ).start();
  }, [planetScale]);

  const twinkle = useRef(Array.from({ length: 5 }, () => new Animated.Value(0))).current;
  useEffect(() => {
    twinkle.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 680),
          Animated.timing(anim, { toValue: 1, duration: 3_600 + i * 850, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 3_600 + i * 850, useNativeDriver: true }),
        ]),
      ).start();
    });
  }, [twinkle]);

  // hero: heavier gradient so planet recedes, form: lighter so planet peeks through
  const gradientColors: [string, string, string, string] =
    variant === 'hero'
      ? ['rgba(8,11,16,0.1)', 'rgba(8,11,16,0.8)', AUTH_COLORS.bg, AUTH_COLORS.bg]
      : ['rgba(8,11,16,0.0)', 'rgba(8,11,16,0.38)', 'rgba(8,11,16,0.88)', AUTH_COLORS.bg];
  const gradientLocations: [number, number, number, number] =
    variant === 'hero' ? [0, 0.5, 0.9, 1] : [0, 0.28, 0.62, 1];

  return (
    <>
      {/* Planet zoom — NO rotation */}
      <Animated.View
        style={[styles.bgLayer, { transform: [{ scale: planetScale }] }]}
        pointerEvents="none"
      >
        <Image
          source={require('../../assets/images/qvex-planet-bg.png')}
          style={styles.planetImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Gradient fade */}
      <LinearGradient
        colors={gradientColors}
        locations={gradientLocations}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Stars */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {STAR_DATA.map((star, idx) => {
          const opacity = twinkle[star.group].interpolate({
            inputRange: [0, 1],
            outputRange: [star.baseOpacity, star.baseOpacity + 0.36],
          });
          return (
            <Animated.View
              key={idx}
              style={{
                position: 'absolute',
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.size,
                height: star.size,
                borderRadius: star.size,
                backgroundColor: '#FFFFFF',
                opacity,
              }}
            />
          );
        })}
      </View>

      {/* Ambient glow orbs removed as they render as ugly circles without blur */}
    </>
  );
}

// ─── Q-mark SVG icon (inside the 56×56 container) ────────────────────────────
export function QvexIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 100 100" fill="none">
      <Circle cx="50" cy="50" r="30" stroke={AUTH_COLORS.primary} strokeWidth="8" strokeLinecap="round" />
      <Line x1="72" y1="72" x2="88" y2="88" stroke={AUTH_COLORS.primary} strokeWidth="8" strokeLinecap="round" />
    </Svg>
  );
}

// ─── BrandLogoHeader ──────────────────────────────────────────────────────────
interface BrandLogoHeaderProps {
  /** compact=true → smaller wordmark for form pages; default false (Welcome hero size) */
  compact?: boolean;
}

export function BrandLogoHeader({ compact = false }: BrandLogoHeaderProps) {
  const { t } = useI18n();
  return (
    <View style={styles.logoSection}>
      <View style={styles.brandRow}>
        <View style={styles.iconContainer}>
          <QvexIcon />
        </View>
        <Text
          style={[styles.wordmark, compact && styles.wordmarkCompact]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          QVEX
        </Text>
      </View>
      <Text style={styles.eyebrow}>{t('authFlow.eyebrow')}</Text>
    </View>
  );
}

// ─── Social brand icons ───────────────────────────────────────────────────────
export function IconGoogle() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill={AUTH_COLORS.textPrimary} />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={AUTH_COLORS.textPrimary} />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill={AUTH_COLORS.textPrimary} />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={AUTH_COLORS.textPrimary} />
    </Svg>
  );
}

export function IconX() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill={AUTH_COLORS.textPrimary}>
      <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </Svg>
  );
}

export function IconApple() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={AUTH_COLORS.textPrimary}>
      <Path d="M17.05 20.28c-.96.95-2.18 1.78-3.41 1.77-1.1-.01-1.78-.65-3.08-.65-1.3 0-2.13.65-3.04.66-1.39.01-2.64-1.01-3.6-2.45-1.95-2.92-1.55-7.39.88-9.68 1.11-1.04 2.39-1.57 3.48-1.56.96.01 1.83.56 2.44.56.61 0 1.62-.64 2.84-.53 1.25.1 2.2.62 2.82 1.39-2.28 1.34-1.91 4.54.43 5.48-.68 1.75-1.6 3.42-2.76 5.01zM11.97 4.16c.41-2.18 2.37-3.9 4.31-3.83.25 2.32-1.87 4.52-4.31 4.37-.17-.18-.28-.35-.35-.54z" />
    </Svg>
  );
}

// ─── SocialButtonsRow ─────────────────────────────────────────────────────────
// variant='circle' → 60×60 pill buttons (Welcome)
// variant='rect'   → 56px-tall rectangular buttons in 3-col grid (Login)
interface SocialButtonsRowProps {
  variant?: 'circle' | 'rect';
}

export function SocialButtonsRow({ variant = 'circle' }: SocialButtonsRowProps) {
  const showToast = useUiStore((state) => state.showToast);
  const { t } = useI18n();
  const onSocialPress = () => showToast(t('authFlow.socialSoon'), 'info');

  const isCircle = variant === 'circle';
  const btnStyle = isCircle ? styles.socialCircle : styles.socialRect;
  const rowStyle = isCircle ? styles.socialCircleRow : styles.socialRectRow;

  const icons = [
    { key: 'google', Icon: IconGoogle, label: 'Google' },
    { key: 'x', Icon: IconX, label: 'X' },
    { key: 'apple', Icon: IconApple, label: 'Apple' },
  ];

  return (
    <View style={rowStyle}>
      {icons.map(({ key, Icon, label }) => (
        <Pressable
          key={key}
          onPress={onSocialPress}
          style={({ pressed }) => [btnStyle, pressed && styles.socialPressed]}
          accessibilityLabel={`Continuar con ${label}`}
        >
          <Icon />
        </Pressable>
      ))}
    </View>
  );
}

// ─── Shared separator ─────────────────────────────────────────────────────────
export function SocialSeparator() {
  const { t } = useI18n();
  return (
    <View style={styles.separatorRow}>
      <View style={styles.separatorLine} />
      <Text style={styles.separatorText}>{t('authFlow.continueWith')}</Text>
      <View style={styles.separatorLine} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  planetImage: {
    width: '100%',
    height: '52%',
    opacity: 0.4,
  },
  // BrandLogoHeader
  logoSection: {
    alignItems: 'center',
    gap: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: AUTH_COLORS.panel,
    borderWidth: 1,
    borderColor: AUTH_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: FONT.bold,
    fontSize: 44,
    color: AUTH_COLORS.textPrimary,
    letterSpacing: -1.1,
  },
  wordmarkCompact: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  eyebrow: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: AUTH_COLORS.primary,
    letterSpacing: 4.4,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  // SocialButtonsRow
  socialCircleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  socialRectRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(13,18,32,0.4)',
    borderWidth: 1,
    borderColor: withOpacity(AUTH_COLORS.border, 0.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialRect: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(13,18,32,0.52)',
    borderWidth: 1,
    borderColor: withOpacity(AUTH_COLORS.border, 0.55),
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialPressed: {
    opacity: 0.74,
    transform: [{ scale: 0.94 }],
  },
  // SocialSeparator
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: withOpacity(AUTH_COLORS.border, 0.45),
  },
  separatorText: {
    fontFamily: FONT.medium,
    fontSize: 9,
    color: withOpacity(AUTH_COLORS.textMuted, 0.6),
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
});
