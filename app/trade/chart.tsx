import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrbitLightweightChart } from '../../components/charts/OrbitLightweightChart';
import type { OrbitChartIndicator, OrbitChartTimeframe } from '../../components/charts/chartData';
import type { OrbitChartHtmlColors } from '../../components/charts/lightweightChartHtml';
import { RouteRedirect } from '../../components/common/RouteRedirect';
import { FONT, RADII, withOpacity } from '../../constants/theme';
import { TradeOrderBookPanel } from '../../src/components/trade/TradeOrderBookPanel';
import { useAstra } from '../../src/hooks/useAstra';
import { useMarketData } from '../../src/hooks/useMarketData';
import { usePairChartData } from '../../src/hooks/usePairChartData';
import { useRealtimeCandles } from '../../src/hooks/useRealtimeCandles';
import { useRealtimeMarketFeed } from '../../src/hooks/useRealtimeMarketFeed';
import { useRealtimePrice } from '../../src/hooks/useRealtimePrice';
import { useAuthStore } from '../../src/store/authStore';
import { useProfileStore } from '../../src/store/profileStore';
import { useTradeStore } from '../../src/store/tradeStore';
import { formatPercent } from '../../src/utils/formatPercent';
import {
  getTradeRealtimeStatusCopy,
  getTradeRealtimeStatusLabel,
} from '../../src/utils/tradeRealtimeUi';

const COLORS = {
  background: '#08090B',
  surface: '#141518',
  surfaceSoft: '#111318',
  border: '#2D3139',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  green: '#00C853',
  red: '#FF5252',
  purple: '#6F3FF5',
  ma5: '#F5A623',
  ma10: '#3BA7FF',
  ma30: '#8B5CF6',
};

const CHART_COLORS: Partial<OrbitChartHtmlColors> = {
  background: COLORS.background,
  backgroundAlt: COLORS.surfaceSoft,
  text: COLORS.textPrimary,
  textMuted: COLORS.textSecondary,
  border: withOpacity(COLORS.border, 0.72),
  borderStrong: withOpacity(COLORS.border, 0.92),
  grid: withOpacity('#FFFFFF', 0.06),
  gridStrong: withOpacity(COLORS.purple, 0.32),
  primary: COLORS.purple,
  profit: COLORS.green,
  loss: COLORS.red,
};

const PRIMARY_TIMEFRAMES: OrbitChartTimeframe[] = ['15m', '1h', '4h', '1D'];
const EXTRA_TIMEFRAMES: OrbitChartTimeframe[] = ['1m', '5m'];

type MainTab = 'chart' | 'wall' | 'coin' | 'ideas';
type BottomTab = 'book' | 'history' | 'analysis';
type IndicatorTab = 'MA' | 'EMA' | 'BOLL' | 'VOL' | 'MACD' | 'RSI' | 'KDJ';

const MAIN_TABS: Array<{ key: MainTab; label: string }> = [
  { key: 'chart', label: 'Gráfico' },
  { key: 'wall', label: 'Muro' },
  { key: 'coin', label: 'Info. de moneda' },
  { key: 'ideas', label: 'Recom.' },
];

const INDICATORS: IndicatorTab[] = ['MA', 'EMA', 'BOLL', 'VOL', 'MACD', 'RSI', 'KDJ'];
const LOWER_TABS: Array<{ key: BottomTab; label: string }> = [
  { key: 'book', label: 'Libro de órdenes' },
  { key: 'history', label: 'Historial' },
  { key: 'analysis', label: 'Análisis' },
];

const FOOTER_ACTIONS = [
  { key: 'futures', label: 'Futuros', icon: 'pulse-outline' as const, route: '/bot-futures' },
  { key: 'grid', label: 'Grid', icon: 'grid-outline' as const, route: '/bot-futures/strategy' },
  { key: 'leverage', label: 'Apal.', icon: 'layers-outline' as const, route: '/bot-futures/risk-manager' },
  { key: 'convert', label: 'Convertir', icon: 'swap-horizontal-outline' as const, route: '/convert' },
];

function formatMainPrice(value: number) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: value >= 100 ? 2 : 4,
    maximumFractionDigits: value >= 100 ? 2 : 6,
  }).format(value);
}

function formatRightPrice(value: number) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: value >= 100 ? 0 : 2,
    maximumFractionDigits: value >= 100 ? 0 : 4,
  }).format(value);
}

function formatApproxUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactAmount(value: number, digits = 2) {
  if (!Number.isFinite(value) || value <= 0) {
    return '--';
  }
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(digits)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(digits)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(digits)}K`;
  return value.toFixed(digits);
}

function formatTradeTime(value: string) {
  try {
    return new Date(value).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

function movingAverage(values: number[], period: number) {
  if (values.length < period) {
    return null;
  }
  const window = values.slice(-period);
  return window.reduce((sum, item) => sum + item, 0) / period;
}

function ChartLoadingState() {
  return (
    <View style={styles.chartLoading}>
      <View style={styles.loadingRing} />
      <Ionicons name="stats-chart-outline" size={22} color={COLORS.purple} />
      <Text style={styles.chartLoadingTitle}>Sincronizando gráfico</Text>
      <Text style={styles.chartLoadingBody}>
        OrbitX está cargando velas, volumen y profundidad para este par.
      </Text>
    </View>
  );
}

function AnalysisPanel({
  insight,
  high24h,
  low24h,
  volume24h,
  quoteVolume24h,
  priceStatusLabel,
  orderBookStatusLabel,
  onOpenAstra,
}: {
  insight: string;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  priceStatusLabel: string;
  orderBookStatusLabel: string;
  onOpenAstra: () => void;
}) {
  return (
    <View style={styles.analysisPanel}>
      <View style={styles.analysisInsight}>
        <Text style={styles.analysisInsightLabel}>Radar de mercado</Text>
        <Text style={styles.analysisInsightText}>{insight}</Text>
      </View>

      <View style={styles.analysisGrid}>
        <View style={styles.analysisMetric}>
          <Text style={styles.analysisMetricLabel}>Máx 24h</Text>
          <Text style={styles.analysisMetricValue}>{formatRightPrice(high24h)}</Text>
        </View>
        <View style={styles.analysisMetric}>
          <Text style={styles.analysisMetricLabel}>Mín 24h</Text>
          <Text style={styles.analysisMetricValue}>{formatRightPrice(low24h)}</Text>
        </View>
        <View style={styles.analysisMetric}>
          <Text style={styles.analysisMetricLabel}>Vol. BTC</Text>
          <Text style={styles.analysisMetricValue}>{formatCompactAmount(volume24h)}</Text>
        </View>
        <View style={styles.analysisMetric}>
          <Text style={styles.analysisMetricLabel}>Vol. USDT</Text>
          <Text style={styles.analysisMetricValue}>{formatCompactAmount(quoteVolume24h)}</Text>
        </View>
        <View style={styles.analysisMetric}>
          <Text style={styles.analysisMetricLabel}>Estado precio</Text>
          <Text style={styles.analysisMetricValue}>{priceStatusLabel}</Text>
        </View>
        <View style={styles.analysisMetric}>
          <Text style={styles.analysisMetricLabel}>Estado muro</Text>
          <Text style={styles.analysisMetricValue}>{orderBookStatusLabel}</Text>
        </View>
      </View>

      <Pressable onPress={onOpenAstra} style={({ pressed }) => [styles.analysisButton, pressed && styles.pressed]}>
        <Ionicons name="sparkles-outline" size={16} color={COLORS.textPrimary} />
        <Text style={styles.analysisButtonText}>Preguntar a Astra</Text>
      </Pressable>
    </View>
  );
}

export default function TradeChartScreen() {
  const { pairId, tokenId } = useLocalSearchParams<{ pairId?: string; tokenId?: string }>();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sessionStatus = useAuthStore((state) => state.session.status);
  const selectedPairId = useTradeStore((state) => state.selectedPairId);
  const favoritePairIds = useProfileStore((state) => state.favoritePairIds);
  const toggleFavoritePair = useProfileStore((state) => state.toggleFavoritePair);
  const { openAstra } = useAstra();
  const { markets, selectedPair, loading, selectPairById } = useMarketData('trade');

  const [mainTab, setMainTab] = useState<MainTab>('chart');
  const [bottomTab, setBottomTab] = useState<BottomTab>('book');
  const [indicatorTab, setIndicatorTab] = useState<IndicatorTab>('MA');
  const [timeframe, setTimeframe] = useState<OrbitChartTimeframe>('15m');
  const [lineMode, setLineMode] = useState(false);
  const [showExtraFrames, setShowExtraFrames] = useState(false);
  const [chartResetKey, setChartResetKey] = useState(0);

  const chartHeight = Math.min(Math.max(height * 0.36, 300), 380);
  const isSmallPhone = width < 380;

  useEffect(() => {
    const resolvedPairId =
      pairId ||
      tokenId ||
      (tokenId
        ? markets.find((item) => item.coin.coingeckoId === tokenId || item.baseId === tokenId)?.id
        : undefined) ||
      selectedPairId;

    if (resolvedPairId) {
      void selectPairById(resolvedPairId);
    }
  }, [markets, pairId, selectPairById, selectedPairId, tokenId]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    void ScreenOrientation.unlockAsync().catch(() => undefined);
    return () => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(
        () => undefined,
      );
    };
  }, []);

  const pair = selectedPair;
  const { history: fallbackHistory, loading: fallbackHistoryLoading } = usePairChartData(pair, timeframe);
  const realtimePrice = useRealtimePrice(pair);
  const realtimeCandles = useRealtimeCandles(pair, timeframe, fallbackHistory);
  const realtimeFeed = useRealtimeMarketFeed(pair);

  const livePrice = realtimePrice.ticker?.price ?? pair?.price ?? 0;
  const currentChange = realtimePrice.ticker?.change24h ?? pair?.change24h ?? 0;
  const high24h = realtimePrice.ticker?.high24h ?? pair?.high24h ?? 0;
  const low24h = realtimePrice.ticker?.low24h ?? pair?.low24h ?? 0;
  const volume24h = realtimePrice.ticker?.volume24h ?? pair?.volume24h ?? 0;
  const quoteVolume24h = volume24h * livePrice;
  const positive = currentChange >= 0;
  const favorite = pair ? favoritePairIds.includes(pair.id) : false;
  const chartHistory = realtimeCandles.history ?? fallbackHistory;
  const chartLoading = loading || (!pair && fallbackHistoryLoading) || (!chartHistory && realtimeCandles.loading);
  const recentTrades = realtimeFeed.recentTrades.slice(0, 16);
  const closeSeries = chartHistory?.candles?.length
    ? chartHistory.candles.map((item) => item.close)
    : chartHistory?.line.map((item) => item.value) ?? [];
  const ma5 = movingAverage(closeSeries, 5);
  const ma10 = movingAverage(closeSeries, 10);
  const ma30 = movingAverage(closeSeries, 30);

  const chartIndicators = useMemo<OrbitChartIndicator[]>(() => {
    const indicators: OrbitChartIndicator[] = ['MA'];
    if (indicatorTab === 'EMA') indicators.push('EMA');
    if (indicatorTab === 'BOLL') indicators.push('BOLL');
    if (indicatorTab === 'MACD') indicators.push('MACD');
    if (indicatorTab === 'RSI') indicators.push('RSI');
    return indicators;
  }, [indicatorTab]);

  const pairSymbol = pair?.symbol ?? 'BTC/USDT';
  const insightThreshold = livePrice > 0 ? livePrice * 1.047 : high24h * 1.03;
  const insight = `Un rompimiento del ${pair?.baseSymbol ?? 'BTC'} por encima de los $${formatRightPrice(
    insightThreshold,
  )} podría activar nueva oportunidad.`;

  if (sessionStatus === 'signed_out') {
    return <RouteRedirect href="/" />;
  }

  if (!loading && !pair) {
    return <RouteRedirect href="/spot" />;
  }

  function openAstraForChart() {
    if (!pair) {
      return;
    }

    openAstra({
      surface: 'trade',
      path: '/trade/chart',
      screenName: 'Gráfico',
      summary: `Vista técnica de ${pair.symbol} con gráfico, muro y contexto intradía.`,
      currentTask:
        bottomTab === 'book'
          ? 'trade_order_book_review'
          : bottomTab === 'history'
            ? 'trade_tape_review'
            : 'trade_market_info_review',
      currentPairSymbol: pair.symbol,
      currentPriceLabel: `USD ${formatMainPrice(livePrice)}`,
      selectedEntity: {
        type: 'trading_pair',
        id: pair.id,
        pair: pair.symbol,
        symbol: pair.baseSymbol,
        name: pair.baseSymbol,
      },
      uiState: {
        activeTradeTab: mainTab,
        activePanelTab: bottomTab,
        activeTimeframe: timeframe,
        priceFeedStatus: realtimePrice.status,
        orderBookStatus: realtimeFeed.status,
        chartFeedStatus: realtimeCandles.status,
        orderBookDepth: realtimeFeed.orderBook.length,
        recentTradesCount: recentTrades.length,
        loading,
      },
    });
  }

  function handleMainTabPress(next: MainTab) {
    setMainTab(next);
    if (next === 'wall') setBottomTab('book');
    if (next === 'coin' || next === 'ideas') setBottomTab('analysis');
  }

  function renderLowerPanel() {
    if (!pair) {
      return null;
    }

    if (bottomTab === 'history') {
      return (
        <View style={styles.historyPanel}>
          <View style={styles.historyHeader}>
            <Text style={styles.lowerPanelTitle}>Historial de operaciones</Text>
            <Text style={styles.lowerPanelStatus}>{getTradeRealtimeStatusLabel(realtimeFeed.status)}</Text>
          </View>

          <View style={styles.tradeHeaderRow}>
            <Text style={styles.tradeHeaderLeft}>Precio</Text>
            <Text style={styles.tradeHeaderCenter}>Cantidad</Text>
            <Text style={styles.tradeHeaderRight}>Hora</Text>
          </View>

          {recentTrades.length ? (
            <View style={styles.tradeRows}>
              {recentTrades.map((trade) => (
                <View key={trade.id} style={styles.tradeRow}>
                  <Text style={[styles.tradePrice, { color: trade.side === 'buy' ? COLORS.green : COLORS.red }]}>
                    {formatRightPrice(trade.price)}
                  </Text>
                  <Text style={styles.tradeQty}>{trade.quantity.toFixed(4)}</Text>
                  <Text style={styles.tradeTime}>{formatTradeTime(trade.time)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Sin operaciones visibles</Text>
              <Text style={styles.emptyBody}>
                {realtimeFeed.error || 'Aún no llegan ejecuciones recientes para este par.'}
              </Text>
            </View>
          )}
        </View>
      );
    }

    if (bottomTab === 'analysis') {
      return (
        <AnalysisPanel
          insight={insight}
          high24h={high24h}
          low24h={low24h}
          volume24h={volume24h}
          quoteVolume24h={quoteVolume24h}
          priceStatusLabel={getTradeRealtimeStatusCopy(realtimePrice.status)}
          orderBookStatusLabel={getTradeRealtimeStatusCopy(realtimeFeed.status)}
          onOpenAstra={openAstraForChart}
        />
      );
    }

    return (
      <TradeOrderBookPanel
        rows={realtimeFeed.orderBook}
        status={realtimeFeed.status}
        statusLabel={getTradeRealtimeStatusLabel(realtimeFeed.status)}
        statusCopy={getTradeRealtimeStatusCopy(realtimeFeed.status)}
        error={realtimeFeed.error}
        currentPrice={livePrice}
        onPickPrice={(priceValue, side) =>
          router.replace({
            pathname: '/spot',
            params: { pairId: pair.id, price: String(priceValue), side },
          })
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[withOpacity(COLORS.purple, 0.18), 'transparent', withOpacity(COLORS.green, 0.04)]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 164 + Math.max(insets.bottom, 10) },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            </Pressable>

            <View style={styles.headerCopy}>
              <View style={styles.symbolRow}>
                <Text style={styles.symbolText}>{pairSymbol}</Text>
                <View style={styles.spotBadge}>
                  <Text style={styles.spotBadgeText}>Spot</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => pair && toggleFavoritePair(pair.id)}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <Ionicons
                name={favorite ? 'star' : 'star-outline'}
                size={17}
                color={favorite ? '#FFC857' : COLORS.textPrimary}
              />
            </Pressable>
            <Pressable
              onPress={() => setBottomTab('analysis')}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <Ionicons name="notifications-outline" size={17} color={COLORS.textPrimary} />
            </Pressable>
            <Pressable onPress={openAstraForChart} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
              <Ionicons name="sparkles-outline" size={17} color={COLORS.purple} />
            </Pressable>
          </View>
        </View>

        <View style={styles.priceSummary}>
          <View style={styles.priceLeft}>
            <Text style={[styles.mainPrice, isSmallPhone && styles.mainPriceSmall]} numberOfLines={1}>
              {formatMainPrice(livePrice)}
            </Text>
            <Text style={[styles.priceChange, { color: positive ? COLORS.green : COLORS.red }]}>
              {formatPercent(currentChange)}
            </Text>
            <Text style={styles.approxLabel}>≈ ${formatApproxUsd(livePrice)}</Text>
          </View>

          <View style={styles.priceStats}>
            <View style={styles.priceStatRow}>
              <Text style={styles.priceStatLabel}>Máx 24h</Text>
              <Text style={styles.priceStatValue}>{formatRightPrice(high24h)}</Text>
            </View>
            <View style={styles.priceStatRow}>
              <Text style={styles.priceStatLabel}>Mín 24h</Text>
              <Text style={styles.priceStatValue}>{formatRightPrice(low24h)}</Text>
            </View>
            <View style={styles.priceStatRow}>
              <Text style={styles.priceStatLabel}>Vol 24h BTC</Text>
              <Text style={styles.priceStatValue}>{formatCompactAmount(volume24h)}</Text>
            </View>
            <View style={styles.priceStatRow}>
              <Text style={styles.priceStatLabel}>Vol 24h USDT</Text>
              <Text style={styles.priceStatValue}>{formatCompactAmount(quoteVolume24h)}</Text>
            </View>
          </View>
        </View>

        <Pressable onPress={openAstraForChart} style={({ pressed }) => [styles.marketInsight, pressed && styles.pressed]}>
          <Ionicons name="newspaper-outline" size={16} color={withOpacity(COLORS.textPrimary, 0.92)} />
          <Text style={styles.marketInsightText} numberOfLines={2}>
            {insight}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
        </Pressable>

        <View style={styles.mainTabsRow}>
          {MAIN_TABS.map((tab) => {
            const active = mainTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => handleMainTabPress(tab.key)}
                style={({ pressed }) => [styles.mainTabButton, pressed && styles.pressed]}
              >
                <Text style={[styles.mainTabLabel, active && styles.mainTabLabelActive]} numberOfLines={1}>
                  {tab.label}
                </Text>
                <View style={[styles.mainTabUnderline, active && styles.mainTabUnderlineActive]} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.timeframeRow}>
          <View style={styles.timeframeTabs}>
            <Pressable
              onPress={() => {
                setLineMode(true);
                setMainTab('chart');
              }}
              style={({ pressed }) => [styles.timeframeChip, pressed && styles.pressed]}
            >
              <Text style={[styles.timeframeChipText, lineMode && styles.timeframeChipTextActive]}>Línea</Text>
            </Pressable>

            {PRIMARY_TIMEFRAMES.map((item) => {
              const active = !lineMode && timeframe === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => {
                    setLineMode(false);
                    setTimeframe(item);
                    setShowExtraFrames(false);
                  }}
                  style={({ pressed }) => [styles.timeframeChip, pressed && styles.pressed]}
                >
                  <Text style={[styles.timeframeChipText, active && styles.timeframeChipTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setShowExtraFrames((value) => !value)}
              style={({ pressed }) => [styles.timeframeChip, pressed && styles.pressed]}
            >
              <Text style={[styles.timeframeChipText, showExtraFrames && styles.timeframeChipTextActive]}>
                Más
              </Text>
            </Pressable>
          </View>

          <View style={styles.chartActionRow}>
            <Pressable
              onPress={() => setChartResetKey((value) => value + 1)}
              style={({ pressed }) => [styles.utilityIcon, pressed && styles.pressed]}
            >
              <Ionicons name="options-outline" size={16} color={COLORS.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => setChartResetKey((value) => value + 1)}
              style={({ pressed }) => [styles.utilityIcon, pressed && styles.pressed]}
            >
              <Ionicons name="expand-outline" size={16} color={COLORS.textSecondary} />
            </Pressable>
          </View>
        </View>

        {showExtraFrames ? (
          <View style={styles.extraFramesRow}>
            {EXTRA_TIMEFRAMES.map((item) => {
              const active = timeframe === item && !lineMode;
              return (
                <Pressable
                  key={item}
                  onPress={() => {
                    setLineMode(false);
                    setTimeframe(item);
                  }}
                  style={({ pressed }) => [styles.extraFrameChip, pressed && styles.pressed]}
                >
                  <Text style={[styles.extraFrameText, active && styles.extraFrameTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.maLegendRow}>
          <Text style={[styles.maLegendText, { color: COLORS.ma5 }]}>MA5:{ma5 ? formatRightPrice(ma5) : '--'}</Text>
          <Text style={[styles.maLegendText, { color: COLORS.ma10 }]}>MA10:{ma10 ? formatRightPrice(ma10) : '--'}</Text>
          <Text style={[styles.maLegendText, { color: COLORS.ma30 }]}>MA30:{ma30 ? formatRightPrice(ma30) : '--'}</Text>
        </View>

        <View style={styles.chartSurface}>
          {chartLoading ? (
            <ChartLoadingState />
          ) : (
            <OrbitLightweightChart
              key={`${pair?.id ?? 'pair'}-${timeframe}-${chartResetKey}-${indicatorTab}-${lineMode ? 'line' : 'candles'}`}
              history={chartHistory}
              timeframe={timeframe}
              mode={lineMode ? 'line' : 'candles'}
              indicators={chartIndicators}
              interactive
              showVolume
              height={chartHeight}
              colorOverrides={CHART_COLORS}
              emptyTitle="Gráfico no disponible"
              emptyBody="Aún no recibimos suficientes velas verificadas para este par."
            />
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.indicatorToolbar}
        >
          {INDICATORS.map((indicator) => {
            const active = indicatorTab === indicator;
            const disabled = indicator === 'KDJ';
            return (
              <Pressable
                key={indicator}
                onPress={() => {
                  if (!disabled) {
                    setIndicatorTab(indicator);
                  }
                }}
                style={({ pressed }) => [styles.indicatorChip, pressed && !disabled && styles.pressed]}
              >
                <Text
                  style={[
                    styles.indicatorChipText,
                    active && styles.indicatorChipTextActive,
                    disabled && styles.indicatorChipTextDisabled,
                  ]}
                >
                  {indicator}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.lowerTabsRow}>
          {LOWER_TABS.map((tab) => {
            const active = bottomTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setBottomTab(tab.key)}
                style={({ pressed }) => [styles.lowerTabButton, pressed && styles.pressed]}
              >
                <Text style={[styles.lowerTabText, active && styles.lowerTabTextActive]}>{tab.label}</Text>
                <View style={[styles.lowerTabUnderline, active && styles.lowerTabUnderlineActive]} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.panelSurface}>{renderLowerPanel()}</View>
      </ScrollView>

      <View style={[styles.bottomDock, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.secondaryActionsRow}>
          {FOOTER_ACTIONS.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => router.push(action.route as any)}
              style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
            >
              <Ionicons name={action.icon} size={16} color={COLORS.textSecondary} />
              <Text style={styles.secondaryActionText}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tradeButtonsRow}>
          <Pressable
            onPress={() =>
              pair &&
              router.replace({
                pathname: '/spot',
                params: { pairId: pair.id, side: 'buy' },
              })
            }
            style={({ pressed }) => [styles.tradeButton, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={[withOpacity(COLORS.green, 0.96), withOpacity(COLORS.green, 0.82)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.buyButtonText}>Comprar</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              pair &&
              router.replace({
                pathname: '/spot',
                params: { pairId: pair.id, side: 'sell' },
              })
            }
            style={({ pressed }) => [styles.tradeButton, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={[withOpacity(COLORS.red, 0.96), withOpacity(COLORS.red, 0.84)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.sellButtonText}>Vender</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.surfaceSoft, 0.9),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border, 0.72),
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbolText: {
    color: COLORS.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  spotBadge: {
    minHeight: 22,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#FFFFFF', 0.06),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border, 0.65),
  },
  spotBadgeText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  priceSummary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  priceLeft: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  mainPrice: {
    color: COLORS.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 34,
    lineHeight: 38,
  },
  mainPriceSmall: {
    fontSize: 30,
    lineHeight: 34,
  },
  priceChange: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  approxLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 12,
  },
  priceStats: {
    width: 154,
    gap: 5,
    paddingTop: 2,
  },
  priceStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  priceStatLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  priceStatValue: {
    color: COLORS.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 13,
    textAlign: 'right',
    flexShrink: 1,
  },
  marketInsight: {
    minHeight: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    backgroundColor: withOpacity(COLORS.surfaceSoft, 0.96),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border, 0.48),
  },
  marketInsightText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  mainTabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 18,
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(COLORS.border, 0.4),
  },
  mainTabButton: {
    paddingBottom: 8,
    gap: 6,
  },
  mainTabLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  mainTabLabelActive: {
    color: COLORS.textPrimary,
  },
  mainTabUnderline: {
    height: 2,
    borderRadius: RADII.pill,
    backgroundColor: 'transparent',
  },
  mainTabUnderlineActive: {
    backgroundColor: COLORS.purple,
  },
  timeframeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  timeframeTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    flex: 1,
  },
  timeframeChip: {
    paddingVertical: 2,
  },
  timeframeChipText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  timeframeChipTextActive: {
    color: COLORS.textPrimary,
  },
  chartActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  utilityIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.surfaceSoft, 0.92),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border, 0.54),
  },
  extraFramesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 2,
  },
  extraFrameChip: {
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(COLORS.surfaceSoft, 0.92),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border, 0.48),
  },
  extraFrameText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  extraFrameTextActive: {
    color: COLORS.textPrimary,
  },
  maLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  maLegendText: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  chartSurface: {
    width: '100%',
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  indicatorToolbar: {
    gap: 14,
    paddingVertical: 4,
    paddingRight: 16,
  },
  indicatorChip: {
    paddingVertical: 4,
  },
  indicatorChipText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  indicatorChipTextActive: {
    color: COLORS.textPrimary,
  },
  indicatorChipTextDisabled: {
    opacity: 0.46,
  },
  lowerTabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(COLORS.border, 0.4),
  },
  lowerTabButton: {
    paddingBottom: 8,
    gap: 6,
  },
  lowerTabText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  lowerTabTextActive: {
    color: COLORS.textPrimary,
  },
  lowerTabUnderline: {
    height: 2,
    borderRadius: RADII.pill,
    backgroundColor: 'transparent',
  },
  lowerTabUnderlineActive: {
    backgroundColor: COLORS.textPrimary,
  },
  panelSurface: {
    minHeight: 280,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: withOpacity(COLORS.border, 0.42),
    backgroundColor: withOpacity(COLORS.surfaceSoft, 0.54),
    overflow: 'hidden',
  },
  historyPanel: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  lowerPanelTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  lowerPanelStatus: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  tradeHeaderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tradeHeaderLeft: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  tradeHeaderCenter: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 10,
    textAlign: 'center',
  },
  tradeHeaderRight: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 10,
    textAlign: 'right',
  },
  tradeRows: {
    gap: 8,
  },
  tradeRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tradePrice: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  tradeQty: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 11,
    textAlign: 'center',
  },
  tradeTime: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 10,
    textAlign: 'right',
  },
  analysisPanel: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 14,
  },
  analysisInsight: {
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: withOpacity(COLORS.surface, 0.9),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border, 0.42),
  },
  analysisInsightLabel: {
    color: COLORS.purple,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  analysisInsightText: {
    color: COLORS.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  analysisMetric: {
    width: '47.5%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: withOpacity(COLORS.surface, 0.74),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.border, 0.34),
    gap: 4,
  },
  analysisMetricLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  analysisMetricValue: {
    color: COLORS.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
  analysisButton: {
    minHeight: 42,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: withOpacity(COLORS.purple, 0.18),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purple, 0.32),
  },
  analysisButtonText: {
    color: COLORS.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  emptyState: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  emptyBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  chartLoading: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.purple, 0.16),
  },
  chartLoadingTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  chartLoadingBody: {
    color: COLORS.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 260,
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: 14,
    backgroundColor: withOpacity(COLORS.background, 0.98),
    borderTopWidth: 1,
    borderTopColor: withOpacity(COLORS.border, 0.54),
    gap: 10,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  secondaryAction: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  secondaryActionText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  tradeButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tradeButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#04110D',
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  sellButtonText: {
    color: COLORS.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 16,
  },
});
