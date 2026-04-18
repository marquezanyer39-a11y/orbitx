import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { RecentTradeRow } from '../../types';

interface Props {
  rows: RecentTradeRow[];
}

export function RecentTrades({ rows }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Últimas operaciones</Text>
      {rows.slice(0, 8).map((row, index) => (
        <View
          key={row.id}
          style={[
            styles.row,
            {
              borderBottomColor:
                index === rows.length - 1 ? 'transparent' : withOpacity(colors.border, 0.6),
            },
          ]}
        >
          <Text style={[styles.price, { color: row.side === 'buy' ? colors.profit : colors.loss }]}>
            {row.price.toFixed(2)}
          </Text>
          <Text style={[styles.qty, { color: colors.textSoft }]}>{row.quantity.toFixed(5)}</Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {new Date(row.time).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 5,
  },
  price: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  qty: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  time: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
});
