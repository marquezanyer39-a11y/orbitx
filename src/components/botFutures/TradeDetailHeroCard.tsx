import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { ExchangeAvailabilityPill } from './ExchangeAvailabilityPill';

interface Props {
  symbol: string;
  side: string;
  exchange: string;
  mode: string;
  setupLabel: string;
}

export function TradeDetailHeroCard({
  symbol,
  side,
  exchange,
  mode,
  setupLabel,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(colors.borderStrong, 0.2),
        },
      ]}
    >
      <View style={styles.topRow}>
        <ExchangeAvailabilityPill label={exchange} tone="featured" />
        <ExchangeAvailabilityPill label={mode} tone="planned" />
      </View>
      <Text style={[styles.symbol, { color: colors.text }]}>{symbol}</Text>
      <Text style={[styles.side, { color: colors.primary }]}>{side}</Text>
      <Text style={[styles.setup, { color: colors.textSoft }]}>{setupLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  symbol: {
    fontFamily: FONT.bold,
    fontSize: 26,
  },
  side: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  setup: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
});
