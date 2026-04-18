import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { FONT, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface OrbitLogoProps {
  size?: number;
  animated?: boolean;
  showWordmark?: boolean;
}

export function OrbitLogo({
  size = 86,
  animated = false,
  showWordmark = true,
}: OrbitLogoProps) {
  const { colors } = useAppTheme();
  const drift = useSharedValue(0);
  const glow = useSharedValue(1);

  useEffect(() => {
    const stopAnimations = () => {
      cancelAnimation(drift);
      cancelAnimation(glow);
    };

    stopAnimations();

    if (!animated) {
      drift.value = 0;
      glow.value = 1;
      return stopAnimations;
    }

    drift.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1800 }),
        withTiming(0.98, { duration: 1800 }),
      ),
      -1,
        true,
      );

    return stopAnimations;
  }, [animated, drift, glow]);

  const arcStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * 3 }, { scale: glow.value }],
  }));

  const markColor = colors.text;
  const subtitleColor = colors.textMuted;
  const wordmarkSize = size * 0.24;

  return (
    <View style={styles.wrapper}>
      <View style={{ width: size * 1.7, height: size * 0.92 }}>
        <Animated.View
          style={[
            styles.arcOuter,
            arcStyle,
            {
              borderColor: markColor,
              width: size * 0.48,
              height: size * 0.23,
              borderRadius: size,
              top: size * 0.02,
              left: size * 0.64,
              shadowColor: markColor,
              shadowOpacity: 0.16,
            },
          ]}
        />
        <View
          style={[
            styles.arcMask,
            {
              backgroundColor: 'transparent',
              width: size * 0.36,
              height: size * 0.18,
              borderRadius: size,
              top: size * 0.07,
              left: size * 0.76,
            },
          ]}
        />
        <Text
          style={[
            styles.wordmark,
            {
              color: markColor,
              fontSize: wordmarkSize,
              letterSpacing: wordmarkSize * 0.48,
            },
          ]}
        >
          ORBIT
        </Text>
      </View>

      {showWordmark ? (
        <View style={styles.meta}>
          <Text style={[styles.subline, { color: subtitleColor }]}>orbitx premium exchange</Text>
          <View style={[styles.bar, { backgroundColor: withOpacity(markColor, 0.16) }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  arcOuter: {
    position: 'absolute',
    borderWidth: 2,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-18deg' }],
  },
  arcMask: {
    position: 'absolute',
  },
  wordmark: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: FONT.medium,
  },
  meta: {
    alignItems: 'center',
    gap: 6,
  },
  subline: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
  },
  bar: {
    width: 42,
    height: 2,
    borderRadius: 999,
  },
});
