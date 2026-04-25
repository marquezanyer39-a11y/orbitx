import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { MarketRealtimeStatus, OrderBookRow, TradeSide } from '../../types';

interface Props {
  rows: OrderBookRow[];
  baseSymbol: string;
  status: MarketRealtimeStatus;
  statusLabel: string;
  error?: string | null;
  onPickPrice: (price: number, side: TradeSide) => void;
}

export function OrderBook({ rows, baseSymbol, status, statusLabel, error, onPickPrice }: Props) {
  const { colors } = useAppTheme();
  const asks = rows.filter((row) => row.side === 'sell').slice(0, 5);
  const bids = rows.filter((row) => row.side === 'buy').slice(0, 5);
  const maxDepth = Math.max(...rows.map((row) => row.quantity), 1);
  const mid = asks.at(-1)?.price ?? bids[0]?.price ?? rows[0]?.price ?? 0;
  const liveColor =
    status === 'live'
      ? colors.profit
      : status === 'connecting' || status === 'reconnecting'
        ? colors.primary
        : status === 'fallback'
          ? colors.warning
        : status === 'error'
          ? colors.loss
          : colors.textMuted;

  const emptyMessage =
    status === 'unsupported'
      ? 'Libro en vivo no disponible para este par.'
      : status === 'error'
        ? error || 'No se pudo conectar con la profundidad en vivo.'
        : status === 'reconnecting'
          ? 'Reconectando con el libro en vivo...'
          : status === 'fallback'
            ? 'Libro en vivo no disponible con la fuente actual.'
            : 'Conectando con el libro en vivo...';

  return (
    <View style={styles.container}>
      <View style={styles.topline}>
        <Text style={[styles.toplineLabel, { color: colors.textMuted }]}>Spread</Text>
        <View style={styles.statusShell}>
          <View style={[styles.statusDot, { backgroundColor: liveColor }]} />
          <Text style={[styles.toplineLabel, { color: liveColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {rows.length ? (
        <>
      <View style={styles.headerRow}>
        <Text style={[styles.headerPrice, { color: colors.textMuted }]}>Precio</Text>
        <Text style={[styles.headerQty, { color: colors.textMuted }]}>{baseSymbol}</Text>
      </View>

      {asks.map((row) => (
        <Pressable
          key={row.id}
          onPress={() => onPickPrice(row.price, row.side)}
          style={styles.rowShell}
        >
          <View
            style={[
              styles.depthFill,
              {
                width: `${Math.max((row.quantity / maxDepth) * 100, 10)}%`,
                backgroundColor: withOpacity(colors.loss, 0.12),
              },
            ]}
          />
          <Text style={[styles.sellPrice, { color: colors.loss }]}>{row.price.toFixed(0)}</Text>
          <Text style={[styles.quantity, { color: colors.textSoft }]}>{row.quantity.toFixed(3)}</Text>
        </Pressable>
      ))}

      <View
        style={[
          styles.midRow,
          {
            borderTopColor: withOpacity(colors.border, 0.7),
            borderBottomColor: withOpacity(colors.border, 0.7),
          },
        ]}
      >
        <Text style={[styles.midPrice, { color: colors.text }]}>USD {mid.toFixed(0)}</Text>
        <Text style={[styles.midArrow, { color: colors.profit }]}>^</Text>
      </View>

      {bids.map((row) => (
        <Pressable
          key={row.id}
          onPress={() => onPickPrice(row.price, row.side)}
          style={styles.rowShell}
        >
          <View
            style={[
              styles.depthFill,
              {
                width: `${Math.max((row.quantity / maxDepth) * 100, 10)}%`,
                backgroundColor: withOpacity(colors.profit, 0.12),
              },
            ]}
          />
          <Text style={[styles.buyPrice, { color: colors.profit }]}>{row.price.toFixed(0)}</Text>
          <Text style={[styles.quantity, { color: colors.textSoft }]}>{row.quantity.toFixed(3)}</Text>
        </Pressable>
      ))}
        </>
      ) : (
        <View
          style={[
            styles.emptyShell,
            {
              backgroundColor: withOpacity(colors.fieldBackground, 0.72),
              borderColor: withOpacity(colors.border, 0.75),
            },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin profundidad visible</Text>
          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  topline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  toplineLabel: {
    fontFamily: FONT.medium,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 1,
  },
  headerPrice: {
    fontFamily: FONT.medium,
    fontSize: 9,
  },
  headerQty: {
    fontFamily: FONT.medium,
    fontSize: 9,
    textAlign: 'right',
  },
  rowShell: {
    minHeight: 22,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  depthFill: {
    position: 'absolute',
    right: 0,
    top: 2,
    bottom: 2,
    borderRadius: RADII.sm,
  },
  sellPrice: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  buyPrice: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  quantity: {
    position: 'absolute',
    right: 0,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  emptyShell: {
    minHeight: 150,
    borderRadius: RADII.lg,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  emptyBody: {
    fontFamily: FONT.medium,
    fontSize: 11,
    lineHeight: 16,
  },
  midRow: {
    minHeight: 28,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  midPrice: {
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  midArrow: {
    fontFamily: FONT.bold,
    fontSize: 10,
  },
});
