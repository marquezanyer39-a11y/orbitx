import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { ExternalWalletBalanceAsset } from '../../src/services/wallet/externalWalletBalances';
import { formatCurrency } from '../../src/utils/formatCurrency';

interface Web3AssetsListProps {
  assets: ExternalWalletBalanceAsset[];
  isLoading: boolean;
  discoveryEnabled: boolean;
  hasUnpricedAssets: boolean;
  onRefresh: () => void;
}

function formatAmount(amount: number) {
  if (!Number.isFinite(amount)) {
    return '0';
  }

  if (amount === 0) {
    return '0';
  }

  if (amount < 0.000001) {
    return '<0.000001';
  }

  return amount.toLocaleString('en-US', {
    maximumFractionDigits: amount < 1 ? 8 : 6,
    minimumFractionDigits: 0,
  });
}

function AssetIcon({ asset }: { asset: ExternalWalletBalanceAsset }) {
  const { colors } = useAppTheme();

  if (asset.image) {
    return <Image source={{ uri: asset.image }} style={styles.logo} />;
  }

  return (
    <View
      style={[
        styles.logo,
        {
          backgroundColor: withOpacity(asset.type === 'native' ? colors.primary : colors.text, 0.1),
          borderColor: withOpacity(colors.borderStrong, 0.32),
        },
      ]}
    >
      <Text style={[styles.logoText, { color: colors.text }]}>
        {asset.symbol.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}

export function Web3AssetsList({
  assets,
  isLoading,
  discoveryEnabled,
  hasUnpricedAssets,
  onRefresh,
}: Web3AssetsListProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]}>Mis activos Web3</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {discoveryEnabled ? 'Tokens detectados automaticamente.' : 'Mostrando tokens soportados.'}
          </Text>
        </View>
        <Pressable
          onPress={onRefresh}
          disabled={isLoading}
          style={[
            styles.refreshButton,
            {
              borderColor: withOpacity(colors.border, 0.5),
              opacity: isLoading ? 0.55 : 1,
            },
          ]}
        >
          <Text style={[styles.refreshText, { color: colors.text }]}>
            {isLoading ? 'Actualizando' : 'Actualizar'}
          </Text>
        </Pressable>
      </View>

      {assets.length ? (
        <View style={styles.list}>
          {assets.map((asset, index) => (
            <View
              key={asset.id}
              style={[
                styles.row,
                {
                  borderBottomColor:
                    index === assets.length - 1 ? 'transparent' : withOpacity(colors.border, 0.5),
                },
              ]}
            >
              <View style={styles.left}>
                <AssetIcon asset={asset} />
                <View style={styles.copy}>
                  <Text style={[styles.symbol, { color: colors.text }]}>{asset.symbol}</Text>
                  <Text style={[styles.meta, { color: colors.textMuted }]}>
                    {asset.chainLabel} · {asset.type === 'native' ? 'Nativo' : 'Token'}
                  </Text>
                </View>
              </View>
              <View style={styles.right}>
                <Text style={[styles.amount, { color: colors.text }]}>
                  {formatAmount(asset.amount)}
                </Text>
                <Text style={[styles.value, { color: colors.textMuted }]}>
                  {asset.priceAvailable ? formatCurrency(asset.usdValue) : 'Valor no disponible'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: withOpacity(colors.fieldBackground, 0.18),
              borderColor: withOpacity(colors.border, 0.48),
            },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {isLoading ? 'Buscando activos...' : 'No se encontraron activos'}
          </Text>
          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
            No se encontraron activos con balance en las redes soportadas.
          </Text>
          <Pressable
            onPress={onRefresh}
            disabled={isLoading}
            style={[
              styles.emptyAction,
              {
                backgroundColor: withOpacity(colors.primary, 0.14),
                borderColor: withOpacity(colors.primary, 0.34),
                opacity: isLoading ? 0.55 : 1,
              },
            ]}
          >
            <Text style={[styles.emptyActionText, { color: colors.primary }]}>Actualizar</Text>
          </Pressable>
        </View>
      )}

      {hasUnpricedAssets ? (
        <Text style={[styles.priceNote, { color: colors.textMuted }]}>
          Algunos tokens pueden no tener precio disponible.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
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
    minWidth: 0,
    gap: 3,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  refreshButton: {
    minHeight: 30,
    borderRadius: RADII.pill,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  refreshText: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  list: {
    gap: 0,
  },
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  copy: {
    flex: 1,
    minWidth: 0,
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
  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 7,
  },
  emptyTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  emptyBody: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  emptyAction: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: RADII.pill,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  emptyActionText: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  priceNote: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 15,
  },
});
