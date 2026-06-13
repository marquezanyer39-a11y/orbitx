import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { CARD_RADIUS, ORBITX_THEME } from './orbitxTheme';

interface PromoBannerProps {
  isSmallPhone?: boolean;
  onPress: () => void;
}

const PROMO_VISUALS = [
  {
    key: 'invite',
    icon: 'gift-outline' as const,
    colors: ['#0D0F13', '#12121A', '#101416'] as const,
  },
  {
    key: 'boost',
    icon: 'sparkles-outline' as const,
    colors: ['#0D0F13', '#101521', '#13121A'] as const,
  },
  {
    key: 'reward',
    icon: 'diamond-outline' as const,
    colors: ['#0D0F13', '#111715', '#14121A'] as const,
  },
] as const;

export function PromoBanner({ isSmallPhone = false, onPress }: PromoBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pulse = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(1)).current;
  const activeVisual = PROMO_VISUALS[activeIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((value) => (value + 1) % PROMO_VISUALS.length);
    }, 3600);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    slideIn.setValue(0.96);
    Animated.spring(slideIn, {
      toValue: 1,
      damping: 13,
      mass: 0.7,
      stiffness: 135,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, slideIn]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.08],
  });
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.42, 0.72],
  });

  return (
    <LinearGradient
      colors={activeVisual.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, isSmallPhone ? styles.cardSmall : null]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.motionTrailGlow,
          {
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      />
      <View pointerEvents="none" style={styles.motionRail}>
        <View style={[styles.motionSlash, styles.motionSlashA]} />
        <View style={[styles.motionSlash, styles.motionSlashB]} />
        <View style={[styles.motionDot, styles.motionDotA]} />
        <View style={[styles.motionDot, styles.motionDotB]} />
        <View style={[styles.motionDot, styles.motionDotC]} />
      </View>

      <View style={styles.copyColumn}>
        <Animated.View
          style={{
            opacity: slideIn,
            transform: [{ scale: slideIn }],
          }}
        >
          <Text
            style={[styles.title, isSmallPhone ? styles.titleSmall : null]}
            numberOfLines={isSmallPhone ? 2 : 1}
            ellipsizeMode="tail"
          >
            Invita y gana hasta 100 USDT
          </Text>
          <Text
            style={[styles.subtitle, isSmallPhone ? styles.subtitleSmall : null]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Comparte QVEX y recibe recompensas
          </Text>
        </Animated.View>
      </View>

      <View style={styles.rightColumn}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.ctaButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.ctaLabel} numberOfLines={1}>
            Ver más
          </Text>
        </Pressable>

        <View style={styles.dotsRow}>
          {PROMO_VISUALS.map((item, index) => (
            <Pressable
              key={item.key}
              onPress={() => setActiveIndex(index)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.dot,
                index === activeIndex ? styles.dotActive : null,
                pressed ? styles.pressed : null,
              ]}
            />
          ))}
        </View>
      </View>

      <Animated.View
        style={[
          styles.giftBadge,
          {
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      >
        <Ionicons name={activeVisual.icon} size={16} color={withOpacity('#FFFFFF', 0.86)} />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 72,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.08),
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  motionTrailGlow: {
    position: 'absolute',
    right: -24,
    top: 22,
    width: 142,
    height: 2,
    borderRadius: 2,
    backgroundColor: withOpacity('#8D78E8', 0.11),
    transform: [{ rotate: '-18deg' }],
  },
  motionRail: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 7,
    height: 1,
    backgroundColor: withOpacity('#FFFFFF', 0.035),
  },
  motionDot: {
    position: 'absolute',
    bottom: -1,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: withOpacity('#FFFFFF', 0.14),
  },
  motionSlash: {
    position: 'absolute',
    top: -16,
    width: 74,
    height: 1,
    borderRadius: 1,
    backgroundColor: withOpacity('#FAFAFA', 0.055),
    transform: [{ rotate: '-18deg' }],
  },
  motionSlashA: {
    right: 22,
  },
  motionSlashB: {
    right: 82,
    top: -6,
    width: 54,
    backgroundColor: withOpacity('#8D78E8', 0.08),
  },
  motionDotA: {
    left: '18%',
  },
  motionDotB: {
    left: '54%',
    backgroundColor: withOpacity('#8D78E8', 0.24),
  },
  motionDotC: {
    right: '16%',
  },
  cardSmall: {
    minHeight: 70,
    paddingHorizontal: 11,
  },
  copyColumn: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  title: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 13.5,
    lineHeight: 17,
  },
  titleSmall: {
    fontSize: 12.8,
  },
  subtitle: {
    marginTop: 3,
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 10.6,
  },
  subtitleSmall: {
    fontSize: 10.2,
  },
  rightColumn: {
    minWidth: 78,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 7,
  },
  ctaButton: {
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: withOpacity('#8D78E8', 0.14),
    borderWidth: 1,
    borderColor: withOpacity('#8D78E8', 0.18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 10.8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: RADII.pill,
    backgroundColor: withOpacity('#FFFFFF', 0.24),
  },
  dotActive: {
    width: 16,
    backgroundColor: '#8D78E8',
  },
  giftBadge: {
    position: 'absolute',
    right: 78,
    width: 34,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#8D78E8', 0.11),
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.04),
  },
  pressed: {
    opacity: 0.78,
  },
});
