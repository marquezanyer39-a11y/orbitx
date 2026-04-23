import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import type { OrderBookRow } from '../../types';

const BUY = '#00FFA3';
const SELL = '#FF4D4D';
const TEXT = '#FFFFFF';
const TEXT_MUTED = '#8E8EA0';
const CARD = '#111218';
const BORDER = 'rgba(255,255,255,0.08)';

interface Props {
  rows: OrderBookRow[];
  currentPrice?: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: price >= 100 ? 1 : 2,
    maximumFractionDigits: price >= 100 ? 1 : 4,
  }).format(price);
}

function buildCumulativeDepth(rows: OrderBookRow[], side: 'buy' | 'sell') {
  const sorted = rows
    .filter((row) => row.side === side)
    .sort((left, right) => (side === 'buy' ? right.price - left.price : left.price - right.price))
    .slice(0, 12);

  let cumulative = 0;
  return sorted.map((row) => {
    cumulative += row.quantity;
    return {
      price: row.price,
      cumulative,
    };
  });
}

export function TradeDepthCard({ rows, currentPrice }: Props) {
  const bidDepth = buildCumulativeDepth(rows, 'buy').reverse();
  const askDepth = buildCumulativeDepth(rows, 'sell');
  const maxDepth = Math.max(
    ...bidDepth.map((row) => row.cumulative),
    ...askDepth.map((row) => row.cumulative),
    1,
  );
  const segmentCount = Math.max(bidDepth.length, askDepth.length, 8);
  const buyTotal = bidDepth.at(-1)?.cumulative ?? 0;
  const sellTotal = askDepth.at(-1)?.cumulative ?? 0;
  const totalDepth = Math.max(buyTotal + sellTotal, 1);
  const buyShare = Math.round((buyTotal / totalDepth) * 100);
  const sellShare = 100 - buyShare;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Profundidad</Text>
          <Text style={styles.subtitle}>
            Lectura acumulada del libro para medir presion compradora y vendedora.
          </Text>
        </View>
        <Text style={styles.priceLabel}>
          {currentPrice ? formatPrice(currentPrice) : '--'}
        </Text>
      </View>

      <View style={styles.graphShell}>
        <View style={styles.centerLine} />
        {Array.from({ length: segmentCount }).map((_, index) => {
          const buyValue = bidDepth[index]?.cumulative ?? 0;
          const sellValue = askDepth[index]?.cumulative ?? 0;
          const buyWidth = Math.max((buyValue / maxDepth) * 100, buyValue ? 8 : 0);
          const sellWidth = Math.max((sellValue / maxDepth) * 100, sellValue ? 8 : 0);

          return (
            <View key={`depth-row-${index}`} style={styles.graphRow}>
              <View style={styles.graphHalf}>
                <View
                  style={[
                    styles.depthBand,
                    styles.depthBandBuy,
                    {
                      width: `${buyWidth}%`,
                      backgroundColor: withOpacity(BUY, 0.18),
                      borderColor: withOpacity(BUY, 0.2),
                    },
                  ]}
                />
              </View>
              <View style={styles.graphHalf}>
                <View
                  style={[
                    styles.depthBand,
                    styles.depthBandSell,
                    {
                      width: `${sellWidth}%`,
                      backgroundColor: withOpacity(SELL, 0.18),
                      borderColor: withOpacity(SELL, 0.2),
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.axisRow}>
        <Text style={styles.axisLabel}>
          Buy side {bidDepth[0] ? formatPrice(bidDepth[0].price) : '--'}
        </Text>
        <Text style={styles.axisLabel}>
          Sell side {askDepth.at(-1) ? formatPrice(askDepth.at(-1)!.price) : '--'}
        </Text>
      </View>

      <View style={styles.balanceRow}>
        <View style={styles.balanceMeta}>
          <Text style={[styles.balanceCaption, { color: BUY }]}>Comprar</Text>
          <Text style={styles.balanceValue}>{buyShare}%</Text>
        </View>
        <View style={styles.balanceBar}>
          <View
            style={[
              styles.balanceBuy,
              { width: `${buyShare}%`, backgroundColor: withOpacity(BUY, 0.7) },
            ]}
          />
          <View
            style={[
              styles.balanceSell,
              { width: `${sellShare}%`, backgroundColor: withOpacity(SELL, 0.7) },
            ]}
          />
        </View>
        <View style={[styles.balanceMeta, styles.balanceMetaRight]}>
          <Text style={[styles.balanceCaption, { color: SELL }]}>Vender</Text>
          <Text style={styles.balanceValue}>{sellShare}%</Text>
        </View>
      </View>
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
    gap: 12,
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
  priceLabel: {
    color: TEXT,
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  graphShell: {
    height: 132,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  centerLine: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: '50%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  graphRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  graphHalf: {
    flex: 1,
    justifyContent: 'center',
  },
  depthBand: {
    height: 8,
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
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  axisLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceMeta: {
    width: 58,
    gap: 2,
  },
  balanceMetaRight: {
    alignItems: 'flex-end',
  },
  balanceCaption: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  balanceValue: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  balanceBar: {
    flex: 1,
    height: 14,
    borderRadius: RADII.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  balanceBuy: {
    height: '100%',
  },
  balanceSell: {
    height: '100%',
  },
});
