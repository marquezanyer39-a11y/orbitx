import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Metric {
  label: string;
  value: string;
}

interface Props {
  metrics: Metric[];
}

export function BotLiveMetricStrip({ metrics }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      {metrics.map((metric) => (
        <View
          key={metric.label}
          style={[
            styles.card,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
              borderColor: withOpacity(colors.borderStrong, 0.18),
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.textMuted }]}>{metric.label}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{metric.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: 140,
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 14,
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
});
