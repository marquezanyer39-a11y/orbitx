import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, ORBITX_COLORS, RADII, withOpacity } from '../../../constants/theme';
import { FEATURE_STATUS } from '../../constants/featureStatus';
import { useMarketData } from '../../hooks/useMarketData';
import { useWallet } from '../../hooks/useWallet';

const COLORS = {
  ...ORBITX_COLORS,
  text: ORBITX_COLORS.textPrimary,
  textSecondary: ORBITX_COLORS.textSecondary,
  textMuted: ORBITX_COLORS.textMuted,
  greenBright: ORBITX_COLORS.green,
  amber: ORBITX_COLORS.warning,
  blue: ORBITX_COLORS.web3Blue,
};

const SPOT_ACTIONS = [
  { key: 'deposit', label: 'Depositar', icon: 'download-outline' as const, route: '/receive' },
  { key: 'withdraw', label: 'Retirar', icon: 'share-outline' as const, route: '/send' },
  { key: 'transfer', label: 'Transferir', icon: 'swap-horizontal-outline' as const, route: '/convert' },
  { key: 'buy', label: 'Comprar', icon: 'cart-outline' as const, route: '/spot' },
  { key: 'convert', label: 'Convertir', icon: 'sync-outline' as const, route: '/convert' },
] as const;

const FILTERS = ['Todos', 'Favoritos', 'Mayor valor'] as const;
type SpotFilter = (typeof FILTERS)[number];

type SpotAssetRow = {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type ActivityRow = {
  id: string;
  title: string;
  date: string;
  amount: string;
  status: 'Completado' | 'Pendiente' | 'Demo';
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'positive' | 'negative' | 'neutral';
  isDemo?: boolean;
};

const FALLBACK_ASSETS: SpotAssetRow[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0,
    usdValue: 0,
    change24h: 2.4,
    color: COLORS.amber,
    icon: 'logo-bitcoin',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 0,
    usdValue: 0,
    change24h: 1.8,
    color: COLORS.blue,
    icon: 'diamond-outline',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    balance: 0,
    usdValue: 0,
    change24h: -0.5,
    color: COLORS.green,
    icon: 'analytics-outline',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    balance: 0,
    usdValue: 0,
    change24h: 0,
    color: COLORS.greenBright,
    icon: 'logo-usd',
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    balance: 0,
    usdValue: 0,
    change24h: -0.2,
    color: COLORS.textSecondary,
    icon: 'close-outline',
  },
];

const FALLBACK_ACTIVITY: ActivityRow[] = [
  {
    id: 'buy-btc',
    title: 'Vista de ejemplo: Compra BTC',
    date: 'Ejemplo demo, sin actividad real',
    amount: 'Ejemplo +0.0012 BTC',
    status: 'Demo',
    icon: 'bag-outline',
    tone: 'positive',
    isDemo: true,
  },
  {
    id: 'deposit-usdt',
    title: 'Vista de ejemplo: Depósito USDT',
    date: 'Ejemplo demo, sin actividad real',
    amount: 'Ejemplo +150.00 USDT',
    status: 'Demo',
    icon: 'arrow-down-outline',
    tone: 'positive',
    isDemo: true,
  },
  {
    id: 'withdraw-sol',
    title: 'Vista de ejemplo: Retiro SOL',
    date: 'Ejemplo demo, sin actividad real',
    amount: 'Ejemplo -2.50 SOL',
    status: 'Demo',
    icon: 'arrow-up-outline',
    tone: 'negative',
    isDemo: true,
  },
];

function formatUsd(value: number) {
  return `USD ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)}`;
}

function formatCrypto(value: number, symbol: string) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const digits = symbol === 'USDT' || symbol === 'USDC' ? 2 : symbol === 'SOL' ? 4 : 8;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(safeValue);
}

function formatChange(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(value === 0 ? 1 : 1)}%`;
}

function goBackToWallet() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace('/wallet');
}

function Header({ onRefresh }: { onRefresh: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={goBackToWallet} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </Pressable>

      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Billetera Spot</Text>
        <Text style={styles.headerSubtitle}>
          {FEATURE_STATUS.trade.isDemoMode ? 'Módulo spot en modo demo' : 'Fondos disponibles para operar'}
        </Text>
      </View>

      <Pressable onPress={onRefresh} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="refresh-outline" size={22} color={COLORS.purpleSoft} />
      </Pressable>
    </View>
  );
}

function SpotBalanceHero({ total }: { total: number }) {
  return (
    <LinearGradient
      colors={[COLORS.surfaceSoft, COLORS.surface, COLORS.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroGlow} pointerEvents="none" />
      <Text style={styles.heroEyebrow}>
        {FEATURE_STATUS.trade.isDemoMode ? 'VALOR DEMO NO REAL' : 'VALOR TOTAL ESTIMADO'}
      </Text>
      <View style={styles.heroValueRow}>
        <Text style={styles.heroCurrency}>$</Text>
        <Text style={styles.heroValue} numberOfLines={1}>
          {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(total)}
        </Text>
        <Ionicons name="eye-outline" size={19} color={COLORS.textMuted} />
      </View>
      <View style={styles.operativeBadge}>
        <View style={styles.operativeDot} />
        <Text style={styles.operativeText}>
          {FEATURE_STATUS.trade.isDemoMode ? 'MODO DEMO' : 'OPERATIVO'}
        </Text>
      </View>
      <Text style={styles.updatedText}>
        {FEATURE_STATUS.trade.isDemoMode ? 'No representa fondos reales' : 'Actualizado hace un momento'}
      </Text>
    </LinearGradient>
  );
}

function QuickActions() {
  return (
    <View style={styles.quickActions}>
      {SPOT_ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          onPress={() => router.push(action.route as never)}
          style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
        >
          <View style={styles.quickIcon}>
            <Ionicons name={action.icon} size={22} color={COLORS.text} />
          </View>
          <Text style={styles.quickLabel} numberOfLines={1}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function SpotDemoNotice() {
  return (
    <View style={styles.demoNotice}>
      <Ionicons name="warning-outline" size={18} color={COLORS.warning} />
      <Text style={styles.demoNoticeText}>{FEATURE_STATUS.trade.notice}</Text>
    </View>
  );
}

function SpotSummaryStrip({ total }: { total: number }) {
  return (
    <View style={styles.summaryStrip}>
      <SummaryMetric label="Disponible" value={formatUsd(total)} />
      <View style={styles.summaryDivider} />
      <SummaryMetric label="En órdenes" value="USD 0.00" />
      <View style={styles.summaryDivider} />
      <SummaryMetric
        label="Estado"
        value={FEATURE_STATUS.trade.isDemoMode ? 'Demo' : '+0.00%'}
        valueColor={FEATURE_STATUS.trade.isDemoMode ? COLORS.warning : COLORS.greenBright}
      />
    </View>
  );
}

function SummaryMetric({
  label,
  value,
  valueColor = COLORS.text,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.summaryMetric}>
      <Text style={styles.summaryLabel} numberOfLines={1}>{label}</Text>
      <Text style={[styles.summaryValue, { color: valueColor }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function AssetRow({ asset }: { asset: SpotAssetRow }) {
  const positive = asset.change24h > 0;
  const negative = asset.change24h < 0;
  const changeColor = positive ? COLORS.greenBright : negative ? COLORS.red : COLORS.textMuted;

  return (
    <Pressable style={({ pressed }) => [styles.assetRow, pressed && styles.pressed]}>
      <View style={[styles.assetIcon, { backgroundColor: withOpacity(asset.color, 0.14) }]}>
        <Ionicons name={asset.icon} size={22} color={asset.color} />
      </View>

      <View style={styles.assetCopy}>
        <Text style={styles.assetSymbol} numberOfLines={1}>{asset.symbol}</Text>
        <Text style={styles.assetName} numberOfLines={1}>{asset.name}</Text>
      </View>

      <View style={styles.assetNumbers}>
        <Text style={styles.assetBalance} numberOfLines={1}>
          {formatCrypto(asset.balance, asset.symbol)}
        </Text>
        <View style={styles.assetUsdRow}>
          <Text style={styles.assetUsd} numberOfLines={1}>≈ ${asset.usdValue.toFixed(2)}</Text>
          <View style={[styles.changeChip, { backgroundColor: withOpacity(changeColor, 0.14) }]}>
            <Text style={[styles.changeText, { color: changeColor }]}>{formatChange(asset.change24h)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function ActivityItem({ item }: { item: ActivityRow }) {
  const toneColor =
    item.isDemo
      ? COLORS.warning
      : item.tone === 'positive'
        ? COLORS.greenBright
        : item.tone === 'negative'
          ? COLORS.red
          : COLORS.text;

  return (
    <Pressable style={({ pressed }) => [styles.activityItem, pressed && styles.pressed]}>
      <View style={[styles.activityIcon, { backgroundColor: withOpacity(COLORS.purple, 0.16) }]}>
        <Ionicons name={item.icon} size={20} color={COLORS.purpleSoft} />
      </View>

      <View style={styles.activityCopy}>
        <View style={styles.activityTitleRow}>
          <Text style={styles.activityTitle} numberOfLines={1}>{item.title}</Text>
          {item.isDemo ? <Text style={styles.demoActivityBadge}>Demo</Text> : null}
        </View>
        <Text style={styles.activityDate} numberOfLines={1}>{item.date}</Text>
      </View>

      <View style={styles.activityRight}>
        <Text style={styles.activityAmount} numberOfLines={1}>{item.amount}</Text>
        <Text style={[styles.activityStatus, { color: toneColor }]} numberOfLines={1}>{item.status}</Text>
      </View>
    </Pressable>
  );
}

function ActivityEmptyState() {
  return (
    <View style={styles.activityEmptyState}>
      <Ionicons name="receipt-outline" size={22} color={COLORS.textMuted} />
      <View style={styles.activityEmptyCopy}>
        <Text style={styles.activityEmptyTitle}>Aún no tienes actividad real</Text>
        <Text style={styles.activityEmptyBody}>Cuando realices operaciones, aparecerán aquí.</Text>
      </View>
    </View>
  );
}

export default function SpotWalletScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wallet = useWallet();
  const { markets } = useMarketData('markets');
  const [activeFilter, setActiveFilter] = useState<SpotFilter>('Todos');
  const isSmallPhone = width < 380;

  useEffect(() => {
    wallet.syncCreatedTokens();
  }, [wallet.syncCreatedTokens]);

  const spotAssets = useMemo(() => {
    const marketMap = new Map(markets.map((item) => [item.baseSymbol.toUpperCase(), item]));
    const balanceMap = FEATURE_STATUS.trade.isDemoMode
      ? new Map<string, number>()
      : new Map(wallet.spotBalances.map((item) => [item.symbol.toUpperCase(), item.amount]));

    const rows = FALLBACK_ASSETS.map((asset) => {
      const market = marketMap.get(asset.symbol);
      const balance = balanceMap.get(asset.symbol) ?? asset.balance;
      const price = asset.symbol === 'USDT' ? 1 : market?.price ?? 0;

      return {
        ...asset,
        name: market?.coin.name ?? asset.name,
        balance,
        usdValue: balance * price,
        change24h: market?.change24h ?? asset.change24h,
      };
    });

    if (activeFilter === 'Mayor valor') {
      return rows.slice().sort((a, b) => b.usdValue - a.usdValue);
    }

    if (activeFilter === 'Favoritos') {
      return rows.filter((asset) => asset.symbol === 'BTC' || asset.symbol === 'ETH' || asset.symbol === 'USDT');
    }

    return rows;
  }, [activeFilter, markets, wallet.spotBalances]);

  const totalSpot = spotAssets.reduce((sum, asset) => sum + asset.usdValue, 0);

  const activityRows = useMemo<ActivityRow[]>(() => {
    const spotHistory = wallet.history
      .filter((entry) => /spot|btc|usdt|compra|deposito|retiro|transfer/i.test(`${entry.title} ${entry.body}`))
      .slice(0, 2)
      .map<ActivityRow>((entry, index) => ({
        id: entry.id,
        title: entry.title,
        date: entry.body,
        amount: index === 0 ? 'Completado' : '',
        status: 'Completado',
        icon: 'receipt-outline',
        tone: 'neutral',
      }));

    if (spotHistory.length) return spotHistory;

    return FEATURE_STATUS.web3.showDemoActivity ? FALLBACK_ACTIVITY.slice(0, 2) : [];
  }, [wallet.history]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          isSmallPhone && styles.contentSmall,
          { paddingBottom: Math.max(insets.bottom, 10) + 118 },
        ]}
      >
        <Header onRefresh={() => void wallet.refreshBalances()} />
        <SpotBalanceHero total={totalSpot} />
        <SpotDemoNotice />
        <QuickActions />
        <SpotSummaryStrip total={totalSpot} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ACTIVOS SPOT</Text>
            <Pressable style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}>
              <Ionicons name="search-outline" size={21} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FILTERS.map((filter) => {
              const active = activeFilter === filter;

              return (
                <Pressable
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    active && styles.filterChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.assetList}>
            {spotAssets.map((asset) => (
              <AssetRow key={asset.symbol} asset={asset} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ACTIVIDAD RECIENTE</Text>
            <Pressable onPress={() => router.push('/history')} hitSlop={8}>
              <Text style={styles.seeAllText}>VER TODO</Text>
            </Pressable>
          </View>

          <View style={styles.activityCard}>
            {activityRows.length ? (
              activityRows.map((item, index) => (
                <View key={item.id}>
                  <ActivityItem item={item} />
                  {index < activityRows.length - 1 ? <View style={styles.activityDivider} /> : null}
                </View>
              ))
            ) : (
              <ActivityEmptyState />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 22,
  },
  contentSmall: {
    paddingHorizontal: 14,
    gap: 20,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  hero: {
    width: '100%',
    minHeight: 214,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purple, 0.26),
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 176,
    height: 2,
    borderRadius: 2,
    top: 58,
    right: -22,
    backgroundColor: withOpacity(COLORS.purpleSoft, 0.13),
    transform: [{ rotate: '-18deg' }],
  },
  heroEyebrow: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 4,
    textAlign: 'center',
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  heroCurrency: {
    color: withOpacity(COLORS.text, 0.32),
    fontFamily: FONT.regular,
    fontSize: 42,
    lineHeight: 48,
  },
  heroValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 46,
    lineHeight: 54,
    letterSpacing: -1.2,
  },
  operativeBadge: {
    minHeight: 30,
    marginTop: 20,
    borderRadius: RADII.pill,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: withOpacity(COLORS.green, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.green, 0.42),
  },
  operativeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.greenBright,
  },
  operativeText: {
    color: COLORS.greenBright,
    fontFamily: FONT.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  updatedText: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 11,
    marginTop: 10,
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
    gap: 9,
    minWidth: 0,
  },
  quickIcon: {
    width: 52,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.08),
  },
  quickLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.semibold,
    fontSize: 11.5,
  },
  demoNotice: {
    width: '100%',
    minHeight: 54,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: withOpacity(COLORS.warning, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.warning, 0.24),
  },
  demoNoticeText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  summaryStrip: {
    width: '100%',
    minHeight: 82,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryMetric: {
    flex: 1,
    gap: 7,
    minWidth: 0,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.semibold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  summaryValue: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  section: {
    width: '100%',
    gap: 16,
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
    fontSize: 13,
    letterSpacing: 4,
  },
  searchButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    gap: 10,
    paddingRight: 16,
  },
  filterChip: {
    minHeight: 36,
    minWidth: 108,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.purpleSoft,
    borderColor: COLORS.purpleSoft,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  filterTextActive: {
    color: COLORS.text,
  },
  assetList: {
    width: '100%',
  },
  assetRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: withOpacity('#FFFFFF', 0.055),
  },
  assetIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  assetSymbol: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 23,
  },
  assetName: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  assetNumbers: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 128,
  },
  assetBalance: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  assetUsdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetUsd: {
    color: COLORS.textMuted,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  changeChip: {
    minHeight: 24,
    borderRadius: 6,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: {
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  seeAllText: {
    color: COLORS.purpleSoft,
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  activityCard: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  activityItem: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  activityTitle: {
    flexShrink: 1,
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  demoActivityBadge: {
    color: COLORS.warning,
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  activityDate: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 112,
  },
  activityAmount: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  activityStatus: {
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  activityDivider: {
    height: 1,
    backgroundColor: withOpacity('#FFFFFF', 0.055),
  },
  activityEmptyState: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  activityEmptyCopy: {
    flex: 1,
    gap: 4,
  },
  activityEmptyTitle: {
    color: COLORS.text,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  activityEmptyBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
});
