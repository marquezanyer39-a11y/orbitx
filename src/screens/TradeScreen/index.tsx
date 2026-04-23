import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { OrbitLightweightChart } from '../../../components/charts/OrbitLightweightChart';
import type { OrbitChartHtmlColors } from '../../../components/charts/lightweightChartHtml';
import type { OrbitChartTimeframe } from '../../../components/charts/chartData';
import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AstraEntryPoint } from '../../components/astra/AstraEntryPoint';
import { TradeActionPanel } from '../../components/trade/TradeActionPanel';
import { TradeDepthCard } from '../../components/trade/TradeDepthCard';
import { TradeMarketTabs } from '../../components/trade/TradeMarketTabs';
import { TradeOrderBookPanel } from '../../components/trade/TradeOrderBookPanel';
import { useAstra } from '../../hooks/useAstra';
import { useMarketData } from '../../hooks/useMarketData';
import { usePairChartData } from '../../hooks/usePairChartData';
import { useRealtimeCandles } from '../../hooks/useRealtimeCandles';
import { useRealtimeMarketFeed } from '../../hooks/useRealtimeMarketFeed';
import { useRealtimePrice } from '../../hooks/useRealtimePrice';
import { useTradeForm } from '../../hooks/useTradeForm';
import { useProfileStore } from '../../store/profileStore';
import { useAstraStore } from '../../store/astraStore';
import { formatPercent } from '../../utils/formatPercent';

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

type TradeSurfaceTab = 'chart' | 'book' | 'trades' | 'info';

const TRADE_SURFACE_TABS: Array<{ key: TradeSurfaceTab; label: string }> = [
  { key: 'chart', label: 'Grafico' },
  { key: 'book', label: 'Libro de ordenes' },
  { key: 'trades', label: 'Trades' },
  { key: 'info', label: 'Info' },
];

function formatUsdPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: price >= 100 ? 1 : price >= 1 ? 2 : 4,
    maximumFractionDigits: price >= 100 ? 1 : price >= 1 ? 2 : 6,
  }).format(price);
}

function formatCompactValue(value: number) {
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

function getStatusAccent(status: string) {
  if (status === 'live') {
    return BUY;
  }
  if (status === 'connecting' || status === 'reconnecting') {
    return ACCENT;
  }
  if (status === 'error') {
    return SELL;
  }
  return TEXT_MUTED;
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
    return `Estoy viendo ${symbol} en ${priceLabel}. El chart aun no esta plenamente live, asi que tomaria la lectura con mas calma hasta que se estabilice.`;
  }

  if (change24h >= 2) {
    return `${symbol} viene con momentum positivo en ${changeLabel}. Hay ${orderBookDepth} niveles cargados en el libro, asi que puedes revisar si prefieres entrar en pullback o seguir la fuerza.`;
  }

  if (change24h <= -2) {
    return `${symbol} retrocede ${changeLabel} y sigue cotizando en ${priceLabel}. Yo miraria soporte inmediato y absorcion en compras antes de buscar una entrada agresiva.`;
  }

  return `${symbol} esta operando cerca de ${priceLabel} con una lectura mas balanceada. El libro muestra ${orderBookDepth} niveles visibles, asi que esta buena pantalla para vigilar liquidez y timing de entrada.`;
}

export default function TradeScreen() {
  const params = useLocalSearchParams<{
    pairId?: string;
    tokenId?: string;
    side?: 'buy' | 'sell';
  }>();
  const { width } = useWindowDimensions();
  const { selectedPair, loading, error, selectPairById, refreshSelectedPair } =
    useMarketData('trade');
  const trade = useTradeForm();
  const [timeframe, setTimeframe] = useState<OrbitChartTimeframe>('15m');
  const [surfaceTab, setSurfaceTab] = useState<TradeSurfaceTab>('chart');
  const [showExtraTimeframes, setShowExtraTimeframes] = useState(false);
  const favoritePairIds = useProfileStore((state) => state.favoritePairIds);
  const toggleFavoritePair = useProfileStore((state) => state.toggleFavoritePair);
  const { openAstra, language } = useAstra();
  const rememberAstraContext = useAstraStore((state) => state.rememberContext);
  const recordAstraError = useAstraStore((state) => state.recordError);

  const {
    selectedPairId,
    openOrders,
    recentOrders,
    orderType,
    price,
    quantity,
    total,
    stopPrice,
    feeEstimate,
    availableQuote,
    availableBase,
    quickPercent,
    setSide,
    setOrderType,
    setSelectedPairId,
    setPrice,
    setQuantity,
    setTotal,
    setStopPrice,
    applyPercent,
    submitOrderSimulationForSide,
  } = trade;

  useEffect(() => {
    const resolvedPairId = params.pairId || params.tokenId || selectedPairId;
    if (!resolvedPairId || resolvedPairId === selectedPair?.id) {
      return;
    }
    void selectPairById(resolvedPairId);
  }, [params.pairId, params.tokenId, selectPairById, selectedPair?.id, selectedPairId]);

  useEffect(() => {
    if (params.side === 'buy' || params.side === 'sell') {
      setSide(params.side);
    }
  }, [params.side, setSide]);

  useEffect(() => {
    const nextPairId = selectedPair?.id;
    if (!nextPairId) {
      return;
    }
    if (nextPairId !== selectedPairId) {
      setSelectedPairId(nextPairId);
    }
  }, [selectedPair?.id, selectedPairId, setSelectedPairId]);

  const pair = selectedPair;
  const { history: fallbackHistory } = usePairChartData(pair, timeframe);
  const realtimeTicker = useRealtimePrice(pair, Boolean(pair));
  const realtimeCandles = useRealtimeCandles(pair, timeframe, fallbackHistory, Boolean(pair));
  const realtimeFeed = useRealtimeMarketFeed(pair, Boolean(pair));
  const livePrice = realtimeTicker.ticker?.price ?? pair?.price ?? 0;
  const chartHistory = realtimeCandles.history ?? fallbackHistory;
  const recentTrades = useMemo(
    () => [...recentOrders, ...realtimeFeed.recentTrades].slice(0, 14),
    [recentOrders, realtimeFeed.recentTrades],
  );
  const favorite = pair ? favoritePairIds.includes(pair.id) : false;
  const activeTabTask =
    surfaceTab === 'chart'
      ? 'trade_chart_review'
      : surfaceTab === 'book'
        ? 'trade_order_book_review'
        : surfaceTab === 'trades'
          ? 'trade_tape_review'
          : 'trade_market_info_review';

  const astraTradeContext = useMemo(() => {
    if (!pair) {
      return null;
    }

    const currentPriceLabel = `USD ${formatUsdPrice(livePrice)}`;
    const summary =
      surfaceTab === 'book'
        ? `Estas revisando ${pair.symbol} con foco en libro de ordenes y profundidad.`
        : surfaceTab === 'trades'
          ? `Estas revisando ${pair.symbol} con foco en la cinta de trades y ejecucion.`
          : surfaceTab === 'info'
            ? `Estas revisando ${pair.symbol} con foco en informacion de mercado y contexto operativo.`
            : `Estas en ${pair.symbol} con chart real, libro en vivo y panel de ejecucion listo para operar.`;

    return {
      surface: 'trade' as const,
      path: '/spot',
      language,
      screenName: language === 'en' ? 'Trade' : 'Operar',
      summary,
      currentTask: activeTabTask,
      currentPairSymbol: pair.symbol,
      currentPriceLabel,
      selectedEntity: {
        type: 'trading_pair',
        id: pair.id,
        pair: pair.symbol,
        symbol: pair.baseSymbol,
        name: pair.baseSymbol,
      },
      uiState: {
        activeTradeTab: surfaceTab,
        activeTimeframe: timeframe,
        priceFeedStatus: realtimeTicker.status,
        priceSourceLabel: realtimeTicker.sourceLabel,
        orderBookStatus: realtimeFeed.status,
        orderBookSourceLabel: realtimeFeed.sourceLabel,
        chartFeedStatus: realtimeCandles.status,
        chartSourceLabel: realtimeCandles.sourceLabel,
        orderBookDepth: realtimeFeed.orderBook.length,
        recentTradesCount: recentTrades.length,
        tradeFormReady: true,
        loading,
      },
      labels: {
        currentPriceLabel,
        pairLabel: pair.symbol,
        priceFeedLabel: realtimeTicker.sourceLabel,
        orderBookLabel: realtimeFeed.sourceLabel,
        chartFeedLabel: realtimeCandles.sourceLabel,
      },
      errorBody: error ?? undefined,
    };
  }, [
    activeTabTask,
    error,
    language,
    livePrice,
    loading,
    pair,
    recentTrades.length,
    realtimeCandles.sourceLabel,
    realtimeCandles.status,
    realtimeFeed.orderBook.length,
    realtimeFeed.sourceLabel,
    realtimeFeed.status,
    realtimeTicker.sourceLabel,
    realtimeTicker.status,
    surfaceTab,
    timeframe,
  ]);

  useEffect(() => {
    if (!astraTradeContext) {
      return;
    }
    rememberAstraContext(astraTradeContext);
  }, [astraTradeContext, rememberAstraContext]);

  useEffect(() => {
    if (!error) {
      return;
    }
    recordAstraError({
      surface: 'trade',
      title: language === 'en' ? 'Trade issue' : 'Problema en Operar',
      body: error,
      linkedGuideId: 'resolve_error',
    });
  }, [error, language, recordAstraError]);

  useEffect(() => {
    if (!pair || price) {
      return;
    }
    const nextPrice = livePrice || pair.price;
    if (nextPrice > 0) {
      setPrice(String(nextPrice));
    }
  }, [livePrice, pair, price, setPrice]);

  if (loading && !pair) {
    return (
      <ScreenContainer backgroundMode="plain">
        <LoadingState
          title="Abriendo Trade"
          body="Estamos preparando el par, el chart real y la mesa de ejecucion."
        />
      </ScreenContainer>
    );
  }

  if (error && !pair) {
    return (
      <ScreenContainer backgroundMode="plain">
        <ErrorState body={error} onRetry={() => void refreshSelectedPair()} />
      </ScreenContainer>
    );
  }

  if (!pair) {
    return (
      <ScreenContainer backgroundMode="plain">
        <ErrorState
          body="No encontramos este par de trading."
          onRetry={() => void refreshSelectedPair()}
        />
      </ScreenContainer>
    );
  }

  const activePairId = pair.id;
  const currentTicker = realtimeTicker.ticker;
  const currentChange = currentTicker?.change24h ?? pair.change24h;
  const high24h = currentTicker?.high24h ?? pair.high24h;
  const low24h = currentTicker?.low24h ?? pair.low24h;
  const volume24h = currentTicker?.volume24h ?? pair.volume24h;
  const positive = currentChange >= 0;
  const headerPriceLabel = `USD ${formatUsdPrice(livePrice)}`;
  const chartHeight = Math.min(Math.max(width * 0.82, 320), 420);
  const closeSeries =
    chartHistory?.candles?.length
      ? chartHistory.candles.map((item) => item.close)
      : chartHistory?.line.map((item) => item.value) ?? [];
  const ma5 = movingAverageValue(closeSeries, 5);
  const ma10 = movingAverageValue(closeSeries, 10);
  const ma30 = movingAverageValue(closeSeries, 30);
  const insight = buildInsight({
    symbol: pair.symbol,
    currentPrice: livePrice,
    change24h: currentChange,
    orderBookDepth: realtimeFeed.orderBook.length,
    chartStatus: realtimeCandles.status,
  });
  const topStats = [
    { label: '24h High', value: formatMiniPrice(high24h) },
    { label: '24h Low', value: formatMiniPrice(low24h) },
    { label: 'Vol 24h', value: formatCompactValue(volume24h) },
  ];
  const infoStats = [
    { label: 'Precio actual', value: headerPriceLabel },
    { label: 'Cambio 24h', value: formatPercent(currentChange), tone: positive ? BUY : SELL },
    { label: 'Fuente ticker', value: realtimeTicker.sourceLabel },
    { label: 'Fuente chart', value: realtimeCandles.sourceLabel },
    { label: 'Libro', value: realtimeFeed.sourceLabel },
    { label: 'Open orders', value: String(openOrders.length) },
  ];

  function openAstraForTrade() {
    openAstra({
      ...(astraTradeContext ?? {}),
      surfaceTitle: language === 'en' ? 'Trade' : 'Operar',
    });
  }

  function renderTradesPanel() {
    return (
      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>Trades en vivo</Text>
            <Text style={styles.panelSubtitle}>
              Cinta reciente combinada con la actividad live y tus ultimas ejecuciones.
            </Text>
          </View>
          <View
            style={[
              styles.panelPill,
              {
                borderColor: withOpacity(getStatusAccent(realtimeFeed.status), 0.32),
                backgroundColor: withOpacity(getStatusAccent(realtimeFeed.status), 0.12),
              },
            ]}
          >
            <Text style={styles.panelPillLabel}>{realtimeFeed.sourceLabel}</Text>
          </View>
        </View>

        <View style={styles.tradeTableHeader}>
          <Text style={styles.tradeHeaderCell}>Precio</Text>
          <Text style={styles.tradeHeaderCellCenter}>Cantidad</Text>
          <Text style={styles.tradeHeaderCellRight}>Hora</Text>
        </View>

        {recentTrades.length ? (
          recentTrades.map((tradeRow) => (
            <View key={tradeRow.id} style={styles.tradeRow}>
              <Text
                style={[
                  styles.tradePrice,
                  { color: tradeRow.side === 'buy' ? BUY : SELL },
                ]}
              >
                {formatMiniPrice(tradeRow.price)}
              </Text>
              <Text style={styles.tradeCellCenter}>{tradeRow.quantity.toFixed(4)}</Text>
              <Text style={styles.tradeCellRight}>{formatMarketTime(tradeRow.time)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyPanelState}>
            <Text style={styles.emptyPanelTitle}>Sin trades visibles</Text>
            <Text style={styles.emptyPanelBody}>
              OrbitX mostrara la cinta de operaciones cuando el feed vuelva a entrar en ritmo.
            </Text>
          </View>
        )}
      </View>
    );
  }

  function renderInfoPanel() {
    return (
      <View style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>Info de mercado</Text>
            <Text style={styles.panelSubtitle}>
              Lectura rapida del par, las fuentes activas y el estado del modulo.
            </Text>
          </View>
          <Pressable
            onPress={() =>
              router.push({ pathname: '/trade/chart', params: { pairId: activePairId } })
            }
            style={styles.infoAction}
          >
            <Ionicons name="expand-outline" size={14} color={TEXT} />
            <Text style={styles.infoActionLabel}>Expandir</Text>
          </Pressable>
        </View>

        <View style={styles.infoGrid}>
          {infoStats.map((item) => (
            <View key={item.label} style={styles.infoCell}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={[styles.infoValue, item.tone ? { color: item.tone } : null]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  function renderSurfacePanel() {
    if (surfaceTab === 'book') {
      return (
        <View style={styles.panelStack}>
          <TradeOrderBookPanel
            rows={realtimeFeed.orderBook}
            status={realtimeFeed.status}
            statusLabel={realtimeFeed.sourceLabel}
            error={realtimeFeed.error}
            currentPrice={livePrice}
            onPickPrice={(nextPrice) => {
              setOrderType('limit');
              setPrice(String(nextPrice));
            }}
          />
          <TradeDepthCard rows={realtimeFeed.orderBook} currentPrice={livePrice} />
        </View>
      );
    }

    if (surfaceTab === 'trades') {
      return renderTradesPanel();
    }

    if (surfaceTab === 'info') {
      return (
        <View style={styles.panelStack}>
          {renderInfoPanel()}
          <TradeDepthCard rows={realtimeFeed.orderBook} currentPrice={livePrice} />
        </View>
      );
    }

    return (
      <View style={styles.panelStack}>
        <TradeOrderBookPanel
          rows={realtimeFeed.orderBook}
          status={realtimeFeed.status}
          statusLabel={realtimeFeed.sourceLabel}
          error={realtimeFeed.error}
          currentPrice={livePrice}
          preview
          onPickPrice={(nextPrice) => {
            setOrderType('limit');
            setPrice(String(nextPrice));
          }}
        />
        <TradeDepthCard rows={realtimeFeed.orderBook} currentPrice={livePrice} />
      </View>
    );
  }

  return (
    <ScreenContainer
      backgroundMode="plain"
      contentContainerStyle={styles.screenContent}
    >
      <View style={styles.screen}>
        <View style={styles.headerShell}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={20} color={TEXT} />
            </Pressable>

            <View style={styles.headerMain}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/pair-selector', params: { pairId: activePairId } })
                }
                style={styles.pairRow}
              >
                <Text style={styles.pairLabel}>{pair.symbol}</Text>
                <View style={styles.marketBadge}>
                  <Text style={styles.marketBadgeLabel}>Spot</Text>
                </View>
                <Ionicons name="chevron-down" size={14} color={TEXT_MUTED} />
              </Pressable>

              <View style={styles.priceRow}>
                <Text style={styles.priceValue}>{headerPriceLabel}</Text>
                <Text style={[styles.changeValue, { color: positive ? BUY : SELL }]}>
                  {formatPercent(currentChange)}
                </Text>
              </View>

              <Text style={styles.secondaryLine}>
                {pair.coin.name} · {realtimeTicker.sourceLabel}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                onPress={() => toggleFavoritePair(activePairId)}
                style={styles.iconButton}
              >
                <Ionicons
                  name={favorite ? 'star' : 'star-outline'}
                  size={16}
                  color={favorite ? '#FFC857' : TEXT_MUTED}
                />
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/trade/chart', params: { pairId: activePairId } })
                }
                style={styles.iconButton}
              >
                <Ionicons name="expand-outline" size={16} color={TEXT} />
              </Pressable>
            </View>
          </View>

          <View style={styles.statsRow}>
            {topStats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <TradeMarketTabs
          value={surfaceTab}
          tabs={TRADE_SURFACE_TABS}
          onChange={setSurfaceTab}
        />

        <LinearGradient
          colors={[withOpacity('#171923', 0.98), withOpacity('#0E0F15', 0.98)]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
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

            <View
              style={[
                styles.liveBadge,
                {
                  borderColor: withOpacity(getStatusAccent(realtimeCandles.status), 0.34),
                  backgroundColor: withOpacity(getStatusAccent(realtimeCandles.status), 0.12),
                },
              ]}
            >
              <View
                style={[
                  styles.liveDot,
                  { backgroundColor: getStatusAccent(realtimeCandles.status) },
                ]}
              />
              <Text style={styles.liveBadgeLabel}>{realtimeCandles.sourceLabel}</Text>
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

          <View style={styles.chartMetaRow}>
            <Text style={styles.maLabel}>
              MA5 {ma5 ? formatMiniPrice(ma5) : '--'}
            </Text>
            <Text style={[styles.maLabel, { color: '#58A6FF' }]}>
              MA10 {ma10 ? formatMiniPrice(ma10) : '--'}
            </Text>
            <Text style={[styles.maLabel, { color: '#C58BFF' }]}>
              MA30 {ma30 ? formatMiniPrice(ma30) : '--'}
            </Text>
          </View>

          <View style={styles.chartFrame}>
            <OrbitLightweightChart
              history={chartHistory}
              timeframe={timeframe}
              mode="candles"
              indicators={['MA']}
              interactive
              showVolume
              height={chartHeight}
              colorOverrides={CHART_COLOR_OVERRIDES}
              emptyTitle="Grafico no disponible"
              emptyBody="Aun no recibimos suficientes velas verificadas para este par."
            />
          </View>
        </LinearGradient>

        {renderSurfacePanel()}

        <LinearGradient
          colors={[withOpacity('#171923', 0.98), withOpacity('#11131C', 0.98)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.astraCard}
        >
          <View style={styles.astraHeader}>
            <AstraEntryPoint
              onPress={openAstraForTrade}
              size={38}
              accessibilityLabel="Abrir Astra desde Trade"
            />
            <View style={styles.astraCopy}>
              <Text style={styles.astraTitle}>Astra</Text>
              <Text style={styles.astraSubtitle}>Insight contextual</Text>
            </View>
            <Pressable onPress={openAstraForTrade} style={styles.astraAction}>
              <Ionicons name="arrow-forward" size={14} color={TEXT} />
            </Pressable>
          </View>
          <Text style={styles.astraBody}>{insight}</Text>
        </LinearGradient>

        <TradeActionPanel
          orderType={orderType}
          price={price}
          quantity={quantity}
          total={total}
          stopPrice={stopPrice}
          quickPercent={quickPercent}
          feeEstimate={feeEstimate}
          availableQuote={availableQuote}
          availableBase={availableBase}
          baseSymbol={pair.baseSymbol}
          quoteSymbol={pair.quoteSymbol}
          currentPriceLabel={headerPriceLabel}
          onChangeOrderType={setOrderType}
          onChangePrice={setPrice}
          onChangeQuantity={setQuantity}
          onChangeTotal={setTotal}
          onChangeStopPrice={setStopPrice}
          onPercent={applyPercent}
          onSubmitSide={submitOrderSimulationForSide}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    backgroundColor: SURFACE_BACKGROUND,
    paddingBottom: 28,
  },
  screen: {
    gap: 14,
    paddingTop: 6,
  },
  headerShell: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerMain: {
    flex: 1,
    gap: 4,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  pairLabel: {
    color: TEXT,
    fontFamily: FONT.bold,
    fontSize: 28,
    lineHeight: 32,
  },
  marketBadge: {
    minHeight: 24,
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
    fontSize: 24,
    lineHeight: 28,
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
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 92,
    backgroundColor: SURFACE_CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  statLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  statValue: {
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
  panelStack: {
    gap: 14,
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
  panelPill: {
    minHeight: 30,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelPillLabel: {
    color: TEXT,
    fontFamily: FONT.semibold,
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
  emptyPanelState: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    gap: 8,
  },
  emptyPanelTitle: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  emptyPanelBody: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  infoAction: {
    minHeight: 32,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: SURFACE_BORDER,
    backgroundColor: withOpacity(ACCENT, 0.14),
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoActionLabel: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 11,
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
});
