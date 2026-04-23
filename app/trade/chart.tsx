import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrbitLightweightChart } from '../../components/charts/OrbitLightweightChart';
import type { OrbitChartHtmlColors } from '../../components/charts/lightweightChartHtml';
import type { OrbitChartMode, OrbitChartTimeframe } from '../../components/charts/chartData';
import { RouteRedirect } from '../../components/common/RouteRedirect';
import { FONT, RADII, withOpacity } from '../../constants/theme';
import { AstraEntryPoint } from '../../src/components/astra/AstraEntryPoint';
import { TradeDepthCard } from '../../src/components/trade/TradeDepthCard';
import { TradeMarketTabs } from '../../src/components/trade/TradeMarketTabs';
import { TradeOrderBookPanel } from '../../src/components/trade/TradeOrderBookPanel';
import { useAstra } from '../../src/hooks/useAstra';
import { useMarketData } from '../../src/hooks/useMarketData';
import { usePairChartData } from '../../src/hooks/usePairChartData';
import { useRealtimeCandles } from '../../src/hooks/useRealtimeCandles';
import { useRealtimeMarketFeed } from '../../src/hooks/useRealtimeMarketFeed';
import { useRealtimePrice } from '../../src/hooks/useRealtimePrice';
import { useProfileStore } from '../../src/store/profileStore';
import { useAuthStore } from '../../src/store/authStore';
import { useTradeStore } from '../../src/store/tradeStore';
import { useAstraStore } from '../../src/store/astraStore';
import type { TradePriceAlertDirection } from '../../src/types';
import { formatPercent } from '../../src/utils/formatPercent';
import {
  getTradeRealtimeStatusCopy,
  getTradeRealtimeStatusLabel,
} from '../../src/utils/tradeRealtimeUi';

const SURFACE_BACKGROUND = '#0B0B0F';
const SURFACE_CARD = '#111218';
const SURFACE_CARD_ALT = '#151722';
const SURFACE_BORDER = 'rgba(255,255,255,0.08)';
const SURFACE_BORDER_STRONG = 'rgba(255,255,255,0.14)';
const TEXT = '#FFFFFF';
const TEXT_MUTED = '#8E8EA0';
const TEXT_SOFT = '#C8C8D2';
const ACCENT = '#7B3FE4';
const BUY = '#00FFA3';
const SELL = '#FF4D4D';

const CHART_COLOR_OVERRIDES: Partial<OrbitChartHtmlColors> = {
  background: SURFACE_BACKGROUND,
  backgroundAlt: '#0F1016',
  text: TEXT,
  textMuted: TEXT_MUTED,
  border: SURFACE_BORDER,
  borderStrong: 'rgba(255,255,255,0.16)',
  grid: 'rgba(255,255,255,0.06)',
  gridStrong: withOpacity(ACCENT, 0.32),
  primary: ACCENT,
  profit: BUY,
  loss: SELL,
};

const PRIMARY_TIMEFRAMES: OrbitChartTimeframe[] = ['15m', '1h', '4h', '1D'];
const EXTRA_TIMEFRAMES: OrbitChartTimeframe[] = ['1m', '5m'];

type TradeChartTab = 'chart' | 'book' | 'trades' | 'info';

const TRADE_TABS: Array<{ key: TradeChartTab; label: string }> = [
  { key: 'chart', label: 'Grafico' },
  { key: 'book', label: 'Libro' },
  { key: 'trades', label: 'Trades' },
  { key: 'info', label: 'Info' },
];

function formatUsdPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: price >= 100 ? 1 : price >= 1 ? 2 : 4,
    maximumFractionDigits: price >= 100 ? 1 : price >= 1 ? 2 : 6,
  }).format(price);
}

function formatMetricValue(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatMiniPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: price >= 100 ? 1 : 2,
    maximumFractionDigits: price >= 100 ? 1 : 4,
  }).format(price);
}

function movingAverageValue(values: number[], period: number) {
  if (values.length < period) {
    return null;
  }
  const window = values.slice(-period);
  return window.reduce((sum, value) => sum + value, 0) / period;
}

function formatMarketTime(value: string) {
  try {
    return new Date(value).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '--:--:--';
  }
}

function buildInsight({
  symbol,
  currentPrice,
  change24h,
  orderBookDepth,
  chartStatus,
}: {
  symbol: string;
  currentPrice: number;
  change24h: number;
  orderBookDepth: number;
  chartStatus: string;
}) {
  const priceLabel = `USD ${formatUsdPrice(currentPrice)}`;
  const changeLabel = formatPercent(change24h);

  if (chartStatus !== 'live') {
    return `Estoy viendo ${symbol} en ${priceLabel}. Aun estamos afinando la lectura en vivo, asi que conviene validar estructura y liquidez antes de entrar.`;
  }

  if (change24h >= 2) {
    return `${symbol} viene con momentum positivo en ${changeLabel}. El libro ya muestra ${orderBookDepth} niveles visibles, asi que puedes vigilar continuidad o pullback limpio.`;
  }

  if (change24h <= -2) {
    return `${symbol} retrocede ${changeLabel} y sigue cotizando en ${priceLabel}. Yo miraria soporte inmediato y reaccion del libro antes de vender acelerado.`;
  }

  return `${symbol} se mantiene cerca de ${priceLabel} con una lectura mas balanceada. Esta es buena pantalla para revisar timing, volumen y profundidad sin ruido extra.`;
}

function ChartLoadingState() {
  return (
    <View style={styles.loadingShell}>
      <View style={styles.loadingAura} />
      <View style={styles.loadingRing} />
      <View style={styles.loadingRingInner} />
      <View style={styles.loadingBadge}>
        <Ionicons name="pulse-outline" size={24} color={ACCENT} />
      </View>
      <Text style={styles.loadingText}>Cargando grafico</Text>
      <Text style={styles.loadingSubtext}>
        OrbitX esta sincronizando velas, precio y profundidad.
      </Text>
    </View>
  );
}

export default function TradeChartScreen() {
  const { pairId, tokenId } = useLocalSearchParams<{ pairId?: string; tokenId?: string }>();
  const { width, height } = useWindowDimensions();
  const sessionStatus = useAuthStore((state) => state.session.status);
  const selectedPairId = useTradeStore((state) => state.selectedPairId);
  const priceAlerts = useTradeStore((state) => state.priceAlerts);
  const addPriceAlert = useTradeStore((state) => state.addPriceAlert);
  const removePriceAlert = useTradeStore((state) => state.removePriceAlert);
  const markPriceAlertTriggered = useTradeStore((state) => state.markPriceAlertTriggered);
  const favoritePairIds = useProfileStore((state) => state.favoritePairIds);
  const toggleFavoritePair = useProfileStore((state) => state.toggleFavoritePair);
  const { openAstra, language } = useAstra();
  const rememberAstraContext = useAstraStore((state) => state.rememberContext);
  const { markets, selectedPair, loading, selectPairById } = useMarketData('trade');
  const [timeframe, setTimeframe] = useState<OrbitChartTimeframe>('15m');
  const [showExtraTimeframes, setShowExtraTimeframes] = useState(false);
  const [mode, setMode] = useState<OrbitChartMode>('candles');
  const [showVolume, setShowVolume] = useState(true);
  const [showLoadingHero, setShowLoadingHero] = useState(false);
  const [chartResetKey, setChartResetKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TradeChartTab>('chart');
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
  const { history: fallbackHistory, loading: fallbackHistoryLoading } = usePairChartData(
    pair,
    timeframe,
  );
  const realtimePrice = useRealtimePrice(pair);
  const realtimeCandles = useRealtimeCandles(pair, timeframe, fallbackHistory);
  const realtimeFeed = useRealtimeMarketFeed(pair);
  const livePrice = realtimePrice.ticker?.price ?? pair?.price ?? 0;
  const chartHistory = realtimeCandles.history ?? fallbackHistory;
  const currentChange = realtimePrice.ticker?.change24h ?? pair?.change24h ?? 0;
  const high24h = realtimePrice.ticker?.high24h ?? pair?.high24h ?? 0;
  const low24h = realtimePrice.ticker?.low24h ?? pair?.low24h ?? 0;
  const volume24h = realtimePrice.ticker?.volume24h ?? pair?.volume24h ?? 0;
  const positive = currentChange >= 0;
  const chartHeight = isLandscape
    ? Math.max(height * 0.46, 260)
    : Math.min(Math.max(height * 0.34, 280), 380);
  const showChartLoading =
    loading || (!pair && fallbackHistoryLoading) || (!chartHistory && realtimeCandles.loading);
  const pairAlerts = useMemo(
    () => priceAlerts.filter((alert) => alert.pairId === pair?.id),
    [pair?.id, priceAlerts],
  );
  const recentTrades = realtimeFeed.recentTrades.slice(0, 10);
  const favorite = pair ? favoritePairIds.includes(pair.id) : false;
  const closeSeries =
    chartHistory?.candles?.length
      ? chartHistory.candles.map((item) => item.close)
      : chartHistory?.line.map((item) => item.value) ?? [];
  const ma5 = movingAverageValue(closeSeries, 5);
  const ma10 = movingAverageValue(closeSeries, 10);
  const ma30 = movingAverageValue(closeSeries, 30);
  const insight = pair
    ? buildInsight({
        symbol: pair.symbol,
        currentPrice: livePrice,
        change24h: currentChange,
        orderBookDepth: realtimeFeed.orderBook.length,
        chartStatus: realtimeCandles.status,
      })
    : '';

  const astraChartContext = useMemo(() => {
    if (!pair) {
      return null;
    }

    return {
      surface: 'trade' as const,
      path: '/trade/chart',
      language,
      screenName: language === 'en' ? 'Chart' : 'Grafico',
      summary: `Estas revisando ${pair.symbol} en la vista completa de grafico con profundidad, libro y trades del mercado.`,
      currentTask:
        activeTab === 'book'
          ? 'trade_order_book_review'
          : activeTab === 'trades'
            ? 'trade_tape_review'
            : activeTab === 'info'
              ? 'trade_market_info_review'
              : 'trade_chart_review',
      currentPairSymbol: pair.symbol,
      currentPriceLabel: `USD ${formatUsdPrice(livePrice)}`,
      selectedEntity: {
        type: 'trading_pair',
        id: pair.id,
        pair: pair.symbol,
        symbol: pair.baseSymbol,
        name: pair.baseSymbol,
      },
      uiState: {
        activeTradeTab: activeTab,
        activeTimeframe: timeframe,
        priceFeedStatus: realtimePrice.status,
        orderBookStatus: realtimeFeed.status,
        chartFeedStatus: realtimeCandles.status,
        orderBookDepth: realtimeFeed.orderBook.length,
        recentTradesCount: recentTrades.length,
        chartMode: mode,
        volumeVisible: showVolume,
        loading,
      },
      labels: {
        pairLabel: pair.symbol,
        currentPriceLabel: `USD ${formatUsdPrice(livePrice)}`,
        marketStateLabel: getTradeRealtimeStatusLabel(realtimePrice.status),
      },
    };
  }, [
    activeTab,
    language,
    livePrice,
    loading,
    mode,
    pair,
    recentTrades.length,
    realtimeCandles.status,
    realtimeFeed.orderBook.length,
    realtimeFeed.status,
    realtimePrice.status,
    showVolume,
    timeframe,
  ]);

  useEffect(() => {
    if (!astraChartContext) {
      return;
    }
    rememberAstraContext(astraChartContext);
  }, [astraChartContext, rememberAstraContext]);

  useEffect(() => {
    if (livePrice && !alertValue) {
      setAlertValue(String(livePrice.toFixed(livePrice >= 1 ? 2 : 6)));
    }
  }, [alertValue, livePrice]);

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
    if (!pair || !livePrice) {
      return;
    }

    pairAlerts
      .filter((alert) => !alert.triggeredAt)
      .forEach((alert) => {
        const crossed =
          alert.direction === 'above_or_equal'
            ? livePrice >= alert.targetPrice
            : livePrice <= alert.targetPrice;

        if (crossed) {
          markPriceAlertTriggered(alert.id, livePrice);
          setTriggeredBanner(
            `Alerta ${pair.symbol}: ${alert.direction === 'above_or_equal' ? '>= ' : '<= '}${alert.targetPrice}`,
          );
        }
      });
  }, [livePrice, markPriceAlertTriggered, pair, pairAlerts]);

  useEffect(() => {
    if (!triggeredBanner) {
      return;
    }
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

  function openAstraForChart() {
    openAstra({
      ...(astraChartContext ?? {}),
      surfaceTitle: language === 'en' ? 'Chart' : 'Grafico',
    });
  }

  function handleCreateAlert(direction: TradePriceAlertDirection) {
    if (!pair) {
      return;
    }

    const parsedValue = Number(alertValue.replace(',', '.'));
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setTriggeredBanner('Ingresa un precio valido para crear la alerta.');
      return;
    }

    addPriceAlert(pair.id, direction, parsedValue);
    setTriggeredBanner(
      `Alerta creada ${direction === 'above_or_equal' ? '>= ' : '<= '}${parsedValue}`,
    );
  }

  function renderTradesCard() {
    return (
      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>Trades recientes</Text>
            <Text style={styles.panelSubtitle}>
              Cinta compacta para leer ejecucion sin perder el foco del grafico.
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                borderColor: withOpacity(ACCENT, 0.28),
                backgroundColor: withOpacity(ACCENT, 0.12),
              },
            ]}
          >
            <Text style={styles.statusPillLabel}>
              {getTradeRealtimeStatusLabel(realtimeFeed.status)}
            </Text>
          </View>
        </View>

        <View style={styles.tradeTableHeader}>
          <Text style={styles.tradeHeaderCell}>Precio</Text>
          <Text style={styles.tradeHeaderCellCenter}>Cantidad</Text>
          <Text style={styles.tradeHeaderCellRight}>Hora</Text>
        </View>

        {recentTrades.length ? (
          recentTrades.map((trade) => (
            <View key={trade.id} style={styles.tradeRow}>
              <Text
                style={[styles.tradePrice, { color: trade.side === 'buy' ? BUY : SELL }]}
              >
                {formatMiniPrice(trade.price)}
              </Text>
              <Text style={styles.tradeCellCenter}>{trade.quantity.toFixed(4)}</Text>
              <Text style={styles.tradeCellRight}>{formatMarketTime(trade.time)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin trades visibles</Text>
            <Text style={styles.emptyBody}>
              {realtimeFeed.error || 'OrbitX esta esperando nueva actividad para esta cinta.'}
            </Text>
          </View>
        )}
      </View>
    );
  }

  function renderInfoCard() {
    return (
      <View style={styles.panelStack}>
        <View style={styles.panelCard}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Info de mercado</Text>
              <Text style={styles.panelSubtitle}>
                Resumen limpio del estado actual sin exponer detalles tecnicos del proveedor.
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                {
                  borderColor: withOpacity(ACCENT, 0.28),
                  backgroundColor: withOpacity(ACCENT, 0.12),
                },
              ]}
            >
              <Text style={styles.statusPillLabel}>
                {getTradeRealtimeStatusLabel(realtimePrice.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Precio actual</Text>
              <Text style={styles.infoValue}>USD {formatUsdPrice(livePrice)}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Cambio 24h</Text>
              <Text
                style={[styles.infoValue, { color: positive ? BUY : SELL }]}
              >
                {formatPercent(currentChange)}
              </Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Max 24h</Text>
              <Text style={styles.infoValue}>{formatMiniPrice(high24h)}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Volumen</Text>
              <Text style={styles.infoValue}>{formatMetricValue(volume24h)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.panelCard}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Alertas</Text>
              <Text style={styles.panelSubtitle}>
                Guarda un precio clave y deja que OrbitX te avise cuando el mercado lo toque.
              </Text>
            </View>
          </View>

          <View style={styles.alertComposer}>
            <TextInput
              value={alertValue}
              onChangeText={setAlertValue}
              keyboardType="decimal-pad"
              placeholder="Ej: 68450"
              placeholderTextColor={withOpacity(TEXT_MUTED, 0.78)}
              style={styles.alertInput}
            />
            <View style={styles.alertActionRow}>
              <Pressable
                onPress={() => handleCreateAlert('above_or_equal')}
                style={[styles.alertButton, styles.alertButtonBuy]}
              >
                <Text style={styles.alertButtonLabel}>Mayor o igual</Text>
              </Pressable>
              <Pressable
                onPress={() => handleCreateAlert('below_or_equal')}
                style={[styles.alertButton, styles.alertButtonSell]}
              >
                <Text style={styles.alertButtonLabel}>Menor o igual</Text>
              </Pressable>
            </View>
          </View>

          {pairAlerts.length ? (
            <View style={styles.alertList}>
              {pairAlerts.slice(0, 2).map((alert) => (
                <View key={alert.id} style={styles.alertRow}>
                  <View style={styles.alertCopy}>
                    <Text style={styles.alertRowTitle}>
                      {alert.direction === 'above_or_equal' ? '>= ' : '<= '}
                      {formatMiniPrice(alert.targetPrice)}
                    </Text>
                    <Text style={styles.alertRowMeta}>
                      {alert.triggeredAt
                        ? `Activada ${new Date(alert.triggeredAt).toLocaleTimeString('es-PE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : 'Activa y escuchando precio real'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => removePriceAlert(alert.id)}
                    style={styles.alertRemoveButton}
                  >
                    <Ionicons name="close" size={16} color={TEXT_MUTED} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  function renderChartPanel() {
    return (
      <View style={styles.panelStack}>
        <TradeDepthCard rows={realtimeFeed.orderBook} currentPrice={livePrice} />

        <LinearGradient
          colors={[withOpacity('#171923', 0.98), withOpacity('#11131C', 0.98)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.astraCard}
        >
          <View style={styles.astraHeader}>
            <AstraEntryPoint
              onPress={openAstraForChart}
              size={38}
              accessibilityLabel="Abrir Astra desde el grafico"
            />
            <View style={styles.astraCopy}>
              <Text style={styles.astraTitle}>Astra</Text>
              <Text style={styles.astraSubtitle}>Lectura contextual</Text>
            </View>
            <Pressable onPress={openAstraForChart} style={styles.astraAction}>
              <Ionicons name="arrow-forward" size={14} color={TEXT} />
            </Pressable>
          </View>
          <Text style={styles.astraBody}>{insight}</Text>
        </LinearGradient>
      </View>
    );
  }

  function renderActivePanel() {
    if (!pair) {
      return null;
    }

    if (activeTab === 'book') {
      return (
        <TradeOrderBookPanel
          rows={realtimeFeed.orderBook}
          status={realtimeFeed.status}
          statusLabel={getTradeRealtimeStatusLabel(realtimeFeed.status)}
          statusCopy={getTradeRealtimeStatusCopy(realtimeFeed.status)}
          error={realtimeFeed.error}
          currentPrice={livePrice}
          onPickPrice={(priceValue) =>
            router.replace({
              pathname: '/spot',
              params: { pairId: pair.id, price: String(priceValue) },
            })
          }
        />
      );
    }

    if (activeTab === 'trades') {
      return renderTradesCard();
    }

    if (activeTab === 'info') {
      return renderInfoCard();
    }

    return renderChartPanel();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <LinearGradient
          colors={[withOpacity(ACCENT, 0.16), 'transparent', withOpacity(ACCENT, 0.05)]}
          start={{ x: 0.12, y: 0.02 }}
          end={{ x: 0.88, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.backgroundRing} />
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, isLandscape ? styles.contentLandscape : null]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={18} color={TEXT} />
          </Pressable>

          <View style={styles.headerMain}>
            <View style={styles.pairRow}>
              <Text style={styles.pairLabel}>{pair?.symbol ?? 'BTC/USDT'}</Text>
              <View style={styles.marketBadge}>
                <Text style={styles.marketBadgeLabel}>Spot</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>USD {formatUsdPrice(livePrice)}</Text>
              <Text style={[styles.changeValue, { color: positive ? BUY : SELL }]}>
                {formatPercent(currentChange)}
              </Text>
            </View>

            <Text style={styles.secondaryLine}>
              {pair?.coin.name ?? 'Bitcoin'} · {getTradeRealtimeStatusLabel(realtimePrice.status)}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => pair && toggleFavoritePair(pair.id)}
              style={styles.iconButton}
            >
              <Ionicons
                name={favorite ? 'star' : 'star-outline'}
                size={16}
                color={favorite ? '#FFC857' : TEXT_MUTED}
              />
            </Pressable>
            <Pressable onPress={openAstraForChart} style={styles.iconButton}>
              <Ionicons name="sparkles-outline" size={16} color={TEXT} />
            </Pressable>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>24h High</Text>
            <Text style={styles.metricValue}>{formatMiniPrice(high24h)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>24h Low</Text>
            <Text style={styles.metricValue}>{formatMiniPrice(low24h)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Vol 24h</Text>
            <Text style={styles.metricValue}>{formatMetricValue(volume24h)}</Text>
          </View>
        </View>

        <TradeMarketTabs value={activeTab} tabs={TRADE_TABS} onChange={setActiveTab} />

        <LinearGradient
          colors={[withOpacity('#171923', 0.98), withOpacity('#0E0F15', 0.98)]}
          start={{ x: 0.08, y: 0 }}
          end={{ x: 0.92, y: 1 }}
          style={styles.chartCard}
        >
          <View style={styles.chartToolbar}>
            <View style={styles.timeframeGroup}>
              {PRIMARY_TIMEFRAMES.map((item) => {
                const active = timeframe === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setTimeframe(item);
                      setShowExtraTimeframes(false);
                    }}
                    style={[
                      styles.timeframeChip,
                      {
                        backgroundColor: active ? withOpacity(ACCENT, 0.16) : 'transparent',
                        borderColor: active
                          ? withOpacity(ACCENT, 0.38)
                          : 'rgba(255,255,255,0.07)',
                      },
                    ]}
                  >
                    <Text style={[styles.timeframeLabel, { color: active ? TEXT : TEXT_MUTED }]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                onPress={() => setShowExtraTimeframes((value) => !value)}
                style={[
                  styles.timeframeChip,
                  {
                    backgroundColor: showExtraTimeframes
                      ? withOpacity(ACCENT, 0.16)
                      : 'transparent',
                    borderColor: showExtraTimeframes
                      ? withOpacity(ACCENT, 0.38)
                      : 'rgba(255,255,255,0.07)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timeframeLabel,
                    { color: showExtraTimeframes ? TEXT : TEXT_MUTED },
                  ]}
                >
                  Mas
                </Text>
              </Pressable>
            </View>

            <View style={styles.liveBadge}>
              <View
                style={[
                  styles.liveDot,
                  {
                    backgroundColor:
                      realtimePrice.status === 'live'
                        ? BUY
                        : realtimePrice.status === 'error'
                          ? SELL
                          : ACCENT,
                  },
                ]}
              />
              <Text style={styles.liveBadgeLabel}>
                {getTradeRealtimeStatusLabel(realtimePrice.status)}
              </Text>
            </View>
          </View>

          {showExtraTimeframes ? (
            <View style={styles.extraTimeframeRow}>
              {EXTRA_TIMEFRAMES.map((item) => {
                const active = timeframe === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setTimeframe(item)}
                    style={[
                      styles.extraTimeframeChip,
                      {
                        backgroundColor: active ? withOpacity(ACCENT, 0.15) : 'transparent',
                        borderColor: active
                          ? withOpacity(ACCENT, 0.32)
                          : 'rgba(255,255,255,0.07)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.extraTimeframeLabel,
                        { color: active ? TEXT : TEXT_MUTED },
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <View style={styles.toolRow}>
            {[
              { key: 'candles', label: 'Velas' },
              { key: 'line', label: 'Linea' },
            ].map((item) => {
              const active = mode === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setMode(item.key as OrbitChartMode)}
                  style={[
                    styles.toolChip,
                    {
                      backgroundColor: active ? withOpacity(ACCENT, 0.16) : 'transparent',
                      borderColor: active
                        ? withOpacity(ACCENT, 0.34)
                        : 'rgba(255,255,255,0.07)',
                    },
                  ]}
                >
                  <Text style={[styles.toolChipLabel, { color: active ? TEXT : TEXT_MUTED }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setShowVolume((value) => !value)}
              style={[
                styles.toolChip,
                {
                  backgroundColor: showVolume ? withOpacity(ACCENT, 0.16) : 'transparent',
                  borderColor: showVolume
                    ? withOpacity(ACCENT, 0.34)
                    : 'rgba(255,255,255,0.07)',
                },
              ]}
            >
              <Text style={[styles.toolChipLabel, { color: showVolume ? TEXT : TEXT_MUTED }]}>
                Vol
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setChartResetKey((value) => value + 1)}
              style={styles.toolChip}
            >
              <Text style={[styles.toolChipLabel, { color: TEXT_MUTED }]}>Ajustar</Text>
            </Pressable>
          </View>

          <View style={styles.chartMetaRow}>
            <Text style={styles.maLabel}>MA5 {ma5 ? formatMiniPrice(ma5) : '--'}</Text>
            <Text style={[styles.maLabel, { color: '#58A6FF' }]}>
              MA10 {ma10 ? formatMiniPrice(ma10) : '--'}
            </Text>
            <Text style={[styles.maLabel, { color: '#C58BFF' }]}>
              MA30 {ma30 ? formatMiniPrice(ma30) : '--'}
            </Text>
          </View>

          <View style={styles.chartFrame}>
            {showChartLoading ? (
              showLoadingHero ? (
                <ChartLoadingState />
              ) : (
                <View style={styles.quickLoadingState}>
                  <Text style={styles.quickLoadingTitle}>Sincronizando grafico</Text>
                  <Text style={styles.quickLoadingBody}>
                    OrbitX esta preparando la ultima lectura del mercado.
                  </Text>
                </View>
              )
            ) : (
              <OrbitLightweightChart
                key={`${pair?.id ?? 'pair'}-${timeframe}-${chartResetKey}`}
                history={chartHistory}
                timeframe={timeframe}
                mode={mode}
                indicators={['MA']}
                interactive
                showVolume={showVolume}
                height={chartHeight}
                colorOverrides={CHART_COLOR_OVERRIDES}
                emptyTitle="Grafico no disponible"
                emptyBody="Aun no recibimos suficientes velas verificadas para este par."
              />
            )}
          </View>
        </LinearGradient>

        {renderActivePanel()}

        {triggeredBanner ? (
          <View style={styles.bannerShell}>
            <Ionicons name="notifications" size={14} color={ACCENT} />
            <Text style={styles.bannerLabel}>{triggeredBanner}</Text>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <Pressable
            onPress={() =>
              pair &&
              router.replace({
                pathname: '/spot',
                params: { pairId: pair.id, side: 'buy' },
              })
            }
            style={styles.footerButton}
          >
            <LinearGradient
              colors={[withOpacity(BUY, 0.96), withOpacity(BUY, 0.76)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.footerButtonTextDark}>Comprar</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              pair &&
              router.replace({
                pathname: '/spot',
                params: { pairId: pair.id, side: 'sell' },
              })
            }
            style={styles.footerButton}
          >
            <LinearGradient
              colors={[withOpacity(SELL, 0.96), withOpacity(SELL, 0.78)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.footerButtonTextLight}>Vender</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SURFACE_BACKGROUND,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  backgroundRing: {
    position: 'absolute',
    top: 92,
    right: -92,
    width: 280,
    height: 280,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.16),
    opacity: 0.75,
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
  },
  contentLandscape: {
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMain: {
    flex: 1,
    gap: 4,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pairLabel: {
    color: TEXT,
    fontFamily: FONT.bold,
    fontSize: 24,
    lineHeight: 28,
  },
  marketBadge: {
    minHeight: 22,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketBadgeLabel: {
    color: TEXT_SOFT,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
  },
  priceValue: {
    color: TEXT,
    fontFamily: FONT.bold,
    fontSize: 22,
    lineHeight: 26,
  },
  changeValue: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryLine: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: 84,
    backgroundColor: SURFACE_CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  metricLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  metricValue: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  chartCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: SURFACE_BORDER_STRONG,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    overflow: 'hidden',
  },
  chartToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  timeframeGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  timeframeChip: {
    minHeight: 34,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeframeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  liveBadge: {
    minHeight: 30,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.32),
    backgroundColor: withOpacity(ACCENT, 0.12),
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
  },
  liveBadgeLabel: {
    color: TEXT,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  extraTimeframeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  extraTimeframeChip: {
    minHeight: 32,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraTimeframeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  toolRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  toolChip: {
    minHeight: 32,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.07)',
  },
  toolChipLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  chartMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  maLabel: {
    color: '#F6D365',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  chartFrame: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: SURFACE_BACKGROUND,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  loadingShell: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    overflow: 'hidden',
    backgroundColor: SURFACE_BACKGROUND,
  },
  loadingAura: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: withOpacity(ACCENT, 0.12),
  },
  loadingRing: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.24),
    opacity: 0.74,
  },
  loadingRingInner: {
    position: 'absolute',
    width: 214,
    height: 214,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.14),
    opacity: 0.76,
  },
  loadingBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.26),
    backgroundColor: withOpacity(SURFACE_CARD_ALT, 0.92),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 16,
    marginTop: 2,
  },
  loadingSubtext: {
    color: TEXT_SOFT,
    maxWidth: 260,
    textAlign: 'center',
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  quickLoadingState: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
    backgroundColor: SURFACE_BACKGROUND,
  },
  quickLoadingTitle: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  quickLoadingBody: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  panelStack: {
    gap: 12,
  },
  panelCard: {
    backgroundColor: SURFACE_CARD,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  panelTitle: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  panelSubtitle: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
    maxWidth: 250,
  },
  statusPill: {
    minHeight: 28,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillLabel: {
    color: TEXT,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  tradeTableHeader: {
    flexDirection: 'row',
    gap: 8,
  },
  tradeHeaderCell: {
    flex: 1,
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  tradeHeaderCellCenter: {
    flex: 1,
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
    textAlign: 'center',
  },
  tradeHeaderCellRight: {
    flex: 1,
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
    textAlign: 'right',
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
  tradeCellCenter: {
    flex: 1,
    color: TEXT_SOFT,
    fontFamily: FONT.medium,
    fontSize: 11,
    textAlign: 'center',
  },
  tradeCellRight: {
    flex: 1,
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
    textAlign: 'right',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoCell: {
    width: '47%',
    backgroundColor: SURFACE_CARD_ALT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  infoLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  infoValue: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 17,
  },
  alertComposer: {
    gap: 10,
  },
  alertInput: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 14,
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  alertActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  alertButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonBuy: {
    borderColor: withOpacity(BUY, 0.32),
    backgroundColor: withOpacity(BUY, 0.08),
  },
  alertButtonSell: {
    borderColor: withOpacity(SELL, 0.32),
    backgroundColor: withOpacity(SELL, 0.08),
  },
  alertButtonLabel: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  alertList: {
    gap: 8,
  },
  alertRow: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  alertCopy: {
    flex: 1,
    gap: 3,
  },
  alertRowTitle: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  alertRowMeta: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 10,
  },
  alertRemoveButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  astraCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.24),
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  astraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  astraCopy: {
    flex: 1,
    gap: 2,
  },
  astraTitle: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  astraSubtitle: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  astraAction: {
    width: 32,
    height: 32,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.28),
    backgroundColor: withOpacity(ACCENT, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  astraBody: {
    color: TEXT_SOFT,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyState: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 8,
  },
  emptyTitle: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  emptyBody: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  bannerShell: {
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.28),
    backgroundColor: withOpacity(ACCENT, 0.12),
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerLabel: {
    flex: 1,
    color: TEXT,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 2,
  },
  footerButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonTextDark: {
    color: '#06110D',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  footerButtonTextLight: {
    color: TEXT,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
});
