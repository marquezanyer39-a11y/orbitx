import { LinearGradient } from 'expo-linear-gradient';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { OrbitBullIntro3D } from './OrbitBullIntro3D';

interface OrbitBullHeroProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
  compact?: boolean;
  bullSize?: number;
  sceneMode?: 'idle' | 'loading';
  entryDelay?: number;
  runOutOnSuccess?: boolean;
  onRunOutComplete?: () => void;
  fallbackImage?: ImageSourcePropType;
}

export function OrbitBullHero({
  title,
  subtitle,
  eyebrow = 'OrbitX',
  compact = false,
  bullSize,
  sceneMode = 'idle',
  entryDelay = 120,
  runOutOnSuccess = false,
  onRunOutComplete,
  fallbackImage,
}: OrbitBullHeroProps) {
  const { colors } = useAppTheme();
  const heroSize = bullSize ?? (compact ? 228 : 290);
  const stageSize = compact ? 260 : 320;

  return (
    <View style={[styles.shell, compact && styles.shellCompact]}>
      <View style={[styles.stage, { width: stageSize, height: compact ? 240 : 292 }]}>
        <LinearGradient
          colors={[
            withOpacity(colors.primary, compact ? 0.12 : 0.16),
            withOpacity(colors.profit, compact ? 0.05 : 0.06),
            'transparent',
          ]}
          start={{ x: 0.15, y: 0.12 }}
          end={{ x: 0.92, y: 0.88 }}
          style={styles.coreGlow}
        />
        <View
          style={[
            styles.ringOuter,
            {
              borderColor: withOpacity(colors.primary, compact ? 0.18 : 0.24),
            },
          ]}
        />
        <View
          style={[
            styles.ringInner,
            {
              borderColor: withOpacity(colors.text, compact ? 0.06 : 0.08),
            },
          ]}
        />
        <View
          style={[
            styles.floorAura,
            {
              backgroundColor: withOpacity(colors.primary, compact ? 0.12 : 0.16),
            },
          ]}
        />
        <View
          style={[
            styles.orbLeft,
            { backgroundColor: withOpacity(colors.primary, compact ? 0.1 : 0.14) },
          ]}
        />
        <View
          style={[
            styles.orbRight,
            { backgroundColor: withOpacity(colors.profit, compact ? 0.06 : 0.08) },
          ]}
        />
        <OrbitBullIntro3D
          size={heroSize}
          compactMode={compact}
          breathingIntensity={sceneMode === 'loading' ? 1.2 : 0.95}
          glowIntensity={sceneMode === 'loading' ? 1.16 : 1.04}
          entryDelay={entryDelay}
          autoRotate={sceneMode === 'loading'}
          sceneMode={sceneMode}
          runOutOnSuccess={runOutOnSuccess}
          onRunOutComplete={onRunOutComplete}
          fallbackImage={fallbackImage}
        />
      </View>

      <View style={styles.copy}>
        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{eyebrow}</Text>
        <Text style={[styles.title, compact && styles.titleCompact, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, compact && styles.subtitleCompact, { color: colors.textSoft }]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    gap: 14,
  },
  shellCompact: {
    gap: 10,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  coreGlow: {
    position: 'absolute',
    width: '86%',
    height: '74%',
    borderRadius: 999,
  },
  ringOuter: {
    position: 'absolute',
    width: '96%',
    height: '88%',
    borderRadius: 999,
    borderWidth: 1,
    transform: [{ rotate: '-12deg' }],
  },
  ringInner: {
    position: 'absolute',
    width: '74%',
    height: '66%',
    borderRadius: 999,
    borderWidth: 1,
    transform: [{ rotate: '18deg' }],
  },
  floorAura: {
    position: 'absolute',
    bottom: 26,
    width: '62%',
    height: 38,
    borderRadius: 999,
    opacity: 0.7,
    transform: [{ rotate: '-8deg' }],
  },
  orbLeft: {
    position: 'absolute',
    left: 30,
    top: 56,
    width: 74,
    height: 74,
    borderRadius: 999,
  },
  orbRight: {
    position: 'absolute',
    right: 34,
    bottom: 54,
    width: 58,
    height: 58,
    borderRadius: 999,
  },
  copy: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
  },
  eyebrow: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 30,
    lineHeight: 34,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 24,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 320,
  },
  subtitleCompact: {
    fontSize: 13,
    lineHeight: 19,
  },
});
