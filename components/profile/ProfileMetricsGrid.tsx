import { StyleSheet, Text, View } from 'react-native';

import { PROFILE_THEME, getMetricToneColor, withProfileAlpha } from './profileTheme';

export interface ProfileMetricItem {
  id: string;
  title: string;
  value: string;
  tone: 'positive' | 'negative' | 'neutral' | 'warning';
}

interface ProfileMetricsGridProps {
  items: ProfileMetricItem[];
  isSmallPhone: boolean;
}

export function ProfileMetricsGrid({ items, isSmallPhone }: ProfileMetricsGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={[styles.label, isSmallPhone && styles.labelSmall]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text
            style={[
              styles.value,
              isSmallPhone && styles.valueSmall,
              { color: getMetricToneColor(item.tone) },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48.2%',
    minWidth: 0,
    borderRadius: PROFILE_THEME.radius.secondary,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceLow, 0.95),
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.outline, 0.5),
    gap: 10,
  },
  label: {
    color: PROFILE_THEME.colors.textSecondary,
    fontFamily: PROFILE_THEME.typography.bodyMedium,
    fontSize: 13,
  },
  labelSmall: {
    fontSize: 12,
  },
  value: {
    color: PROFILE_THEME.colors.textPrimary,
    fontFamily: PROFILE_THEME.typography.title,
    fontSize: 29,
    lineHeight: 32,
  },
  valueSmall: {
    fontSize: 26,
    lineHeight: 30,
  },
});
