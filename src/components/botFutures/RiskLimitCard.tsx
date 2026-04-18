import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  label: string;
  value: string;
  note: string;
}

export function RiskLimitCard({ label, value, note }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(colors.borderStrong, 0.18),
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
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
