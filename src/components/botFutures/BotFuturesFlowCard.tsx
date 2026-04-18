import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  currentStep: string;
  nextAction: string;
}

export function BotFuturesFlowCard({ currentStep, nextAction }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(colors.borderStrong, 0.16),
        },
      ]}
    >
      <View
        style={[
          styles.column,
          {
            borderRightColor: withOpacity(colors.borderStrong, 0.12),
          },
        ]}
      >
        <Text style={[styles.label, { color: colors.textMuted }]}>PASO ACTUAL</Text>
        <Text style={[styles.value, { color: colors.warning }]}>{currentStep}</Text>
      </View>

      <View style={styles.column}>
        <Text style={[styles.label, { color: colors.textMuted }]}>SIGUIENTE ACCION</Text>
        <Text style={[styles.value, { color: colors.primary }]}>{nextAction}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    gap: 6,
    paddingHorizontal: 8,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 10,
    lineHeight: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.32,
  },
  value: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
});
