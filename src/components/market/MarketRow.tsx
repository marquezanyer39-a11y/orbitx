import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { MarketPair } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { PriceChangeBadge } from './PriceChangeBadge';

interface Props {
  pair: MarketPair;
  onPress: () => void;
}

export function MarketRow({ pair, onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          borderBottomColor: withOpacity(colors.border, 0.72),
        },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.logoShell,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.76),
              borderColor: withOpacity(colors.borderStrong, 0.2),
            },
          ]}
        >
          <Image source={{ uri: pair.image }} style={styles.logo} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.symbol, { color: colors.text }]}>{pair.symbol}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            Alto {formatCurrency(pair.high24h, true)} | Bajo {formatCurrency(pair.low24h, true)}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.price, { color: colors.text }]}>{formatCurrency(pair.price)}</Text>
        <PriceChangeBadge value={pair.change24h} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoShell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: RADII.pill,
    backgroundColor: '#121217',
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  symbol: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  right: {
    alignItems: 'flex-end',
    gap: 5,
  },
  price: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
});
