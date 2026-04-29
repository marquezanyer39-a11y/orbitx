import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import type {
  ExternalWalletBalanceAsset,
  ExternalWalletBalanceStatus,
  ExternalWalletNetworkBalanceState,
} from '../../src/services/wallet/externalWalletBalances';
import { formatCurrency } from '../../src/utils/formatCurrency';

interface ExternalWalletBalanceSummaryProps {
  status: ExternalWalletBalanceStatus;
  chainLabel: string;
  nativeAsset?: ExternalWalletBalanceAsset;
  tokenAssets: ExternalWalletBalanceAsset[];
  failedTokenCount: number;
  networkStates?: ExternalWalletNetworkBalanceState[];
  message?: string;
  updatedAt?: string;
  onRefresh: () => void;
}

function formatAmount(amount: number) {
  if (!Number.isFinite(amount)) {
    return '0';
  }

  if (amount === 0) {
    return '0.000000';
  }

  if (amount < 0.000001) {
    return '<0.000001';
  }

  if (amount < 1) {
    return amount.toFixed(6);
  }

  if (amount < 10_000) {
    return amount.toLocaleString('en-US', {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0,
    });
  }

  return amount.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

function formatUpdatedAt(updatedAt?: string) {
  if (!updatedAt) {
    return '';
  }

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusCopy(status: ExternalWalletBalanceStatus, failedTokenCount: number, message?: string) {
  if (status === 'loading') {
    return 'Actualizando saldos...';
  }

  if (status === 'unsupported') {
    return 'Red no soportada para balances en OrbitX.';
  }

  if (status === 'error') {
    return message ?? 'No se pudo actualizar esta red';
  }

  if (status === 'partial' || failedTokenCount > 0) {
    return 'No se pudieron cargar todos los tokens';
  }

  if (status === 'success') {
    return 'Balance actualizado con datos publicos de la red.';
  }

  return 'Conecta una wallet externa para leer sus saldos.';
}

function AssetRow({ asset }: { asset: ExternalWalletBalanceAsset }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.assetRow}>
      <View style={styles.assetLeft}>
        <View
          style={[
            styles.assetBadge,
            {
              backgroundColor: withOpacity(asset.type === 'native' ? colors.primary : colors.text, 0.1),
              borderColor: withOpacity(asset.type === 'native' ? colors.primary : colors.borderStrong, 0.4),
            },
          ]}
        >
          <Text style={[styles.assetBadgeText, { color: colors.text }]}>
            {asset.symbol.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.assetCopy}>
          <Text style={[styles.assetSymbol, { color: colors.text }]}>{asset.symbol}</Text>
          <Text style={[styles.assetMeta, { color: colors.textMuted }]}>
            {asset.name} - {asset.chainLabel}
          </Text>
        </View>
      </View>

      <View style={styles.assetRight}>
        <Text style={[styles.assetAmount, { color: colors.text }]}>
          {formatAmount(asset.amount)}
        </Text>
        <Text style={[styles.assetValue, { color: colors.textMuted }]}>
          {asset.priceAvailable ? formatCurrency(asset.usdValue) : 'Valor no disponible'}
        </Text>
      </View>
    </View>
  );
}

export function ExternalWalletBalanceSummary({
  status,
  chainLabel,
  nativeAsset,
  tokenAssets,
  failedTokenCount,
  networkStates = [],
  message,
  updatedAt,
  onRefresh,
}: ExternalWalletBalanceSummaryProps) {
  const { colors } = useAppTheme();
  const updatedAtLabel = formatUpdatedAt(updatedAt);
  const isLoading = status === 'loading';
  const hasAssets = Boolean(nativeAsset || tokenAssets.length);
  const stateTone =
    status === 'error' || status === 'unsupported'
      ? colors.loss
      : status === 'partial'
        ? colors.warning
        : colors.profit;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.fieldBackground, 0.18),
          borderColor: withOpacity(colors.border, 0.46),
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]}>Saldos WalletConnect</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Red actual: {chainLabel}
          </Text>
        </View>

        <Pressable
          onPress={onRefresh}
          disabled={isLoading}
          style={[
            styles.refreshButton,
            {
              backgroundColor: withOpacity(colors.primary, isLoading ? 0.06 : 0.14),
              borderColor: withOpacity(colors.primary, isLoading ? 0.12 : 0.3),
              opacity: isLoading ? 0.55 : 1,
            },
          ]}
        >
          <Text style={[styles.refreshText, { color: colors.primary }]}>
            {isLoading ? 'Actualizando' : 'Reintentar'}
          </Text>
        </Pressable>
      </View>

      {networkStates.length ? (
        <View style={styles.networkGrid}>
          {networkStates.map((network) => {
            const tone =
              network.status === 'error' || network.status === 'unsupported'
                ? colors.loss
                : network.status === 'partial'
                  ? colors.warning
                  : colors.profit;

            return (
              <View
                key={network.chainId}
                style={[
                  styles.networkChip,
                  {
                    backgroundColor: withOpacity(tone, 0.08),
                    borderColor: withOpacity(tone, 0.24),
                  },
                ]}
              >
                <Text style={[styles.networkLabel, { color: colors.text }]}>
                  {network.chainLabel === 'BNB Chain' ? 'BNB' : network.chainLabel}
                </Text>
                <Text style={[styles.networkState, { color: tone }]}>
                  {network.status === 'error'
                    ? 'Error'
                    : network.status === 'partial'
                      ? 'Parcial'
                      : `${network.visibleAssetCount} activos`}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      <View
        style={[
          styles.statePill,
          {
            backgroundColor: withOpacity(stateTone, 0.08),
            borderColor: withOpacity(stateTone, 0.24),
          },
        ]}
      >
        <Text style={[styles.stateText, { color: stateTone }]}>
          {statusCopy(status, failedTokenCount, message)}
        </Text>
      </View>

      {nativeAsset ? (
        <View style={styles.nativeBlock}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Balance nativo</Text>
          <AssetRow asset={nativeAsset} />
        </View>
      ) : null}

      {tokenAssets.length ? (
        <View style={styles.tokenBlock}>
          <View style={styles.tokenHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Tokens soportados</Text>
            {updatedAtLabel ? (
              <Text style={[styles.updatedAt, { color: colors.textMuted }]}>
                {updatedAtLabel}
              </Text>
            ) : null}
          </View>
          {tokenAssets.map((asset) => (
            <AssetRow key={asset.id} asset={asset} />
          ))}
        </View>
      ) : hasAssets || status === 'loading' ? null : (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No hay tokens soportados detectados en esta red.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
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
    gap: 2,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  refreshButton: {
    minHeight: 30,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  refreshText: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  statePill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  stateText: {
    fontFamily: FONT.medium,
    fontSize: 10,
    lineHeight: 14,
  },
  nativeBlock: {
    gap: 4,
  },
  tokenBlock: {
    gap: 4,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  networkChip: {
    minHeight: 34,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
    gap: 1,
  },
  networkLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  networkState: {
    fontFamily: FONT.medium,
    fontSize: 9,
  },
  sectionLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  updatedAt: {
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  assetRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  assetLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  assetBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  assetCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  assetSymbol: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  assetMeta: {
    fontFamily: FONT.regular,
    fontSize: 9,
  },
  assetRight: {
    alignItems: 'flex-end',
    gap: 1,
  },
  assetAmount: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  assetValue: {
    fontFamily: FONT.regular,
    fontSize: 9,
  },
  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 15,
  },
});
