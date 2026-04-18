import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  baseLabel: string;
  baseBalance: number;
  quoteLabel: string;
  quoteBalance: number;
}

export function TradeBalanceCard({ baseLabel, baseBalance, quoteLabel, quoteBalance }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Saldo disponible</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {quoteBalance.toFixed(4)} {quoteLabel}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Activo base</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {baseBalance.toFixed(6)} {baseLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  value: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
});
