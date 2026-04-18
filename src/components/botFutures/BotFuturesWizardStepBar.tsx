import { StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  currentStep: number;
  totalSteps: number;
  label: string;
}

export function BotFuturesWizardStepBar({
  currentStep,
  totalSteps,
  label,
}: Props) {
  const { colors } = useAppTheme();
  const progress = Math.max(0, Math.min(1, currentStep / totalSteps));

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View
        style={[
          styles.track,
          {
            backgroundColor: withOpacity(colors.borderStrong, 0.14),
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${progress * 100}%`,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  track: {
    width: '100%',
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
