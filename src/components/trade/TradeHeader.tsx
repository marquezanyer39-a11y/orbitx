import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { MarketPair, MarketRealtimeTicker } from '../../types';
import { formatPercent } from '../../utils/formatPercent';
import { AstraEntryPoint } from '../astra/AstraEntryPoint';

interface Props {
  pair: MarketPair;
  ticker?: MarketRealtimeTicker | null;
  favorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onOpenPairSelector: () => void;
  onOpenChart: () => void;
  onOpenAstra?: () => void;
}

function formatPriceValue(price: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: price >= 100 ? 0 : 2,
    maximumFractionDigits: price >= 100 ? 0 : 2,
  }).format(price);
}

function formatMetric(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 100 ? 0 : 2,
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function formatVolume(value: number) {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)} mil M`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)} mil M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)} K`;
  }
  return `$${value.toFixed(2)}`;
}

export function TradeHeader({
  pair,
  ticker,
  favorite,
  onBack,
  onToggleFavorite,
  onOpenPairSelector,
  onOpenChart,
  onOpenAstra,
}: Props) {
  const { colors } = useAppTheme();
  const currentPrice = ticker?.price ?? pair.price;
  const change24h = ticker?.change24h ?? pair.change24h;
  const high24h = ticker?.high24h ?? pair.high24h;
  const volume24h = ticker?.volume24h ?? pair.volume24h;
  const positive = change24h >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leftCluster}>
          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={[styles.iconButton, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </Pressable>

          <Pressable onPress={onOpenPairSelector} style={styles.pairShell}>
            {pair.image ? <Image source={{ uri: pair.image }} style={styles.pairImage} /> : null}
            <View style={styles.pairCopy}>
              <Text style={[styles.pairLabel, { color: colors.text }]}>{pair.symbol}</Text>
              <Text style={[styles.pairName, { color: colors.textMuted }]}>{pair.coin.name}</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.actions}>
          {onOpenAstra ? (
            <AstraEntryPoint onPress={onOpenAstra} size={34} accessibilityLabel="Abrir Astra en operar" />
          ) : null}
          <Pressable
            onPress={onToggleFavorite}
            style={[styles.iconButton, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}
          >
            <Ionicons
              name={favorite ? 'star' : 'star-outline'}
              size={16}
              color={favorite ? colors.warning : colors.textMuted}
            />
          </Pressable>
          <Pressable
            style={[styles.iconButton, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.priceBlock}>
          <Text style={[styles.priceValue, { color: colors.text }]}>
            USD {formatPriceValue(currentPrice)}
          </Text>
          <Text style={[styles.change, { color: positive ? colors.profit : colors.loss }]}>
            {formatPercent(change24h)}
          </Text>
        </View>

        <View style={styles.sideMeta}>
          <View style={styles.metaGrid}>
            <View style={styles.metaCell}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Alto 24h</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{formatMetric(high24h)}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Volumen</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{formatVolume(volume24h)}</Text>
            </View>
          </View>

          <Pressable
            onPress={onOpenChart}
            style={[
              styles.chartButton,
              {
                backgroundColor: withOpacity(colors.primary, 0.09),
                borderColor: withOpacity(colors.primary, 0.24),
              },
            ]}
          >
            <Ionicons name="stats-chart" size={12} color={colors.profit} />
            <Text style={[styles.chartButtonLabel, { color: colors.text }]}>Ver grafico</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pairShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pairImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  pairCopy: {
    gap: 0,
  },
  pairLabel: {
    fontFamily: FONT.bold,
    fontSize: 19,
    lineHeight: 20,
  },
  pairName: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  priceBlock: {
    flex: 1,
    gap: 4,
    maxWidth: 150,
  },
  priceValue: {
    fontFamily: FONT.bold,
    fontSize: 21,
    lineHeight: 24,
  },
  change: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  sideMeta: {
    width: 146,
    gap: 8,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaCell: {
    flex: 1,
    gap: 3,
  },
  metaLabel: {
    fontFamily: FONT.medium,
    fontSize: 9,
  },
  metaValue: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    lineHeight: 14,
  },
  chartButton: {
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  chartButtonLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
});
