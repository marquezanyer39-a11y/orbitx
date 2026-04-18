import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { PortfolioAsset } from '../../types';
import { formatCurrency, formatPercent, formatUnits } from '../../utils/format';
import { ProfitBadge } from '../common/ProfitBadge';
import { TokenAvatar } from '../common/TokenAvatar';

interface AssetRowProps {
  asset: PortfolioAsset;
  onPress?: () => void;
}

export function AssetRow({ asset, onPress }: AssetRowProps) {
  const { colors } = useAppTheme();
  const positive = asset.pnlUsd >= 0;

  const content = (
    <View style={styles.row}>
      <View style={styles.left}>
        <TokenAvatar
          label={asset.token.symbol}
          color={asset.token.color}
          logo={asset.token.logo}
        />
        <View style={styles.textBlock}>
          <Text style={[styles.symbol, { color: colors.text }]}>{asset.token.symbol}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {formatUnits(asset.amount)} {asset.token.symbol}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.value, { color: colors.text }]}>{formatCurrency(asset.valueUsd)}</Text>
        <ProfitBadge value={formatPercent(asset.pnlPct)} positive={positive} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingVertical: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  textBlock: {
    gap: 3,
  },
  symbol: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: 13,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  value: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
});
