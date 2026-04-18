import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useI18n } from '../../hooks/useI18n';
import type { MarketToken } from '../../types';
import { formatCompactCurrency, formatPercent, formatTokenPrice } from '../../utils/format';
import { ProfitBadge } from '../common/ProfitBadge';
import { SparklineBars } from '../common/SparklineBars';
import { TokenAvatar } from '../common/TokenAvatar';

interface TokenRowProps {
  token: MarketToken;
  showActions?: boolean;
  onBuy?: () => void;
  onSell?: () => void;
  onPress?: () => void;
}

export function TokenRow({
  token,
  showActions = false,
  onBuy,
  onSell,
  onPress,
}: TokenRowProps) {
  const { t } = useI18n();
  const { colors } = useAppTheme();
  const positive = token.change24h >= 0;
  const summary =
    token.isUserCreated && token.chain
      ? `${t(`launchpad.${token.chain}`)} - ${formatCompactCurrency(token.volume24h)}`
      : `${t('common.volume')} ${formatCompactCurrency(token.volume24h)}`;

  const content = (
    <View style={[styles.row, { borderBottomColor: withOpacity(colors.border, 0.7) }]}>
      <View style={styles.left}>
        <TokenAvatar label={token.symbol} color={token.color} logo={token.logo} size={34} />
        <View style={styles.meta}>
          <View style={styles.header}>
            <Text style={[styles.symbol, { color: colors.text }]} numberOfLines={1}>
              {token.symbol}
            </Text>
            <Text style={[styles.name, { color: colors.textMuted }]} numberOfLines={1}>
              {token.name}
            </Text>
          </View>
          <Text style={[styles.caption, { color: colors.textMuted }]} numberOfLines={1}>
            {summary}
          </Text>
        </View>
      </View>

      <View style={styles.chartSlot}>
        <SparklineBars values={token.sparkline} positive={positive} />
      </View>

      <View style={styles.right}>
        <Text style={[styles.price, { color: colors.text }]} numberOfLines={1}>
          {formatTokenPrice(token.price)}
        </Text>
        <ProfitBadge value={formatPercent(token.change24h)} positive={positive} />
        {showActions && token.isTradeable ? (
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={onBuy ?? onSell}
            style={[
              styles.action,
              {
                backgroundColor: colors.fieldBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.actionLabel, { color: colors.textSoft }]}>Operar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  meta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  symbol: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    maxWidth: 72,
  },
  name: {
    fontFamily: FONT.regular,
    fontSize: 11,
    flex: 1,
  },
  caption: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  chartSlot: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    width: 82,
    alignItems: 'flex-end',
    gap: 5,
  },
  price: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  action: {
    minWidth: 52,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
  },
  actionLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
});
