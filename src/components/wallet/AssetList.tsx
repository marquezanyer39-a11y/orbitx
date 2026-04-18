import { Image, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { WalletAsset } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { EmptyState } from '../common/EmptyState';

interface Props {
  assets: WalletAsset[];
}

export function AssetList({ assets }: Props) {
  const { colors } = useAppTheme();

  if (!assets.length) {
    return (
      <EmptyState
        title="Aun no tienes activos en esta cuenta"
        body="Conecta o crea tu billetera para comenzar."
      />
    );
  }

  return (
    <View>
      {assets.map((asset, index) => (
        <View
          key={asset.id}
          style={[
            styles.row,
            {
              borderBottomColor:
                index === assets.length - 1 ? 'transparent' : withOpacity(colors.border, 0.7),
            },
          ]}
        >
          <View style={styles.left}>
            {asset.image ? (
              <Image source={{ uri: asset.image }} style={styles.logo} />
            ) : (
              <View style={[styles.logo, { backgroundColor: colors.fieldBackground }]} />
            )}
            <View style={styles.copy}>
              <Text style={[styles.symbol, { color: colors.text }]}>{asset.symbol}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {asset.name} - {asset.environment === 'spot' ? 'Spot' : asset.network}
              </Text>
            </View>
          </View>
          <View style={styles.right}>
            <Text style={[styles.amount, { color: colors.text }]}>{asset.amount.toFixed(6)}</Text>
            <Text style={[styles.value, { color: colors.textMuted }]}>{formatCurrency(asset.usdValue)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  symbol: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  value: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
});
