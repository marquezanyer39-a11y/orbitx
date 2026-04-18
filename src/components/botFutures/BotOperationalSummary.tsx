import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface SummaryItem {
  label: string;
  value: string;
}

interface Props {
  items: SummaryItem[];
}

export function BotOperationalSummary({ items }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: colors.text }]}>Summario Operacional</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <View
            key={item.label}
            style={[
              styles.card,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
                borderColor: withOpacity(colors.borderStrong, 0.16),
              },
            ]}
          >
            <Text style={[styles.label, { color: colors.textMuted }]}>{item.label}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 16,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    gap: 6,
  },
  card: {
    flex: 1,
    minHeight: 58,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 9,
    lineHeight: 11,
    textAlign: 'center',
  },
  value: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
