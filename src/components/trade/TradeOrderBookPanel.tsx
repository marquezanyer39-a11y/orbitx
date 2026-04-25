import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import type { MarketRealtimeStatus, OrderBookRow, TradeSide } from '../../types';
import { getTradeRealtimeStatusLabel } from '../../utils/tradeRealtimeUi';

const BUY = '#00FFA3';
const SELL = '#FF4D4D';
const TEXT = '#FFFFFF';
const TEXT_SOFT = '#C8C8D2';
const TEXT_MUTED = '#8E8EA0';
const BORDER = 'rgba(255,255,255,0.08)';

interface Props {
  rows: OrderBookRow[];
  status: MarketRealtimeStatus;
  statusLabel?: string;
  statusCopy?: string;
  error?: string | null;
  currentPrice?: number;
  preview?: boolean;
  onPickPrice?: (price: number, side: TradeSide) => void;
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

function buildDepth(rows: OrderBookRow[], side: 'buy' | 'sell', limit: number) {
  const sorted = rows
    .filter((row) => row.side === side)
    .sort((left, right) => (side === 'buy' ? right.price - left.price : left.price - right.price))
    .slice(0, limit);

  let cumulative = 0;
  return sorted.map((row) => {
    cumulative += row.total;
    return {
      ...row,
      cumulative,
    };
  });
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
  const rowLimit = preview ? 7 : 10;
  const asks = buildDepth(rows, 'sell', rowLimit);
  const bids = buildDepth(rows, 'buy', rowLimit);
  const levels = Math.max(asks.length, bids.length);
  const maxAsk = Math.max(...asks.map((row) => row.cumulative), 1);
  const maxBid = Math.max(...bids.map((row) => row.cumulative), 1);
  const pairedRows = Array.from({ length: levels }, (_, index) => ({
    bid: bids[index],
    ask: asks[index],
  }));
  const totalBuy = bids.at(-1)?.cumulative ?? 0;
  const totalSell = asks.at(-1)?.cumulative ?? 0;
  const totalDepth = Math.max(totalBuy + totalSell, 1);
  const buyShare = Math.round((totalBuy / totalDepth) * 100);
  const sellShare = 100 - buyShare;
  const spread = asks.length && bids.length ? Math.max(asks[0].price - bids[0].price, 0) : 0;
  const displayStatusLabel = statusLabel || getTradeRealtimeStatusLabel(status);
  const statusTone = getStatusTone(status);

  return (
    <View style={styles.shell}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Libro de ordenes</Text>
          <Text style={styles.subtitle}>
            {rows.length
              ? statusCopy || displayStatusLabel
              : error || 'Esperando profundidad del mercado'}
          </Text>
        </View>

        <View style={styles.headerMeta}>
          <View
            style={[
              styles.statusPill,
              {
                borderColor: withOpacity(statusTone, 0.28),
                backgroundColor: withOpacity(statusTone, 0.12),
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusTone }]} />
            <Text style={styles.statusLabel}>{displayStatusLabel}</Text>
          </View>

          <View style={styles.scalePill}>
            <Text style={styles.scaleLabel}>0.1</Text>
            <Ionicons name="chevron-down" size={12} color={TEXT_MUTED} />
          </View>
        </View>
      </View>

      {rows.length ? (
        <>
          <View style={styles.depthShell}>
            <View style={styles.depthCenterLine} />
            {Array.from({ length: 10 }).map((_, index) => {
              const buyDepth = bids[index]?.cumulative ?? 0;
              const sellDepth = asks[index]?.cumulative ?? 0;
              const buyWidth = Math.max((buyDepth / maxBid) * 100, buyDepth ? 10 : 0);
              const sellWidth = Math.max((sellDepth / maxAsk) * 100, sellDepth ? 10 : 0);

              return (
                <View key={`depth-${index}`} style={styles.depthRow}>
                  <View style={styles.depthHalf}>
                    <View
                      style={[
                        styles.depthBand,
                        styles.depthBandBuy,
                        {
                          width: `${buyWidth}%`,
                          backgroundColor: withOpacity(BUY, 0.16),
                          borderColor: withOpacity(BUY, 0.18),
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.depthHalf}>
                    <View
                      style={[
                        styles.depthBand,
                        styles.depthBandSell,
                        {
                          width: `${sellWidth}%`,
                          backgroundColor: withOpacity(SELL, 0.16),
                          borderColor: withOpacity(SELL, 0.18),
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.balanceRow}>
            <Text style={[styles.balanceLabel, { color: BUY }]}>Comprar {buyShare}%</Text>
            <View style={styles.balanceBar}>
              <View style={[styles.balanceFill, { width: `${buyShare}%`, backgroundColor: BUY }]} />
              <View style={[styles.balanceFill, { width: `${sellShare}%`, backgroundColor: SELL }]} />
            </View>
            <Text style={[styles.balanceLabel, styles.balanceLabelRight, { color: SELL }]}>
              {sellShare}% Vender
            </Text>
          </View>

          <View style={styles.priceStrip}>
            <Text style={styles.priceStripLabel}>Precio actual</Text>
            <Text style={styles.priceStripValue}>
              {currentPrice ? formatPrice(currentPrice) : '--'}
            </Text>
            <Text style={styles.priceStripMeta}>Spread {spread ? formatPrice(spread) : '--'}</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={styles.headerCellLeft}>Importe</Text>
            <Text style={styles.headerCellBuy}>Precio</Text>
            <Text style={styles.headerCellSell}>Precio</Text>
            <Text style={styles.headerCellRight}>Importe</Text>
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bookRows}
          >
            {pairedRows.map(({ bid, ask }, index) => {
              const bidWidth = bid ? Math.max((bid.cumulative / maxBid) * 100, 10) : 0;
              const askWidth = ask ? Math.max((ask.cumulative / maxAsk) * 100, 10) : 0;

              return (
                <View key={`order-book-${index}`} style={styles.bookRow}>
                  {bid ? (
                    <View
                      style={[
                        styles.depthFill,
                        styles.depthFillBuy,
                        {
                          width: `${bidWidth}%`,
                          backgroundColor: withOpacity(BUY, 0.14),
                        },
                      ]}
                    />
                  ) : null}

                  {ask ? (
                    <View
                      style={[
                        styles.depthFill,
                        styles.depthFillSell,
                        {
                          width: `${askWidth}%`,
                          backgroundColor: withOpacity(SELL, 0.14),
                        },
                      ]}
                    />
                  ) : null}

                  <Text style={styles.bidQty}>{bid ? formatQty(bid.quantity) : '--'}</Text>

                  <Pressable
                    disabled={!bid}
                    onPress={() => bid && onPickPrice?.(bid.price, bid.side)}
                    style={styles.priceCell}
                  >
                    <Text style={[styles.bidPrice, !bid ? styles.emptyCell : null]}>
                      {bid ? formatPrice(bid.price) : '--'}
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={!ask}
                    onPress={() => ask && onPickPrice?.(ask.price, ask.side)}
                    style={styles.priceCell}
                  >
                    <Text style={[styles.askPrice, !ask ? styles.emptyCell : null]}>
                      {ask ? formatPrice(ask.price) : '--'}
                    </Text>
                  </Pressable>

                  <Text style={[styles.askQty, !ask ? styles.emptyCell : null]}>
                    {ask ? formatQty(ask.quantity) : '--'}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
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
  shell: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    fontSize: 13,
  },
  subtitle: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  headerMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusPill: {
    minHeight: 24,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  statusLabel: {
    color: TEXT,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  scalePill: {
    minHeight: 24,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scaleLabel: {
    color: TEXT_SOFT,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  depthShell: {
    height: 92,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.015)',
    overflow: 'hidden',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  depthCenterLine: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: '50%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  depthRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  depthHalf: {
    flex: 1,
    justifyContent: 'center',
  },
  depthBand: {
    height: 6,
    borderWidth: 1,
  },
  depthBandBuy: {
    alignSelf: 'flex-end',
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },
  depthBandSell: {
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: {
    width: 76,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  balanceLabelRight: {
    textAlign: 'right',
  },
  balanceBar: {
    flex: 1,
    height: 10,
    borderRadius: RADII.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  balanceFill: {
    height: '100%',
  },
  priceStrip: {
    minHeight: 34,
    borderRadius: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.012)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  priceStripLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  priceStripValue: {
    color: TEXT,
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  priceStripMeta: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerCellLeft: {
    flex: 1,
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
    textAlign: 'left',
  },
  headerCellBuy: {
    flex: 1,
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
    textAlign: 'center',
  },
  headerCellSell: {
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
  bookRows: {
    gap: 3,
    paddingBottom: 4,
  },
  bookRow: {
    minHeight: 26,
    borderRadius: 9,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  depthFill: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: 8,
  },
  depthFillBuy: {
    left: 0,
  },
  depthFillSell: {
    right: 0,
  },
  bidQty: {
    flex: 1,
    color: TEXT_SOFT,
    fontFamily: FONT.medium,
    fontSize: 11,
    textAlign: 'left',
    zIndex: 1,
  },
  askQty: {
    flex: 1,
    color: TEXT_SOFT,
    fontFamily: FONT.medium,
    fontSize: 11,
    textAlign: 'right',
    zIndex: 1,
  },
  priceCell: {
    flex: 1,
    zIndex: 1,
  },
  bidPrice: {
    color: BUY,
    fontFamily: FONT.semibold,
    fontSize: 11,
    textAlign: 'center',
  },
  askPrice: {
    color: SELL,
    fontFamily: FONT.semibold,
    fontSize: 11,
    textAlign: 'center',
  },
  emptyCell: {
    color: TEXT_MUTED,
  },
  emptyState: {
    flex: 1,
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
