import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface AuthScreenShellProps {
  children: ReactNode;
  topSlot?: ReactNode;
}

const STARS = [
  { top: 42, left: 34, size: 4, alpha: 0.28 },
  { top: 78, right: 48, size: 3, alpha: 0.2 },
  { top: 112, left: 102, size: 2, alpha: 0.18 },
  { top: 156, right: 84, size: 4, alpha: 0.22 },
  { top: 204, left: 46, size: 3, alpha: 0.16 },
  { top: 248, right: 22, size: 2, alpha: 0.16 },
  { top: 318, left: 78, size: 4, alpha: 0.2 },
  { top: 356, right: 110, size: 3, alpha: 0.16 },
  { top: 422, left: 30, size: 2, alpha: 0.16 },
  { top: 486, right: 54, size: 4, alpha: 0.18 },
  { top: 560, left: 120, size: 3, alpha: 0.14 },
  { top: 626, right: 96, size: 2, alpha: 0.14 },
] as const;

export function AuthScreenShell({ children, topSlot }: AuthScreenShellProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundAlt }]}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <LinearGradient
          colors={[
            withOpacity(colors.primary, 0.22),
            withOpacity(colors.primary, 0.08),
            'transparent',
          ]}
          start={{ x: 0.18, y: 0 }}
          end={{ x: 0.82, y: 1 }}
          style={styles.heroGlow}
        />
        <LinearGradient
          colors={[
            withOpacity(colors.primary, 0.18),
            withOpacity(colors.profit, 0.05),
            'transparent',
          ]}
          start={{ x: 0.25, y: 0 }}
          end={{ x: 0.78, y: 1 }}
          style={styles.topMist}
        />
        <View style={[styles.ringLarge, { borderColor: withOpacity(colors.primary, 0.22) }]} />
        <View style={[styles.ringSmall, { borderColor: withOpacity(colors.text, 0.08) }]} />
        <View style={[styles.lowerAura, { backgroundColor: withOpacity(colors.primary, 0.14) }]} />
        <LinearGradient
          colors={[withOpacity(colors.primary, 0.38), 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.bottomArc}
        />
        {STARS.map((star, index) => (
          <View
            key={`${index}-${'left' in star ? star.left : star.right}-${star.top}`}
            style={[
              styles.star,
              {
                top: star.top,
                left: 'left' in star ? star.left : undefined,
                right: 'right' in star ? star.right : undefined,
                width: star.size,
                height: star.size,
                borderRadius: star.size,
                backgroundColor: withOpacity(colors.text, star.alpha),
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {topSlot ? <View style={styles.topSlot}>{topSlot}</View> : null}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -42,
    left: -30,
    right: -30,
    height: 430,
  },
  topMist: {
    position: 'absolute',
    top: 0,
    left: 40,
    right: 40,
    height: 260,
    borderBottomLeftRadius: 220,
    borderBottomRightRadius: 220,
  },
  ringLarge: {
    position: 'absolute',
    top: 58,
    alignSelf: 'center',
    width: 334,
    height: 334,
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.7,
    transform: [{ rotate: '-12deg' }],
  },
  ringSmall: {
    position: 'absolute',
    top: 118,
    alignSelf: 'center',
    width: 248,
    height: 248,
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.8,
    transform: [{ rotate: '16deg' }],
  },
  lowerAura: {
    position: 'absolute',
    bottom: 94,
    alignSelf: 'center',
    width: 280,
    height: 68,
    borderRadius: 999,
  },
  bottomArc: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 18,
    height: 2,
    borderRadius: 999,
  },
  star: {
    position: 'absolute',
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    justifyContent: 'space-between',
    gap: 18,
  },
  topSlot: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
