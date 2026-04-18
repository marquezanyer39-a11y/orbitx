import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  symbol: string;
  side: string;
  entry: string;
  pnl: string;
  riskState: string;
}

export function LivePositionCard({ symbol, side, entry, pnl, riskState }: Props) {
  const { colors } = useAppTheme();
  const pnlColor = pnl.startsWith('-') ? colors.loss : colors.profit;

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
      <View style={styles.row}>
        <Text style={[styles.symbol, { color: colors.text }]}>{symbol}</Text>
        <Text style={[styles.side, { color: colors.textMuted }]}>{side}</Text>
      </View>
      <View style={styles.metrics}>
        <Text style={[styles.metric, { color: colors.textSoft }]}>Entrada {entry}</Text>
        <Text style={[styles.metric, { color: pnlColor }]}>{pnl}</Text>
        <Text style={[styles.metric, { color: colors.warning }]}>{riskState}</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  symbol: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  side: {
    fontFamily: FONT.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metrics: {
    gap: 6,
  },
  metric: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 18,
  },
});
