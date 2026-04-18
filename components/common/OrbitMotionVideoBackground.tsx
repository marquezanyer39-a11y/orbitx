import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface OrbitMotionVideoBackgroundProps {
  enabled: boolean;
}

function getPresetAccent(preset: ReturnType<typeof useAppTheme>['orbitMotionPreset']) {
  if (preset === 'bear') {
    return '#FF7A4F';
  }

  if (preset === 'battle') {
    return '#19E6FF';
  }

  return '#5CA8FF';
}

export function OrbitMotionVideoBackground({
  enabled,
}: OrbitMotionVideoBackgroundProps) {
  const { colors, orbitMotionPreset } = useAppTheme();

  if (!enabled) {
    return null;
  }

  const accent = getPresetAccent(orbitMotionPreset);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[
          withOpacity(accent, 0.12),
          withOpacity(colors.backgroundAlt, 0.14),
          withOpacity(colors.background, 0.24),
          withOpacity('#040408', 0.42),
        ]}
        start={{ x: 0.16, y: 0.04 }}
        end={{ x: 0.88, y: 0.96 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[
          withOpacity(accent, 0.1),
          'transparent',
          withOpacity(colors.primary, 0.08),
        ]}
        start={{ x: 0.1, y: 0.18 }}
        end={{ x: 0.9, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.accentBand,
          {
            backgroundColor: withOpacity(accent, 0.08),
            borderColor: withOpacity(accent, 0.14),
          },
        ]}
      />

      <View
        style={[
          styles.supportBand,
          {
            backgroundColor: withOpacity(colors.text, 0.03),
            borderColor: withOpacity(colors.text, 0.06),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  accentBand: {
    position: 'absolute',
    top: 42,
    left: 18,
    right: 52,
    height: 132,
    borderRadius: 34,
    borderWidth: 1,
    transform: [{ rotate: '-8deg' }],
  },
  supportBand: {
    position: 'absolute',
    top: 108,
    left: 86,
    right: 16,
    height: 98,
    borderRadius: 28,
    borderWidth: 1,
    transform: [{ rotate: '6deg' }],
  },
});
