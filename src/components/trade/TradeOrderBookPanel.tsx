import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import type { MarketRealtimeStatus, OrderBookRow } from '../../types';
import { getTradeRealtimeStatusLabel } from '../../utils/tradeRealtimeUi';

const BUY = '#00FFA3';
const SELL = '#FF4D4D';
const TEXT = '#FFFFFF';
const TEXT_MUTED = '#8E8EA0';
const CARD = '#111218';
const BORDER = 'rgba(255,255,255,0.08)';

interface Props {
  rows: OrderBookRow[];
  status: MarketRealtimeStatus;
  statusLabel?: string;
  statusCopy?: string;
  error?: string | null;
  currentPrice?: number;
  preview?: boolean;
  onPickPrice?: (price: number) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: price >= 100 ? 1 : 2,
    maximumFractionDigits: price >= 100 ? 1 : 4,
  }).format(price);
}

function formatQty(quantity: number) {
  return quantity >= 1 ? quantity.toFixed(3) : quantity.toFixed(4);
}

function getStatusTone(status: MarketRealtimeStatus) {
  if (status === 'live') {
    return BUY;
  }
  if (status === 'reconnecting' || status === 'connecting') {
    return '#7B3FE4';
  }
  if (status === 'error') {
    return SELL;
  }
  return TEXT_MUTED;
}

export function TradeOrderBookPanel({
  rows,
  status,
  statusLabel,
  statusCopy,
  error,
  currentPrice,
  preview = false,
  onPickPrice,
}: Props) {
  const asks = rows
    .filter((row) => row.side === 'sell')
    .sort((left, right) => left.price - right.price)
    .slice(0, preview ? 6 : 10);
  const bids = rows
    .filter((row) => row.side === 'buy')
    .sort((left, right) => right.price - left.price)
    .slice(0, preview ? 6 : 10);
  const askMax = Math.max(...asks.map((row) => row.total), 1);
  const bidMax = Math.max(...bids.map((row) => row.total), 1);
  const spread =
    asks.length && bids.length ? Math.max(asks[0].price - bids[0].price, 0) : 0;
  const statusTone = getStatusTone(status);
  const displayStatusLabel = statusLabel || getTradeRealtimeStatusLabel(status);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Libro de ordenes</Text>
          <Text style={styles.subtitle}>
            {rows.length
              ? statusCopy || displayStatusLabel
              : error || 'Esperando profundidad del mercado'}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            { borderColor: withOpacity(statusTone, 0.32), backgroundColor: withOpacity(statusTone, 0.12) },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusTone }]} />
          <Text style={styles.statusLabel}>{displayStatusLabel}</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.headerCellLeft}>Precio</Text>
        <Text style={styles.headerCell}>Cantidad</Text>
        <Text style={styles.headerCellRight}>Total</Text>
      </View>

      {rows.length ? (
        <>
          {asks.map((row) => {
            const depth = Math.max((row.total / askMax) * 100, 8);
            return (
              <Pressable
                key={row.id}
                onPress={() => onPickPrice?.(row.price)}
                style={styles.row}
              >
                <View
                  style={[
                    styles.depthFill,
                    styles.depthFillSell,
                    { width: `${depth}%`, backgroundColor: withOpacity(SELL, 0.14) },
                  ]}
                />
                <Text style={[styles.rowPrice, { color: SELL }]}>{formatPrice(row.price)}</Text>
                <Text style={styles.rowValue}>{formatQty(row.quantity)}</Text>
                <Text style={[styles.rowValue, styles.rowValueRight]}>{row.total.toFixed(3)}</Text>
              </Pressable>
            );
          })}

          <View style={styles.midline}>
            <Text style={styles.midlineLabel}>Precio actual</Text>
            <Text style={styles.midlinePrice}>
              {currentPrice ? formatPrice(currentPrice) : '--'}
            </Text>
            <Text style={styles.midlineSpread}>
              Spread {spread ? formatPrice(spread) : '--'}
            </Text>
          </View>

          {bids.map((row) => {
            const depth = Math.max((row.total / bidMax) * 100, 8);
            return (
              <Pressable
                key={row.id}
                onPress={() => onPickPrice?.(row.price)}
                style={styles.row}
              >
                <View
                  style={[
                    styles.depthFill,
                    styles.depthFillBuy,
                    { width: `${depth}%`, backgroundColor: withOpacity(BUY, 0.14) },
                  ]}
                />
                <Text style={[styles.rowPrice, { color: BUY }]}>{formatPrice(row.price)}</Text>
                <Text style={styles.rowValue}>{formatQty(row.quantity)}</Text>
                <Text style={[styles.rowValue, styles.rowValueRight]}>{row.total.toFixed(3)}</Text>
              </Pressable>
            );
          })}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sin profundidad todavia</Text>
          <Text style={styles.emptyBody}>
            {error || 'OrbitX esta esperando el snapshot del libro de ordenes para este par.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  subtitle: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  statusPill: {
    minHeight: 28,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
  },
  statusLabel: {
    color: TEXT,
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerCellLeft: {
    flex: 1,
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  headerCell: {
    flex: 1,
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
    textAlign: 'center',
  },
  headerCellRight: {
    flex: 1,
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
    textAlign: 'right',
  },
  row: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    borderRadius: 10,
  },
  depthFill: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: 9,
  },
  depthFillSell: {
    right: 0,
  },
  depthFillBuy: {
    left: 0,
  },
  rowPrice: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: 12,
    zIndex: 1,
  },
  rowValue: {
    flex: 1,
    color: TEXT,
    fontFamily: FONT.medium,
    fontSize: 11,
    textAlign: 'center',
    zIndex: 1,
  },
  rowValueRight: {
    textAlign: 'right',
  },
  midline: {
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  midlineLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  midlinePrice: {
    color: TEXT,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  midlineSpread: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  emptyState: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  emptyTitle: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  emptyBody: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
