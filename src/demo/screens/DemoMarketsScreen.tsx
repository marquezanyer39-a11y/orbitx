import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { DEMO_MODE_LABEL, type DemoMarketItem, QVEX_DEMO_MARKETS } from '../qvexDemoData';

interface Props {
  selectedMarketId: string;
  onSelectMarket: (marketId: string) => void;
}

export function DemoMarketsScreen({ selectedMarketId, onSelectMarket }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.demoBanner}>{DEMO_MODE_LABEL}</Text>
      <Text style={styles.title}>Mercados demo</Text>
      <Text style={styles.subtitle}>
        Pares mock con precio, variacion y volumen ilustrativo. Al tocar un activo abrimos Trade Demo local.
      </Text>

      <View style={styles.marketList}>
        {QVEX_DEMO_MARKETS.map((market) => (
          <MarketRow
            key={market.id}
            market={market}
            active={market.id === selectedMarketId}
            onPress={() => onSelectMarket(market.id)}
          />
        ))}
      </View>
    </View>
  );
}

function MarketRow({
  market,
  active,
  onPress,
}: {
  market: DemoMarketItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.marketRow, active ? styles.marketRowActive : null]}
    >
      <View style={styles.marketMain}>
        <Text style={styles.marketSymbol}>{market.symbol}</Text>
        <Text style={styles.marketName}>{market.name}</Text>
      </View>
      <Sparkline trend={market.trend} positive={market.positive} />
      <View style={styles.marketMeta}>
        <Text style={styles.marketPrice}>{market.priceLabel}</Text>
        <Text style={[styles.marketChange, market.positive ? styles.positive : styles.negative]}>
          {market.changeLabel}
        </Text>
        <Text style={styles.marketVolume}>{market.volumeLabel}</Text>
      </View>
    </Pressable>
  );
}

function Sparkline({ trend, positive }: { trend: number[]; positive: boolean }) {
  const max = Math.max(...trend);
  const min = Math.min(...trend);
  const color = positive ? '#34D399' : '#F87171';

  return (
    <View style={styles.sparkline}>
      {trend.map((point, index) => {
        const height = 18 + ((point - min) / Math.max(max - min, 1)) * 30;
        return (
          <View
            key={`${point}-${index}`}
            style={[styles.sparkBar, { height, backgroundColor: color }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  demoBanner: {
    color: '#8BD8FF',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  marketChange: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  marketList: {
    gap: 12,
  },
  marketMain: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  marketMeta: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 100,
  },
  marketName: {
    color: '#8EA0B8',
    fontFamily: FONT.regular,
    fontSize: 12,
  },
  marketPrice: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  marketRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(13,18,30,0.94)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  marketRowActive: {
    borderColor: 'rgba(0,229,255,0.28)',
  },
  marketSymbol: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  marketVolume: {
    color: '#8EA0B8',
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  negative: {
    color: '#F87171',
  },
  positive: {
    color: '#34D399',
  },
  screen: {
    gap: 18,
  },
  sparkBar: {
    borderRadius: 999,
    width: 8,
  },
  sparkline: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    height: 52,
  },
  subtitle: {
    color: '#94A2B8',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  title: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 22,
  },
});
