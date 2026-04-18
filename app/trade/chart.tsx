import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrbitLightweightChart } from '../../components/charts/OrbitLightweightChart';
import type {
  OrbitChartIndicator,
  OrbitChartMode,
  OrbitChartTimeframe,
} from '../../components/charts/chartData';
import { RouteRedirect } from '../../components/common/RouteRedirect';
import { FONT, RADII, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { FullscreenChartPanel, type FullscreenChartPanelTab } from '../../src/components/trade/FullscreenChartPanel';
import { usePairChartData } from '../../src/hooks/usePairChartData';
import { useRealtimeCandles } from '../../src/hooks/useRealtimeCandles';
import { useRealtimeMarketFeed } from '../../src/hooks/useRealtimeMarketFeed';
import { useRealtimePrice } from '../../src/hooks/useRealtimePrice';
import { useMarketData } from '../../src/hooks/useMarketData';
import { useAuthStore } from '../../src/store/authStore';
import { useTradeStore } from '../../src/store/tradeStore';
import type { TradePriceAlertDirection } from '../../src/types';
import { formatPercent } from '../../src/utils/formatPercent';

const TIMEFRAMES: OrbitChartTimeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D'];
const INDICATORS: OrbitChartIndicator[] = ['MA', 'EMA', 'RSI', 'MACD', 'BOLL', 'VWAP'];

function formatUsd(price: number) {
  return `USD ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: price >= 100 ? 0 : price >= 1 ? 2 : 4,
    maximumFractionDigits: price >= 100 ? 0 : price >= 1 ? 2 : 6,
  }).format(price)}`;
}

function formatCompactVolume(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)} B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)} M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)} K`;
  return `$${value.toFixed(2)}`;
}

function ChartLoadingState() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.loadingShell}>
      <LinearGradient
        colors={[colors.background, withOpacity(colors.primary, 0.18), colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.loadingRing, { borderColor: withOpacity(colors.primary, 0.24) }]} />
      <View style={[styles.loadingRingInner, { borderColor: withOpacity(colors.primary, 0.14) }]} />
      <View style={[styles.loadingAura, { backgroundColor: withOpacity(colors.primary, 0.16) }]} />
      <LinearGradient
        colors={[
          withOpacity(colors.primary, 0.28),
          withOpacity(colors.profit, 0.1),
          'transparent',
        ]}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.loadingCore}
      />
      <View style={[styles.loadingBadge, { backgroundColor: withOpacity(colors.backgroundAlt, 0.92), borderColor: withOpacity(colors.primary, 0.24) }]}>
        <Ionicons name="pulse-outline" size={22} color={colors.primary} />
      </View>
      <View style={styles.loadingDots}>
        {[0, 1, 2].map((dot) => (
          <View
            key={dot}
            style={[
              styles.loadingDot,
              {
                backgroundColor:
                  dot === 1 ? withOpacity(colors.profit, 0.88) : withOpacity(colors.primary, 0.82),
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.loadingText, { color: colors.text }]}>Cargando grafico</Text>
      <Text style={[styles.loadingSubtext, { color: colors.textSoft }]}>
        OrbitX esta sincronizando velas, precio y profundidad en vivo.
      </Text>
    </View>
  );
}

export default function TradeChartScreen() {
  const { pairId, tokenId } = useLocalSearchParams<{ pairId?: string; tokenId?: string }>();
  const { colors } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const sessionStatus = useAuthStore((state) => state.session.status);
  const selectedPairId = useTradeStore((state) => state.selectedPairId);
  const priceAlerts = useTradeStore((state) => state.priceAlerts);
  const addPriceAlert = useTradeStore((state) => state.addPriceAlert);
  const removePriceAlert = useTradeStore((state) => state.removePriceAlert);
  const markPriceAlertTriggered = useTradeStore((state) => state.markPriceAlertTriggered);
  const { markets, selectedPair, loading, selectPairById } = useMarketData('trade');
  const [timeframe, setTimeframe] = useState<OrbitChartTimeframe>('5m');
  const [mode, setMode] = useState<OrbitChartMode>('candles');
  const [showVolume, setShowVolume] = useState(true);
  const [indicators, setIndicators] = useState<OrbitChartIndicator[]>(['MA', 'EMA', 'RSI', 'MACD', 'BOLL', 'VWAP']);
  const [favorite, setFavorite] = useState(false);
  const [showLoadingHero, setShowLoadingHero] = useState(false);
  const [chartResetKey, setChartResetKey] = useState(0);
  const [panelTab, setPanelTab] = useState<FullscreenChartPanelTab>('book');
  const [alertValue, setAlertValue] = useState('');
  const [triggeredBanner, setTriggeredBanner] = useState<string | null>(null);

  const isLandscape = width > height;

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
    if (Platform.OS === 'web') return;
    void ScreenOrientation.unlockAsync().catch(() => undefined);
    return () => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => undefined);
    };
  }, []);

  const pair = selectedPair;
  const { history: fallbackHistory, loading: fallbackHistoryLoading } = usePairChartData(pair, timeframe);
  const realtimePrice = useRealtimePrice(pair);
  const realtimeCandles = useRealtimeCandles(pair, timeframe, fallbackHistory);
  const realtimeFeed = useRealtimeMarketFeed(pair);
  const activeTicker = realtimePrice.ticker;
  const chartHistory = realtimeCandles.history ?? fallbackHistory;
  const positive = (activeTicker?.change24h ?? pair?.change24h ?? 0) >= 0;
  const chartHeight = isLandscape ? Math.max(height * 0.42, 240) : Math.min(Math.max(height * 0.38, 260), 380);
  const showChartLoading = loading || (!pair && fallbackHistoryLoading) || (!chartHistory && realtimeCandles.loading);
  const pairAlerts = useMemo(() => priceAlerts.filter((alert) => alert.pairId === pair?.id), [pair?.id, priceAlerts]);

  useEffect(() => {
    if (activeTicker?.price && !alertValue) {
      setAlertValue(String(activeTicker.price.toFixed(activeTicker.price >= 1 ? 2 : 6)));
    }
  }, [activeTicker?.price, alertValue]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (showChartLoading) {
      timeout = setTimeout(() => setShowLoadingHero(true), 180);
    } else {
      setShowLoadingHero(false);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [showChartLoading]);

  useEffect(() => {
    if (!pair || !activeTicker?.price) return;

    pairAlerts
      .filter((alert) => !alert.triggeredAt)
      .forEach((alert) => {
        const crossed =
          alert.direction === 'above_or_equal'
            ? activeTicker.price >= alert.targetPrice
            : activeTicker.price <= alert.targetPrice;

        if (crossed) {
          markPriceAlertTriggered(alert.id, activeTicker.price);
          setTriggeredBanner(
            `Alerta ${pair.symbol}: ${alert.direction === 'above_or_equal' ? '>= ' : '<= '}${alert.targetPrice}`,
          );
        }
      });
  }, [activeTicker?.price, markPriceAlertTriggered, pair, pairAlerts]);

  useEffect(() => {
    if (!triggeredBanner) return;
    const timer = setTimeout(() => setTriggeredBanner(null), 4200);
    return () => {
      clearTimeout(timer);
    };
  }, [triggeredBanner]);

  if (sessionStatus === 'signed_out') {
    return <RouteRedirect href="/" />;
  }

  if (!loading && !pair) {
    return <RouteRedirect href="/spot" />;
  }

  function toggleIndicator(indicator: OrbitChartIndicator) {
    setIndicators((current) =>
      current.includes(indicator) ? current.filter((item) => item !== indicator) : [...current, indicator],
    );
  }

  function handleCreateAlert(direction: TradePriceAlertDirection) {
    if (!pair) return;
    const parsedValue = Number(alertValue.replace(',', '.'));
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setTriggeredBanner('Ingresa un precio valido para crear la alerta.');
      return;
    }
    addPriceAlert(pair.id, direction, parsedValue);
    setTriggeredBanner(`Alerta creada ${direction === 'above_or_equal' ? '>= ' : '<= '}${parsedValue}`);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <LinearGradient
          colors={[withOpacity(colors.primary, 0.18), 'transparent', withOpacity(colors.primary, 0.06)]}
          start={{ x: 0.12, y: 0.02 }}
          end={{ x: 0.88, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.backgroundRing, { borderColor: withOpacity(colors.primary, 0.16) }]} />
      </View>

      <View style={[styles.content, isLandscape && styles.contentLandscape]}>
        <View style={styles.headerTopRow}>
          <Pressable onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </Pressable>
          <View style={styles.pairCopy}>
            <Text style={[styles.pairLabel, { color: colors.text }]}>{pair?.symbol ?? 'BTC/USDT'}</Text>
            <Text style={[styles.pairName, { color: colors.textMuted }]}>{pair?.coin.name ?? 'Bitcoin'}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setFavorite((value) => !value)}
              style={[styles.iconButton, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}
            >
              <Ionicons name={favorite ? 'star' : 'star-outline'} size={16} color={favorite ? colors.warning : colors.textMuted} />
            </Pressable>
            <Pressable style={[styles.iconButton, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
              <Ionicons name="ellipsis-horizontal" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceBlock}>
            <Text style={[styles.priceText, { color: colors.text }]}>{activeTicker ? formatUsd(activeTicker.price) : 'USD 68,172'}</Text>
            <Text style={[styles.changeText, { color: positive ? colors.profit : colors.loss }]}>
              {formatPercent(activeTicker?.change24h ?? pair?.change24h ?? 0)}
            </Text>
          </View>
          <View style={styles.headerMetrics}>
            <View style={styles.metricCell}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Alto 24h</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{formatUsd(activeTicker?.high24h ?? pair?.high24h ?? 0)}</Text>
            </View>
            <View style={styles.metricCell}>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Volumen</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{formatCompactVolume(activeTicker?.volume24h ?? pair?.volume24h ?? 0)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.timeframeRow}>
          {TIMEFRAMES.map((item) => {
            const active = timeframe === item;
            return (
              <Pressable
                key={item}
                onPress={() => setTimeframe(item)}
                style={[
                  styles.timeframeChip,
                  {
                    backgroundColor: active ? colors.primary : 'transparent',
                    borderColor: active ? withOpacity(colors.primary, 0.7) : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.timeframeLabel, { color: active ? colors.text : colors.textMuted }]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.toolsRow}>
          {[
            ['candles', 'Velas'],
            ['line', 'Linea'],
          ].map(([value, label]) => {
            const active = mode === value;
            return (
              <Pressable
                key={value}
                onPress={() => setMode(value as OrbitChartMode)}
                style={[
                  styles.toolChip,
                  {
                    backgroundColor: active ? colors.primarySoft : 'transparent',
                    borderColor: active ? withOpacity(colors.primary, 0.5) : withOpacity(colors.border, 0.4),
                  },
                ]}
              >
                <Text style={[styles.toolChipLabel, { color: active ? colors.text : colors.textMuted }]}>{label}</Text>
              </Pressable>
            );
          })}

          <Pressable
            onPress={() => setShowVolume((value) => !value)}
            style={[
              styles.toolChip,
              {
                backgroundColor: showVolume ? colors.primarySoft : 'transparent',
                borderColor: showVolume ? withOpacity(colors.primary, 0.5) : withOpacity(colors.border, 0.4),
              },
            ]}
          >
            <Text style={[styles.toolChipLabel, { color: showVolume ? colors.text : colors.textMuted }]}>Vol</Text>
          </Pressable>

          <Pressable onPress={() => setChartResetKey((value) => value + 1)} style={[styles.toolChip, { borderColor: withOpacity(colors.border, 0.4) }]}>
            <Text style={[styles.toolChipLabel, { color: colors.textMuted }]}>Ajustar</Text>
          </Pressable>
        </View>

        <View style={[styles.chartFrame, { backgroundColor: withOpacity(colors.backgroundAlt, 0.9), borderColor: withOpacity(colors.border, 0.82), height: chartHeight }]}>
          {showChartLoading ? (
            showLoadingHero ? (
              <ChartLoadingState />
            ) : (
              <View style={[styles.quickLoadingState, { backgroundColor: withOpacity(colors.backgroundAlt, 0.92) }]}>
                <Text style={[styles.quickLoadingTitle, { color: colors.text }]}>Sincronizando grafico</Text>
                <Text style={[styles.quickLoadingBody, { color: colors.textMuted }]}>OrbitX esta preparando la ultima lectura del mercado.</Text>
              </View>
            )
          ) : (
            <OrbitLightweightChart
              key={`${pair?.id ?? 'pair'}-${timeframe}-${chartResetKey}`}
              history={chartHistory}
              timeframe={timeframe}
              mode={mode}
              indicators={indicators}
              interactive
              showVolume={showVolume}
              height={chartHeight}
              emptyTitle="Grafico no disponible"
              emptyBody="No recibimos datos historicos verificados para este par."
            />
          )}
        </View>

        <FullscreenChartPanel
          tab={panelTab}
          onChangeTab={setPanelTab}
          orderBookRows={realtimeFeed.orderBook}
          orderBookStatus={realtimeFeed.status}
          orderBookError={realtimeFeed.error}
          recentTrades={realtimeFeed.recentTrades}
          sourceLabel={realtimePrice.sourceLabel}
          chartSourceLabel={realtimeCandles.sourceLabel}
          currentPrice={activeTicker?.price ?? pair?.price ?? 0}
          high24h={activeTicker?.high24h ?? pair?.high24h ?? 0}
          low24h={activeTicker?.low24h ?? pair?.low24h ?? 0}
          volume24h={activeTicker?.volume24h ?? pair?.volume24h ?? 0}
          alertValue={alertValue}
          onChangeAlertValue={setAlertValue}
          onCreateAlert={handleCreateAlert}
          alerts={pairAlerts}
          onRemoveAlert={removePriceAlert}
          onPickPrice={(priceValue) =>
            router.replace({ pathname: '/spot', params: pair ? { pairId: pair.id, price: String(priceValue) } : undefined })
          }
        />

        <View style={styles.indicatorRow}>
          {INDICATORS.map((indicator) => {
            const active = indicators.includes(indicator);
            return (
              <Pressable
                key={indicator}
                onPress={() => toggleIndicator(indicator)}
                style={[
                  styles.indicatorChip,
                  {
                    backgroundColor: active ? colors.primarySoft : 'transparent',
                    borderColor: active ? withOpacity(colors.primary, 0.42) : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.indicatorLabel, { color: active ? colors.text : colors.textMuted }]}>{indicator}</Text>
              </Pressable>
            );
          })}
        </View>

        {triggeredBanner ? (
          <View style={[styles.bannerShell, { backgroundColor: withOpacity(colors.primary, 0.14), borderColor: withOpacity(colors.primary, 0.28) }]}>
            <Ionicons name="notifications" size={14} color={colors.primary} />
            <Text style={[styles.bannerLabel, { color: colors.text }]}>{triggeredBanner}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Pressable
            onPress={() => router.replace({ pathname: '/spot', params: pair ? { pairId: pair.id } : undefined })}
            style={[styles.tradeButton, { backgroundColor: withOpacity(colors.primary, 0.92), borderColor: withOpacity(colors.primary, 1) }]}
          >
            <LinearGradient colors={[withOpacity('#B67CFF', 0.25), 'transparent']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
            <Ionicons name="sync" size={15} color={colors.text} />
            <Text style={[styles.tradeButtonLabel, { color: colors.text }]}>Operar</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backgroundLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  backgroundRing: { position: 'absolute', top: 86, right: -86, width: 280, height: 280, borderRadius: 999, borderWidth: 1, opacity: 0.7 },
  content: { flex: 1, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 14, gap: 10 },
  contentLandscape: { paddingHorizontal: 18 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pairCopy: { flex: 1, gap: 1 },
  pairLabel: { fontFamily: FONT.bold, fontSize: 18, lineHeight: 20 },
  pairName: { fontFamily: FONT.regular, fontSize: 10 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 34, height: 34, borderRadius: RADII.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  priceRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  priceBlock: { flex: 1, gap: 4 },
  priceText: { fontFamily: FONT.bold, fontSize: 16, lineHeight: 19 },
  changeText: { fontFamily: FONT.semibold, fontSize: 13 },
  headerMetrics: { flexDirection: 'row', gap: 12 },
  metricCell: { minWidth: 68, gap: 2 },
  metricLabel: { fontFamily: FONT.medium, fontSize: 9 },
  metricValue: { fontFamily: FONT.semibold, fontSize: 11, lineHeight: 14 },
  timeframeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2 },
  timeframeChip: { minHeight: 30, minWidth: 38, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  timeframeLabel: { fontFamily: FONT.medium, fontSize: 11 },
  toolsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: 2 },
  toolChip: { minHeight: 30, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  toolChipLabel: { fontFamily: FONT.medium, fontSize: 11 },
  chartFrame: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  loadingShell: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, overflow: 'hidden' },
  loadingRing: { position: 'absolute', width: 290, height: 290, borderRadius: 999, borderWidth: 1, opacity: 0.74 },
  loadingRingInner: { position: 'absolute', width: 214, height: 214, borderRadius: 999, borderWidth: 1, opacity: 0.76 },
  loadingAura: { position: 'absolute', width: 240, height: 240, borderRadius: 999 },
  loadingCore: { position: 'absolute', width: 176, height: 176, borderRadius: 999, opacity: 0.9 },
  loadingBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDots: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingDot: { width: 7, height: 7, borderRadius: 999 },
  loadingText: { fontFamily: FONT.semibold, fontSize: 16, marginTop: 2 },
  loadingSubtext: {
    maxWidth: 260,
    textAlign: 'center',
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  quickLoadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 8 },
  quickLoadingTitle: { fontFamily: FONT.semibold, fontSize: 15 },
  quickLoadingBody: { fontFamily: FONT.regular, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  indicatorChip: { minHeight: 28, minWidth: 46, borderRadius: 9, borderWidth: 1, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  indicatorLabel: { fontFamily: FONT.medium, fontSize: 11 },
  bannerShell: { minHeight: 36, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerLabel: { flex: 1, fontFamily: FONT.medium, fontSize: 12 },
  footer: { paddingTop: 2, alignItems: 'center', justifyContent: 'center' },
  tradeButton: { minWidth: 138, minHeight: 42, borderRadius: RADII.pill, borderWidth: 1, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  tradeButtonLabel: { fontFamily: FONT.semibold, fontSize: 13 },
});
