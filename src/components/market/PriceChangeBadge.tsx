import { StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatPercent } from '../../utils/formatPercent';

export function PriceChangeBadge({ value }: { value: number }) {
  const { colors } = useAppTheme();
  const positive = value >= 0;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: positive
            ? withOpacity(colors.profit, 0.12)
            : withOpacity(colors.loss, 0.12),
          borderColor: positive
            ? withOpacity(colors.profit, 0.18)
            : withOpacity(colors.loss, 0.18),
        },
      ]}
    >
      <Text style={[styles.label, { color: positive ? colors.profit : colors.loss }]}>
        {formatPercent(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 60,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignItems: 'center',
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
});
