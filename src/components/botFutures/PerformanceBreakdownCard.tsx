import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  rows: Array<{ label: string; value: string }>;
}

export function PerformanceBreakdownCard({ title, rows }: Props) {
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
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={styles.rows}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{row.label}</Text>
            <Text style={[styles.value, { color: colors.textSoft }]}>{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  rows: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    fontFamily: FONT.regular,
    fontSize: 13,
  },
  value: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
});
