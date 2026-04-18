import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { PriceChart } from '../../components/common/PriceChart';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ProfitBadge } from '../../components/common/ProfitBadge';
import { RouteRedirect } from '../../components/common/RouteRedirect';
import { Screen } from '../../components/common/Screen';
import { TokenAvatar } from '../../components/common/TokenAvatar';
import { inferTokenNetworkKey, getOrbitChainConfig } from '../../constants/networks';
import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  getEffectiveTokenLifecycleStatus,
  getLifecycleStatusLabel,
  getTokenBadges,
} from '../../services/listing/lifecycle';
import { useAuthStore } from '../../src/store/authStore';
import { buildLegacyTokenPairId } from '../../src/utils/tradePairs';
import { getTokenById } from '../../store/selectors';
import { useOrbitStore } from '../../store/useOrbitStore';
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatTokenPrice,
  formatUnits,
} from '../../utils/format';
import { maskAddress } from '../../utils/wallet';

function formatDateTime(value?: string) {
  if (!value) {
    return 'No disponible';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'No disponible';
  }

  return parsed.toLocaleString('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function openExternal(url?: string) {
  if (!url) {
    return;
  }

  void Linking.openURL(url);
}

export default function TokenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionStatus = useAuthStore((state) => state.session.status);
  const tokens = useOrbitStore((state) => state.tokens);
  const assets = useOrbitStore((state) => state.assets);
  const lastMarketSyncAt = useOrbitStore((state) => state.walletFuture.lastMarketSyncAt);
  const { colors } = useAppTheme();

  if (sessionStatus === 'signed_out') {
    return <RouteRedirect href="/" />;
  }

  const token = getTokenById(tokens, id);
  if (!token) {
    return <RouteRedirect href="/(tabs)/market" />;
  }

  const holding = assets.find((asset) => asset.tokenId === token.id)?.amount ?? 0;
  const positive = token.change24h >= 0;
  const marketReady = Boolean(lastMarketSyncAt);
  const hasChartData = marketReady && token.sparkline.length >= 2;
  const hasMarketMetrics = marketReady && token.price > 0;
  const networkKey = inferTokenNetworkKey(token);
  const networkConfig = networkKey ? getOrbitChainConfig(networkKey) : null;
  const lifecycleStatus = getEffectiveTokenLifecycleStatus(token);
  const badges = getTokenBadges(token);
  const canTradeToken =
    token.isTradeable && (!networkConfig || networkConfig.phase !== 'coming_soon');
  const tradePairId = buildLegacyTokenPairId(token);

  const transparencyRows = [
    { label: 'Red', value: token.transparency?.network ?? token.chain ?? 'OrbitX' },
    {
      label: 'Contrato',
      value: token.transparency?.contractAddress
        ? maskAddress(token.transparency.contractAddress)
        : 'No disponible',
    },
    {
      label: 'Pool',
      value: token.transparency?.poolAddress
        ? maskAddress(token.transparency.poolAddress)
        : 'No disponible',
    },
    {
      label: 'Creador',
      value: token.transparency?.creatorWallet
        ? maskAddress(token.transparency.creatorWallet)
        : 'No disponible',
    },
    {
      label: 'Liquidez',
      value: token.liquidity?.liquidityAmountUsd
        ? formatCurrency(token.liquidity.liquidityAmountUsd)
        : 'No disponible',
    },
    {
      label: 'Liquidez bloqueada',
      value: token.liquidityLock?.lockedLiquidityAmountUsd
        ? formatCurrency(token.liquidityLock.lockedLiquidityAmountUsd)
        : 'No disponible',
    },
    {
      label: 'Duracion del bloqueo',
      value: token.liquidityLock?.lockDurationDays
        ? `${token.liquidityLock.lockDurationDays} dias`
        : 'No disponible',
    },
    { label: 'Desbloquea', value: formatDateTime(token.liquidityLock?.lockEnd) },
    {
      label: 'Tx de creacion',
      value: token.transparency?.creationTxHash
        ? maskAddress(token.transparency.creationTxHash)
        : 'No disponible',
    },
    {
      label: 'Tx de bloqueo',
      value: token.transparency?.lockTxHash
        ? maskAddress(token.transparency.lockTxHash)
        : 'No disponible',
    },
  ];

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.fieldBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="chevron-back-outline" size={18} color={colors.text} />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{token.name}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {token.symbol} | {networkConfig?.label ?? 'OrbitX'}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/market')}
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.fieldBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="grid-outline" size={16} color={colors.text} />
        </Pressable>
      </View>

      <View
        style={[
          styles.hero,
          {
            backgroundColor: colors.fieldBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.heroTop}>
          <View style={styles.heroIdentity}>
            <TokenAvatar label={token.symbol} color={token.color} logo={token.logo} size={54} />
            <View style={styles.heroText}>
              <View style={styles.heroTitleRow}>
                <Text style={[styles.heroName, { color: colors.text }]}>{token.name}</Text>
                {hasMarketMetrics ? (
                  <ProfitBadge value={formatPercent(token.change24h)} positive={positive} />
                ) : (
                  <View
                    style={[
                      styles.neutralBadge,
                      { backgroundColor: withOpacity(colors.text, 0.08) },
                    ]}
                  >
                    <Text style={[styles.neutralBadgeLabel, { color: colors.textMuted }]}>
                      Mercado en actualizacion
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.heroMeta, { color: colors.textMuted }]}>
                {token.symbol} |{' '}
                {token.listingType === 'orbitx_protected'
                  ? 'Protegido'
                  : token.listingType === 'external'
                    ? 'Externo'
                    : 'Creado'}
              </Text>
            </View>
          </View>

          <View style={styles.heroRight}>
            <Text style={[styles.heroPrice, { color: colors.text }]}>
              {hasMarketMetrics ? formatTokenPrice(token.price) : 'Precio en actualizacion'}
            </Text>
            <Text style={[styles.heroMeta, { color: colors.textMuted }]}>
              En cartera: {formatUnits(holding)} {token.symbol}
            </Text>
          </View>
        </View>

        {badges.length ? (
          <View style={styles.badgesRow}>
            {badges.map((badge) => (
              <View
                key={badge}
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.backgroundAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.badgeLabel, { color: colors.text }]}>{badge}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {lifecycleStatus === 'lock_expired' || lifecycleStatus === 'high_risk' ? (
        <View
          style={[
            styles.notice,
            {
              backgroundColor: withOpacity(colors.loss, 0.08),
              borderColor: withOpacity(colors.loss, 0.18),
            },
          ]}
        >
          <Text style={[styles.noticeTitle, { color: colors.loss }]}>
            {lifecycleStatus === 'lock_expired' ? 'Bloqueo de liquidez vencido' : 'Riesgo alto'}
          </Text>
          <Text style={[styles.noticeBody, { color: colors.textSoft }]}>
            {lifecycleStatus === 'lock_expired'
              ? 'El bloqueo de liquidez termino. OrbitX mantiene visible el token, pero ya no debe verse igual de protegido que un listado activo.'
              : 'OrbitX detecto condiciones que reducen la transparencia o la proteccion actual de este token.'}
          </Text>
        </View>
      ) : null}

      {token.listingType === 'external' ? (
        <View
          style={[
            styles.notice,
            {
              backgroundColor: withOpacity(colors.warning, 0.08),
              borderColor: withOpacity(colors.warning, 0.18),
            },
          ]}
        >
          <Text style={[styles.noticeTitle, { color: colors.warning }]}>Solo listado externo</Text>
          <Text style={[styles.noticeBody, { color: colors.textSoft }]}>
            Este token se publico fuera del sistema interno de proteccion de OrbitX.
          </Text>
        </View>
      ) : null}

      <View style={styles.chartWrap}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/trade/chart',
              params: { pairId: tradePairId },
            })
          }
          style={styles.chartPressable}
        >
          <PriceChart values={hasChartData ? token.sparkline : []} positive={positive} />
          <View
            style={[
              styles.chartOpenChip,
              {
                backgroundColor: colors.fieldBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="stats-chart-outline" size={14} color={colors.text} />
            <Text style={[styles.chartOpenChipLabel, { color: colors.text }]}>
              Abrir grafico pro
            </Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        {[ 
          {
            label: 'Liquidez',
            value:
              marketReady && token.liquidityPoolUsd
                ? formatCurrency(token.liquidityPoolUsd)
                : 'No disponible',
          },
          {
            label: 'Volumen',
            value: marketReady ? formatCompactCurrency(token.volume24h) : 'Mercado en actualizacion',
          },
          {
            label: 'Cap. de mercado',
            value:
              marketReady ? formatCompactCurrency(token.marketCap) : 'Mercado en actualizacion',
          },
          { label: 'Estado', value: getLifecycleStatusLabel(lifecycleStatus) },
        ].map((item) => (
          <View
            key={item.label}
            style={[
              styles.statRow,
              { borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      {canTradeToken ? (
        <View style={styles.tradeBar}>
          <PrimaryButton
            label={`Comprar ${token.symbol}`}
            onPress={() =>
              router.push({
                pathname: '/spot',
                params: { pairId: tradePairId, side: 'buy' },
              })
            }
            style={styles.tradeAction}
          />
          <PrimaryButton
            label={`Vender ${token.symbol}`}
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/spot',
                params: { pairId: tradePairId, side: 'sell' },
              })
            }
            style={styles.tradeAction}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transparencia</Text>
        <View
          style={[
            styles.sectionShell,
            { backgroundColor: colors.fieldBackground, borderColor: colors.border },
          ]}
        >
          {transparencyRows.map((item) => (
            <View
              key={item.label}
              style={[
                styles.transparencyRow,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.transparencyLabel, { color: colors.textMuted }]}>
                {item.label}
              </Text>
              <Text style={[styles.transparencyValue, { color: colors.text }]} numberOfLines={1}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.linksRow}>
          {token.transparency?.contractExplorerUrl ? (
            <PrimaryButton
              label="Contrato"
              variant="secondary"
              onPress={() => openExternal(token.transparency?.contractExplorerUrl)}
              style={styles.linkButton}
            />
          ) : null}
          {token.transparency?.creationExplorerUrl ? (
            <PrimaryButton
              label="Tx de creacion"
              variant="ghost"
              onPress={() => openExternal(token.transparency?.creationExplorerUrl)}
              style={styles.linkButton}
            />
          ) : null}
          {token.transparency?.poolExplorerUrl ? (
            <PrimaryButton
              label="Pool"
              variant="secondary"
              onPress={() => openExternal(token.transparency?.poolExplorerUrl)}
              style={styles.linkButton}
            />
          ) : null}
          {token.transparency?.lockExplorerUrl ? (
            <PrimaryButton
              label="Tx de bloqueo"
              variant="ghost"
              onPress={() => openExternal(token.transparency?.lockExplorerUrl)}
              style={styles.linkButton}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Acerca de</Text>
        <Text style={[styles.sectionBody, { color: colors.textSoft }]}>{token.description}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  headerSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  hero: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  heroIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  heroName: {
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  heroRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  heroPrice: {
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  heroMeta: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    minHeight: 28,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  neutralBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.pill,
    alignSelf: 'flex-start',
  },
  neutralBadgeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  notice: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  noticeTitle: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  noticeBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  chartWrap: {
    gap: 10,
  },
  chartPressable: {
    gap: 10,
  },
  chartOpenChip: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartOpenChipLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  statsGrid: {
    gap: 0,
  },
  statRow: {
    minHeight: 42,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statLabel: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  statValue: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  tradeBar: {
    flexDirection: 'row',
    gap: 8,
  },
  tradeAction: {
    flex: 1,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  sectionShell: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  transparencyRow: {
    minHeight: 40,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  transparencyLabel: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  transparencyValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkButton: {
    minWidth: '47%',
  },
  sectionBody: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 19,
  },
});
