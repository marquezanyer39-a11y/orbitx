import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  steps: string[];
  warning: string;
}

export function ConnectionGuideCard({ title, steps, warning }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.86),
          borderColor: withOpacity(colors.borderStrong, 0.18),
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <View
        style={[
          styles.imageShell,
          {
            backgroundColor: withOpacity(colors.backgroundAlt, 0.92),
            borderColor: withOpacity(colors.borderStrong, 0.16),
          },
        ]}
      >
        <View style={[styles.fakeLogo, { backgroundColor: withOpacity(colors.primary, 0.1) }]}>
          <Text style={[styles.fakeLogoText, { color: colors.primary }]}>API</Text>
        </View>
      </View>

      <View style={styles.stepList}>
        {steps.map((step, index) => (
          <Text key={step} style={[styles.stepText, { color: colors.textSoft }]}>
            {index + 1}. {step}
          </Text>
        ))}
      </View>

      <Text style={[styles.warning, { color: colors.warning }]}>{warning}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  imageShell: {
    height: 112,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fakeLogo: {
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fakeLogoText: {
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 24,
  },
  stepList: {
    gap: 8,
  },
  stepText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  warning: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
});
