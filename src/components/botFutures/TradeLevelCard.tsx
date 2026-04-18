import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  label: string;
  value: string;
  note: string;
  tone?: 'default' | 'risk' | 'reward';
}

export function TradeLevelCard({ label, value, note, tone = 'default' }: Props) {
  const { colors } = useAppTheme();
  const accent =
    tone === 'risk' ? colors.warning : tone === 'reward' ? colors.profit : colors.text;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.84),
          borderColor: withOpacity(accent, tone === 'default' ? 0.16 : 0.22),
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={[styles.note, { color: colors.textSoft }]}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  value: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  note: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
