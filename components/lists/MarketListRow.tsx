import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { MarketToken } from '../../types';
import { formatCompactCurrency, formatPercent, formatTokenPrice } from '../../utils/format';
import { SparklineLine } from '../common/SparklineLine';
import { TokenAvatar } from '../common/TokenAvatar';

interface MarketListRowProps {
  token: MarketToken;
  onPress: () => void;
  statusLabel?: string;
  statusTone?: 'success' | 'warning' | 'muted';
}

export function MarketListRow({
  token,
  onPress,
  statusLabel,
  statusTone = 'muted',
}: MarketListRowProps) {
  const { colors } = useAppTheme();
  const positive = token.change24h >= 0;
  const hasSparkline = token.sparkline.length >= 2 && token.price > 0;
  const metaLabel = token.liquidityPoolUsd
    ? `Liq. ${formatCompactCurrency(token.liquidityPoolUsd)}`
    : `Vol. ${formatCompactCurrency(token.volume24h)}`;
  const statusColors = {
    success: {
      backgroundColor: withOpacity(colors.profit, 0.12),
      borderColor: withOpacity(colors.profit, 0.26),
      color: colors.profit,
    },
    warning: {
      backgroundColor: withOpacity(colors.loss, 0.1),
      borderColor: withOpacity(colors.loss, 0.22),
      color: colors.loss,
    },
    muted: {
      backgroundColor: colors.fieldBackground,
      borderColor: withOpacity(colors.border, 0.85),
      color: colors.textMuted,
    },
  }[statusTone];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { borderBottomColor: withOpacity(colors.border, 0.62) }]}
    >
      <View style={styles.left}>
        <TokenAvatar label={token.symbol} color={token.color} logo={token.logo} size={30} />
        <View style={styles.copy}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {token.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.symbol, { color: colors.textMuted }]} numberOfLines={1}>
              {token.symbol}
            </Text>
            {statusLabel ? (
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: statusColors.backgroundColor,
                    borderColor: statusColors.borderColor,
                  },
                ]}
              >
                <Text
                  style={[styles.statusLabel, { color: statusColors.color }]}
                  numberOfLines={1}
                >
                  {statusLabel}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
            {metaLabel}
          </Text>
        </View>
      </View>

      <View style={styles.chartSlot}>
        {hasSparkline ? (
          <SparklineLine values={token.sparkline} positive={positive} width={70} height={26} />
        ) : (
          <Text style={[styles.chartUnavailable, { color: colors.textMuted }]}>
            Precio en actualizacion
          </Text>
        )}
      </View>

      <View style={styles.right}>
        <Text style={[styles.price, { color: colors.text }]} numberOfLines={1}>
          {token.price > 0 ? formatTokenPrice(token.price) : 'En actualizacion'}
        </Text>
        <Text
          style={[styles.change, { color: positive ? colors.profit : colors.loss }]}
          numberOfLines={1}
        >
          {token.price > 0 ? formatPercent(token.change24h) : 'Mercado en actualizacion'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  name: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  symbol: {
    fontFamily: FONT.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  statusPill: {
    minHeight: 16,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    fontFamily: FONT.semibold,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chartSlot: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartUnavailable: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  right: {
    width: 84,
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  change: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
});
