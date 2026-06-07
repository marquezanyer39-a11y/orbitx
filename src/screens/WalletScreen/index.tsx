import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { ExternalWalletConnectSheet } from '../../../components/wallet/ExternalWalletConnectSheet';
import { FONT, ORBITX_COLORS, RADII, withOpacity } from '../../../constants/theme';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FEATURE_STATUS } from '../../constants/featureStatus';
import {
  QVEX_STABLE_APK_MODE,
  SAFE_MODE_BLOCK_MESSAGE,
  SAFE_MODE_READONLY_MESSAGE,
} from '../../config/runtimeMode';
import { useExternalWallet } from '../../hooks/useExternalWallet';
import { useExternalWalletBalances } from '../../hooks/useExternalWalletBalances';
import { useMarketData } from '../../hooks/useMarketData';
import { useWallet } from '../../hooks/useWallet';
import { useUiStore } from '../../store/uiStore';
import { getPortfolioDistribution, getTotalPortfolioBalanceUsd } from '../../utils/portfolioTotals';

const COLORS = {
  ...ORBITX_COLORS,
  text: ORBITX_COLORS.textPrimary,
  textSecondary: ORBITX_COLORS.textSecondary,
  textMuted: ORBITX_COLORS.textMuted,
  greenBright: ORBITX_COLORS.green,
  blue: ORBITX_COLORS.web3Blue,
  amber: ORBITX_COLORS.warning,
};

const QUICK_ACTIONS = [
  { key: 'deposit', label: 'Depositar', icon: 'download-outline' as const, route: '/wallet-local' },
  { key: 'receive', label: 'Recibir', icon: 'arrow-down-outline' as const, route: '/wallet-web3' },
  { key: 'send', label: 'Enviar', icon: 'arrow-up-outline' as const, route: '/send' },
  { key: 'withdraw', label: 'Retirar', icon: 'share-outline' as const, route: '/wallet-local' },
  { key: 'transfer', label: 'Transferir', icon: 'swap-horizontal-outline' as const, route: '/convert' },
] as const;

type WalletActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  tone: 'positive' | 'negative' | 'neutral';
  icon: keyof typeof Ionicons.glyphMap;
};

const FALLBACK_ACTIVITY: WalletActivityItem[] = [
  {
    id: 'deposit-pen',
    title: 'Ejemplo demo: Depósito PEN',
    subtitle: 'Vista de ejemplo, no historial real',
    value: '+ S/ 1,200.00',
    tone: 'positive' as const,
    icon: 'wallet-outline' as const,
  },
  {
    id: 'buy-btc',
    title: 'Ejemplo demo: Compra BTC',
    subtitle: 'Vista de ejemplo, no historial real',
    value: '- USD 350.00',
    tone: 'negative' as const,
    icon: 'logo-bitcoin' as const,
  },
  {
    id: 'web3-transfer',
    title: 'Ejemplo demo: Transferencia Web3',
    subtitle: 'Vista de ejemplo, no historial real',
    value: '0.15 SOL',
    tone: 'neutral' as const,
    icon: 'swap-horizontal-outline' as const,
  },
  {
    id: 'service-payment',
    title: 'Ejemplo demo: Pago de Servicio',
    subtitle: 'Vista de ejemplo, no historial real',
    value: '- S/ 120.50',
    tone: 'negative' as const,
    icon: 'receipt-outline' as const,
  },
];

function formatUsd(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return `USD ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue)}`;
}

function formatPEN(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return `S/ ${new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue)}`;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 100);
}

function MiniBalanceChart() {
  const segments = [
    { width: 42, rotate: '-7deg', top: 50, left: 4 },
    { width: 44, rotate: '4deg', top: 47, left: 42 },
    { width: 50, rotate: '-13deg', top: 42, left: 82 },
    { width: 48, rotate: '17deg', top: 36, left: 126 },
    { width: 52, rotate: '20deg', top: 45, left: 168 },
    { width: 58, rotate: '-22deg', top: 39, left: 210 },
    { width: 52, rotate: '-30deg', top: 27, left: 262 },
  ];

  return (
    <View pointerEvents="none" style={styles.chartStage}>
      <View style={styles.chartGridLineTop} />
      <View style={styles.chartGridLineBottom} />
      {segments.map((segment, index) => (
        <View key={`${segment.left}-${segment.top}`} style={styles.chartSegmentGroup}>
          <View
            style={[
              styles.chartLineGlow,
              {
                left: segment.left,
                top: segment.top - 1,
                width: segment.width,
                opacity: index > 4 ? 0.3 : 0.2,
                transform: [{ rotate: segment.rotate }],
              },
            ]}
          />
          <View
            style={[
              styles.chartLine,
              {
                left: segment.left,
                top: segment.top,
                width: segment.width,
                opacity: index > 4 ? 0.95 : 0.76,
                transform: [{ rotate: segment.rotate }],
              },
            ]}
          />
        </View>
      ))}
      <View style={styles.chartEndpoint} />
    </View>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Billetera</Text>
    </View>
  );
}

function DistributionLegend({
  spotPercent,
  localPercent,
  web3Percent,
}: {
  spotPercent: number;
  localPercent: number;
  web3Percent: number;
}) {
  return (
    <View style={styles.distributionBlock}>
      <Text style={styles.distributionTitle}>Distribución</Text>
      <View style={styles.distributionBar}>
        <View style={[styles.distributionFill, { width: `${spotPercent}%`, backgroundColor: COLORS.purple }]} />
        <View style={[styles.distributionFill, { width: `${localPercent}%`, backgroundColor: COLORS.green }]} />
        <View style={[styles.distributionFill, { width: `${web3Percent}%`, backgroundColor: COLORS.blue }]} />
      </View>
      <View style={styles.legendRow}>
        <LegendItem color={COLORS.purple} label={`Spot ${spotPercent.toFixed(1)}%`} />
        <LegendItem color={COLORS.green} label={`Cuenta Local ${localPercent.toFixed(1)}%`} />
        <LegendItem color={COLORS.blue} label={`Web3 ${web3Percent.toFixed(1)}%`} />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function QuickActions({ onBlockedAction }: { onBlockedAction: () => void }) {
  return (
    <View style={styles.quickActions}>
      {QUICK_ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          onPress={onBlockedAction}
          style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
        >
          <View style={styles.quickIconWrap}>
            <Ionicons name={action.icon} size={22} color={COLORS.purple} />
          </View>
          <Text style={styles.quickLabel} numberOfLines={1}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SummaryCard({
  title,
  value,
  change,
  body,
  icon,
  color,
  badge,
  onPress,
}: {
  title: string;
  value: string;
  change?: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.summaryCard, pressed && styles.pressed]}>
      {badge ? (
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <View style={[styles.summaryIconWrap, { backgroundColor: withOpacity(color, 0.16) }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.summaryTitle} numberOfLines={2}>{title}</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
      {change ? <Text style={styles.summaryChange}>{change}</Text> : null}
      <Text style={styles.summaryBody} numberOfLines={2}>{body}</Text>
    </Pressable>
  );
}

function ActivityRow({ item }: { item: WalletActivityItem }) {
  const toneColor =
    item.tone === 'positive'
      ? COLORS.greenBright
      : item.tone === 'negative'
        ? COLORS.red
        : COLORS.text;

  return (
    <Pressable style={({ pressed }) => [styles.activityRow, pressed && styles.pressed]}>
      <View style={[styles.activityIcon, { backgroundColor: withOpacity(toneColor, 0.14) }]}>
        <Ionicons name={item.icon} size={19} color={toneColor} />
      </View>
      <View style={styles.activityCopy}>
        <Text style={styles.activityTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.activitySubtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>
      <Text style={[styles.activityValue, { color: toneColor }]} numberOfLines={1}>
        {item.value}
      </Text>
    </Pressable>
  );
}

export default function WalletScreen() {
  const { width } = useWindowDimensions();
  const wallet = useWallet();
  const showToast = useUiStore((state) => state.showToast);
  const externalWalletRuntime = useExternalWallet();
  const { markets } = useMarketData('markets');
  const [connectSheetVisible, setConnectSheetVisible] = useState(false);

  const externalWalletAddress =
    externalWalletRuntime.address?.trim() || wallet.externalWallet.address?.trim() || '';
  const externalWalletChainId = externalWalletRuntime.chainId ?? wallet.externalWallet.chainId;
  const externalWalletBalances = useExternalWalletBalances({
    address: externalWalletAddress,
    chainId: externalWalletChainId,
    enabled: Boolean(externalWalletAddress),
  });

  useEffect(() => {
    wallet.syncCreatedTokens();
    void wallet.refreshSecurityStatus();
  }, [wallet.refreshSecurityStatus, wallet.syncCreatedTokens]);

  const spotAssets = useMemo(() => {
    const marketMap = new Map(markets.map((item) => [item.baseSymbol.toUpperCase(), item]));

    return wallet.spotBalances.map((balance) => {
      const market = marketMap.get(balance.symbol);
      const price = balance.symbol === 'USDT' || balance.symbol === 'USDC' ? 1 : market?.price ?? 0;

      return {
        symbol: balance.symbol,
        amount: balance.amount,
        usdValue: balance.amount * price,
      };
    });
  }, [markets, wallet.spotBalances]);

  const demoSpotTotal = spotAssets.reduce((sum, asset) => sum + asset.usdValue, 0);
  const totalSpot = FEATURE_STATUS.trade.isDemoMode ? 0 : demoSpotTotal;
  const totalLocal = 0;
  const totalLocalWalletWeb3 = wallet.assets.reduce((sum, asset) => sum + asset.usdValue, 0);
  const totalExternalWeb3 = externalWalletAddress ? externalWalletBalances.totalUsdEstimate : 0;
  const totalWeb3 = totalLocalWalletWeb3 + totalExternalWeb3;
  const hasCombinedWeb3Sources = totalLocalWalletWeb3 > 0 && totalExternalWeb3 > 0;
  const totalBalance = getTotalPortfolioBalanceUsd({
    spotBalanceUsd: totalSpot,
    localAccountBalanceUsd: totalLocal,
    web3BalanceUsd: totalWeb3,
  });
  const distribution = getPortfolioDistribution({
    spotBalanceUsd: totalSpot,
    localAccountBalanceUsd: totalLocal,
    web3BalanceUsd: totalWeb3,
  });

  const spotPercent = clampPercent(distribution.spotPercent);
  const localPercent = clampPercent(distribution.localPercent);
  const web3Percent = clampPercent(distribution.web3Percent);
  const penEstimate = totalBalance * 3.755;
  const isSmallPhone = width < 380;
  const safeModeActive = QVEX_STABLE_APK_MODE;

  function showBlockedAction() {
    showToast(SAFE_MODE_BLOCK_MESSAGE, 'info');
  }

  const activityRows = useMemo(() => {
    if (!wallet.history.length) {
      return FEATURE_STATUS.web3.showDemoActivity ? FALLBACK_ACTIVITY : [];
    }

    return wallet.history.slice(0, 4).map<WalletActivityItem>((entry, index) => ({
      id: entry.id,
      title: entry.title,
      subtitle: entry.body,
      value: index === 0 ? 'Actualizado' : '',
      tone: 'neutral' as const,
      icon: 'receipt-outline' as const,
    }));
  }, [wallet.history]);

  return (
    <ScreenContainer
      backgroundMode="plain"
      contentContainerStyle={[styles.content, isSmallPhone && styles.contentSmall]}
    >
      <Header />

      {safeModeActive ? (
        <View style={styles.safeModeBanner}>
          <Text style={styles.safeModeBannerText}>{SAFE_MODE_READONLY_MESSAGE}</Text>
        </View>
      ) : null}

      <LinearGradient
        colors={[COLORS.surfaceSoft, COLORS.surface, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroGlow} pointerEvents="none" />
        <View style={styles.heroHeader}>
          <View>
            <View style={styles.balanceLabelRow}>
              <Text style={styles.heroLabel}>
                {hasCombinedWeb3Sources ? 'Total estimado combinado' : 'Saldo total estimado'}
              </Text>
              <Ionicons name="eye-outline" size={16} color={COLORS.textSecondary} />
            </View>
            <Text style={[styles.heroValue, isSmallPhone && styles.heroValueSmall]} numberOfLines={1}>
              {formatUsd(totalBalance)}
            </Text>
            <View style={styles.heroMetaRow}>
              <Text style={styles.heroPen}>≈ {formatPEN(penEstimate)}</Text>
              <Text style={styles.heroHint}>Sin variacion disponible</Text>
            </View>
          </View>
        </View>

        <MiniBalanceChart />

        <DistributionLegend
          spotPercent={spotPercent}
          localPercent={localPercent}
          web3Percent={web3Percent}
        />
      </LinearGradient>

      <QuickActions onBlockedAction={showBlockedAction} />

      <View style={styles.summaryGrid}>
        <SummaryCard
          title="Spot"
          value={FEATURE_STATUS.trade.isDemoMode ? 'Modo demo' : formatUsd(totalSpot)}
          change={undefined}
          body={FEATURE_STATUS.trade.isDemoMode ? 'Órdenes simuladas, no fondos reales' : 'Trading y compra/venta'}
          icon="repeat-outline"
          color={COLORS.purple}
          onPress={showBlockedAction}
        />
        <SummaryCard
          title="Cuenta Local"
          value="Sin crear"
          change={undefined}
          body="Pagos y transferencias"
          icon="business-outline"
          color={COLORS.green}
          badge="Más usado"
          onPress={showBlockedAction}
        />
        <SummaryCard
          title="Web3"
          value={
            externalWalletBalances.isLoading && totalWeb3 === 0
              ? 'Actualizando'
              : formatUsd(totalWeb3)
          }
          change={undefined}
          body={externalWalletAddress ? 'Activos on-chain y dApps' : 'Conectar billetera externa'}
          icon="cube-outline"
          color={COLORS.blue}
          onPress={showBlockedAction}
        />
      </View>

      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          <Pressable onPress={showBlockedAction} hitSlop={8}>
            <Text style={styles.seeAllText}>Ver todo</Text>
          </Pressable>
        </View>

        <View style={styles.activityList}>
          {activityRows.length ? (
            activityRows.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))
          ) : (
            <Text style={styles.emptyActivityText}>
              Sin actividad real confirmada. Las vistas demo estan ocultas por seguridad.
            </Text>
          )}
        </View>
      </View>

      <ExternalWalletConnectSheet
        visible={connectSheetVisible}
        onClose={() => setConnectSheetVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 132,
    gap: 16,
    backgroundColor: COLORS.background,
  },
  contentSmall: {
    paddingHorizontal: 12,
    gap: 14,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  header: {
    minHeight: 42,
    justifyContent: 'center',
  },
  safeModeBanner: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: withOpacity(COLORS.amber, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.amber, 0.3),
  },
  safeModeBannerText: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  hero: {
    width: '100%',
    minHeight: 246,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.075),
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    right: -18,
    top: 52,
    width: 180,
    height: 2,
    borderRadius: 2,
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.14),
    transform: [{ rotate: '-18deg' }],
  },
  heroHeader: {
    zIndex: 2,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  heroValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.9,
    marginTop: 5,
  },
  heroValueSmall: {
    fontSize: 33,
    lineHeight: 39,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 9,
    marginTop: 5,
  },
  heroPen: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  heroHint: {
    color: COLORS.textSecondary,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  chartStage: {
    height: 72,
    marginTop: 10,
    overflow: 'hidden',
  },
  chartGridLineTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 25,
    height: 1,
    backgroundColor: withOpacity('#FFFFFF', 0.045),
  },
  chartGridLineBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 15,
    height: 1,
    backgroundColor: withOpacity('#FFFFFF', 0.035),
  },
  chartSegmentGroup: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  chartLineGlow: {
    position: 'absolute',
    height: 6,
    borderRadius: 2,
    backgroundColor: COLORS.purpleSoft,
    shadowColor: COLORS.purpleSoft,
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.purpleSoft,
  },
  chartEndpoint: {
    position: 'absolute',
    right: 2,
    top: 23,
    width: 20,
    height: 2,
    borderRadius: 2,
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.78),
    shadowColor: COLORS.purpleSoft,
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  distributionBlock: {
    marginTop: 10,
    gap: 8,
  },
  distributionTitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  distributionBar: {
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: withOpacity('#FFFFFF', 0.1),
  },
  distributionFill: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    rowGap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  legendDot: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  legendText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 11.5,
  },
  quickActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  quickIconWrap: {
    width: 48,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.surface, 0.72),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.semibold,
    fontSize: 12.5,
  },
  summaryGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minHeight: 156,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 5,
    overflow: 'visible',
  },
  summaryBadge: {
    position: 'absolute',
    top: -11,
    alignSelf: 'center',
    minHeight: 22,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.green, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.green, 0.35),
    zIndex: 2,
  },
  summaryBadgeText: {
    color: COLORS.greenBright,
    fontFamily: FONT.bold,
    fontSize: 10,
  },
  summaryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 16,
    lineHeight: 21,
  },
  summaryValue: {
    color: COLORS.text,
    fontFamily: FONT.semibold,
    fontSize: 12.5,
    lineHeight: 17,
  },
  summaryChange: {
    color: COLORS.greenBright,
    fontFamily: FONT.bold,
    fontSize: 11.5,
  },
  summaryBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 'auto',
  },
  activitySection: {
    width: '100%',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 22,
    lineHeight: 27,
  },
  seeAllText: {
    color: COLORS.purple,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  activityList: {
    gap: 10,
  },
  emptyActivityText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  activityRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 4,
  },
  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  activityTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15.5,
    lineHeight: 20,
  },
  activitySubtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12.5,
    lineHeight: 17,
  },
  activityValue: {
    maxWidth: '38%',
    color: COLORS.text,
    fontFamily: FONT.medium,
    fontSize: 13.5,
    lineHeight: 18,
    textAlign: 'right',
  },
});
