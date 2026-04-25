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
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrbitLightweightChart } from '../../components/charts/OrbitLightweightChart';
import type { OrbitChartHtmlColors } from '../../components/charts/lightweightChartHtml';
import type {
  OrbitChartIndicator,
  OrbitChartTimeframe,
} from '../../components/charts/chartData';
import { RouteRedirect } from '../../components/common/RouteRedirect';
import { pickLanguageText } from '../../constants/i18n';
import { FONT, RADII, withOpacity } from '../../constants/theme';
import { AstraEntryPoint } from '../../src/components/astra/AstraEntryPoint';
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
import { useAstraStore } from '../../src/store/astraStore';
import { formatPercent } from '../../src/utils/formatPercent';
import {
  getTradeRealtimeStatusCopy,
  getTradeRealtimeStatusLabel,
} from '../../src/utils/tradeRealtimeUi';

const SURFACE_BACKGROUND = '#0B0B0F';
const SURFACE_ALT = '#111218';
const SURFACE_ELEVATED = '#13141B';
const SURFACE_MUTED = '#171922';
const BORDER = 'rgba(255,255,255,0.08)';
const BORDER_STRONG = 'rgba(255,255,255,0.14)';
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
  border: BORDER,
  borderStrong: BORDER_STRONG,
  grid: 'rgba(255,255,255,0.05)',
  gridStrong: withOpacity(ACCENT, 0.3),
  primary: ACCENT,
  profit: BUY,
  loss: SELL,
};

const PRIMARY_TIMEFRAMES: OrbitChartTimeframe[] = ['15m', '1h', '4h', '1D'];
const EXTRA_TIMEFRAMES: OrbitChartTimeframe[] = ['1m', '5m'];

type SurfaceTab = 'chart' | 'book' | 'trades' | 'info';
type PanelTab = 'book' | 'trades';
type IndicatorTab = 'MA' | 'EMA' | 'BOLL' | 'VOL' | 'MACD' | 'RSI' | 'KDJ';

const SURFACE_TABS: SurfaceTab[] = ['chart', 'book', 'trades', 'info'];

const PANEL_TABS: PanelTab[] = ['book', 'trades'];

const INDICATOR_TABS: IndicatorTab[] = ['MA', 'EMA', 'BOLL', 'VOL', 'MACD', 'RSI', 'KDJ'];

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

function formatTradeTime(value: string) {
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

function chartText(
  language: string,
  values: Partial<Record<'en' | 'es' | 'pt' | 'zh-Hans' | 'hi' | 'ru' | 'ar' | 'id', string>>,
) {
  return pickLanguageText(language as any, values as any, 'en');
}

function getSurfaceTabLabel(language: string, tab: SurfaceTab) {
  switch (tab) {
    case 'chart':
      return chartText(language, { en: 'Chart', es: 'Grafico', pt: 'Grafico', 'zh-Hans': '\u56fe\u8868', hi: '\u091a\u093e\u0930\u094d\u091f', ru: '\u0413\u0440\u0430\u0444\u0438\u043a', ar: '\u0627\u0644\u0645\u062e\u0637\u0637', id: 'Grafik' });
    case 'book':
      return chartText(language, { en: 'Order book', es: 'Libro de ordenes', pt: 'Livro de ordens', 'zh-Hans': '\u8ba2\u5355\u7c3f', hi: '\u0911\u0930\u094d\u0921\u0930 \u092c\u0941\u0915', ru: '\u0421\u0442\u0430\u043a\u0430\u043d', ar: '\u062f\u0641\u062a\u0631 \u0627\u0644\u0623\u0648\u0627\u0645\u0631', id: 'Buku order' });
    case 'trades':
      return chartText(language, { en: 'Trades', es: 'Trades', pt: 'Trades', 'zh-Hans': '\u6210\u4ea4', hi: '\u091f\u094d\u0930\u0947\u0921\u094d\u0938', ru: '\u0421\u0434\u0435\u043b\u043a\u0438', ar: '\u0627\u0644\u0635\u0641\u0642\u0627\u062a', id: 'Trades' });
    case 'info':
      return chartText(language, { en: 'Info', es: 'Info', pt: 'Info', 'zh-Hans': '\u4fe1\u606f', hi: '\u0907\u0928\u094d\u092b\u094b', ru: '\u0418\u043d\u0444\u043e', ar: '\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a', id: 'Info' });
  }
}

function getPanelTabLabel(language: string, tab: PanelTab) {
  switch (tab) {
    case 'book':
      return chartText(language, { en: 'Order book', es: 'Libro de ordenes', pt: 'Livro de ordens', 'zh-Hans': '\u8ba2\u5355\u7c3f', hi: '\u0911\u0930\u094d\u0921\u0930 \u092c\u0941\u0915', ru: '\u0421\u0442\u0430\u043a\u0430\u043d', ar: '\u062f\u0641\u062a\u0631 \u0627\u0644\u0623\u0648\u0627\u0645\u0631', id: 'Buku order' });
    case 'trades':
      return chartText(language, { en: 'Trade history', es: 'Historial de operaciones', pt: 'Historico de operacoes', 'zh-Hans': '\u6210\u4ea4\u5386\u53f2', hi: '\u091f\u094d\u0930\u0947\u0921 \u0939\u093f\u0938\u094d\u091f\u094d\u0930\u0940', ru: '\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0441\u0434\u0435\u043b\u043e\u043a', ar: '\u0633\u062c\u0644 \u0627\u0644\u0635\u0641\u0642\u0627\u062a', id: 'Riwayat trade' });
  }
}

function ChartLoadingState({ language }: { language: string }) {
  return (
    <View style={styles.loadingState}>
      <View style={styles.loadingRing} />
      <Ionicons name="pulse-outline" size={24} color={ACCENT} />
      <Text style={styles.loadingTitle}>
        {chartText(language, { en: 'Syncing chart', es: 'Sincronizando grafico', pt: 'Sincronizando grafico', 'zh-Hans': '\u6b63\u5728\u540c\u6b65\u56fe\u8868', hi: '\u091a\u093e\u0930\u094d\u091f sync ho raha hai', ru: '\u0421\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0430\u0446\u0438\u044f \u0433\u0440\u0430\u0444\u0438\u043a\u0430', ar: '\u062c\u0627\u0631\u064a \u0645\u0632\u0627\u0645\u0646\u0629 \u0627\u0644\u0645\u062e\u0637\u0637', id: 'Menyinkronkan grafik' })}
      </Text>
      <Text style={styles.loadingBody}>
        {chartText(language, { en: 'OrbitX is loading candles, volume and market depth.', es: 'OrbitX esta cargando velas, volumen y profundidad del mercado.', pt: 'A OrbitX esta carregando candles, volume e profundidade do mercado.', 'zh-Hans': 'OrbitX \u6b63\u5728\u52a0\u8f7d K \u7ebf\u3001\u6210\u4ea4\u91cf\u548c\u5e02\u573a\u6df1\u5ea6\u3002', hi: 'OrbitX candles, volume aur market depth load kar raha hai.', ru: 'OrbitX \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442 \u0441\u0432\u0435\u0447\u0438, \u043e\u0431\u044a\u0451\u043c \u0438 \u0433\u043b\u0443\u0431\u0438\u043d\u0443 \u0440\u044b\u043d\u043a\u0430.', ar: '\u062a\u0642\u0648\u0645 OrbitX \u0628\u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0634\u0645\u0648\u0639 \u0648\u0627\u0644\u062d\u062c\u0645 \u0648\u0639\u0645\u0642 \u0627\u0644\u0633\u0648\u0642.', id: 'OrbitX sedang memuat candle, volume, dan kedalaman pasar.' })}
      </Text>
    </View>
  );
}

export default function TradeChartScreen() {
  const { pairId, tokenId } = useLocalSearchParams<{ pairId?: string; tokenId?: string }>();
  const { width, height } = useWindowDimensions();
  const sessionStatus = useAuthStore((state) => state.session.status);
  const selectedPairId = useTradeStore((state) => state.selectedPairId);
  const favoritePairIds = useProfileStore((state) => state.favoritePairIds);
  const toggleFavoritePair = useProfileStore((state) => state.toggleFavoritePair);
  const { openAstra, language } = useAstra();
  const rememberAstraContext = useAstraStore((state) => state.rememberContext);
  const { markets, selectedPair, loading, selectPairById } = useMarketData('trade');

  const [timeframe, setTimeframe] = useState<OrbitChartTimeframe>('15m');
  const [showExtraTimeframes, setShowExtraTimeframes] = useState(false);
  const [surfaceTab, setSurfaceTab] = useState<SurfaceTab>('chart');
  const [panelTab, setPanelTab] = useState<PanelTab>('book');
  const [indicatorTab, setIndicatorTab] = useState<IndicatorTab>('MA');
  const [chartResetKey, setChartResetKey] = useState(0);

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
  const favorite = pair ? favoritePairIds.includes(pair.id) : false;
  const recentTrades = realtimeFeed.recentTrades.slice(0, 16);
  const showChartLoading =
    loading || (!pair && fallbackHistoryLoading) || (!chartHistory && realtimeCandles.loading);
  const chartHeight = isLandscape
    ? Math.max(height * 0.5, 290)
    : Math.min(Math.max(height * 0.31, 250), 320);

  const closeSeries =
    chartHistory?.candles?.length
      ? chartHistory.candles.map((item) => item.close)
      : chartHistory?.line.map((item) => item.value) ?? [];

  const ma5 = movingAverageValue(closeSeries, 5);
  const ma10 = movingAverageValue(closeSeries, 10);
  const ma30 = movingAverageValue(closeSeries, 30);

  const activeChartIndicators = useMemo<OrbitChartIndicator[]>(() => {
    const indicators: OrbitChartIndicator[] = ['MA'];

    if (indicatorTab === 'EMA') {
      indicators.push('EMA');
    }
    if (indicatorTab === 'BOLL') {
      indicators.push('BOLL');
    }
    if (indicatorTab === 'MACD') {
      indicators.push('MACD');
    }
    if (indicatorTab === 'RSI') {
      indicators.push('RSI');
    }

    return indicators;
  }, [indicatorTab]);

  const panelMode: 'book' | 'trades' | 'info' =
    surfaceTab === 'info'
      ? 'info'
      : surfaceTab === 'book'
        ? 'book'
        : surfaceTab === 'trades'
          ? 'trades'
          : panelTab;

  const astraChartContext = useMemo(() => {
    if (!pair) {
      return null;
    }

    return {
      surface: 'trade' as const,
      path: '/trade/chart',
      language,
      screenName: pickLanguageText(
        language,
        {
          en: 'Chart',
          es: 'Grafico',
          pt: 'Grafico',
          'zh-Hans': '\u56fe\u8868',
          hi: '\u091a\u093e\u0930\u094d\u091f',
          ru: '\u0413\u0440\u0430\u0444\u0438\u043a',
          ar: '\u0627\u0644\u0645\u062e\u0637\u0637',
          id: 'Grafik',
        },
        'en',
      ),
      summary: `Estas revisando ${pair.symbol} en una vista compacta de grafico, libro y trades en tiempo real.`,
      currentTask:
        panelMode === 'book'
          ? 'trade_order_book_review'
          : panelMode === 'trades'
            ? 'trade_tape_review'
            : 'trade_market_info_review',
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
        activeTradeTab: surfaceTab,
        activePanelTab: panelMode,
        activeTimeframe: timeframe,
        priceFeedStatus: realtimePrice.status,
        orderBookStatus: realtimeFeed.status,
        chartFeedStatus: realtimeCandles.status,
        orderBookDepth: realtimeFeed.orderBook.length,
        recentTradesCount: recentTrades.length,
        loading,
      },
      labels: {
        pairLabel: pair.symbol,
        currentPriceLabel: `USD ${formatUsdPrice(livePrice)}`,
        marketStateLabel: getTradeRealtimeStatusLabel(realtimePrice.status),
      },
    };
  }, [
    language,
    livePrice,
    loading,
    pair,
    panelMode,
    realtimeCandles.status,
    realtimeFeed.orderBook.length,
    realtimeFeed.status,
    realtimePrice.status,
    recentTrades.length,
    surfaceTab,
    timeframe,
  ]);

  useEffect(() => {
    if (!astraChartContext) {
      return;
    }
    rememberAstraContext(astraChartContext);
  }, [astraChartContext, rememberAstraContext]);

  if (sessionStatus === 'signed_out') {
    return <RouteRedirect href="/" />;
  }

  if (!loading && !pair) {
    return <RouteRedirect href="/spot" />;
  }

  function openAstraForChart() {
    openAstra({
      ...(astraChartContext ?? {}),
      surfaceTitle: pickLanguageText(
        language,
        {
          en: 'Chart',
          es: 'Grafico',
          pt: 'Grafico',
          'zh-Hans': '\u56fe\u8868',
          hi: '\u091a\u093e\u0930\u094d\u091f',
          ru: '\u0413\u0440\u0430\u0444\u0438\u043a',
          ar: '\u0627\u0644\u0645\u062e\u0637\u0637',
          id: 'Grafik',
        },
        'en',
      ),
    });
  }

  function handleSurfaceTabChange(next: SurfaceTab) {
    setSurfaceTab(next);
    if (next === 'book' || next === 'trades') {
      setPanelTab(next);
    }
  }

  function handlePanelTabChange(next: PanelTab) {
    setPanelTab(next);
    if (surfaceTab === 'book' || surfaceTab === 'trades') {
      setSurfaceTab(next);
    }
  }

  function renderTopTabs() {
    return (
      <View style={styles.topTabRow}>
        {SURFACE_TABS.map((tab) => {
          const active = surfaceTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => handleSurfaceTabChange(tab)}
              style={styles.topTabButton}
            >
              <Text style={[styles.topTabLabel, active ? styles.topTabLabelActive : null]}>
                {getSurfaceTabLabel(language, tab)}
              </Text>
              <View style={[styles.topTabUnderline, active ? styles.topTabUnderlineActive : null]} />
            </Pressable>
          );
        })}
      </View>
    );
  }

  function renderIndicatorTabs() {
    return (
      <View style={styles.indicatorRow}>
        {INDICATOR_TABS.map((item) => {
          const active = indicatorTab === item;
          const disabled = item === 'KDJ';

          return (
            <Pressable
              key={item}
              onPress={() => {
                if (!disabled) {
                  setIndicatorTab(item);
                }
              }}
              style={styles.indicatorChip}
            >
              <Text
                style={[
                  styles.indicatorLabel,
                  active ? styles.indicatorLabelActive : null,
                  disabled ? styles.indicatorLabelDisabled : null,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  function renderTradesPanel() {
    return (
      <View style={styles.panelBody}>
        <View style={styles.panelHeaderRow}>
          <Text style={styles.panelTitle}>
            {chartText(language, { en: 'Trade history', es: 'Historial de operaciones', pt: 'Historico de operacoes', 'zh-Hans': '\u6210\u4ea4\u5386\u53f2', hi: '\u091f\u094d\u0930\u0947\u0921 \u0939\u093f\u0938\u094d\u091f\u094d\u0930\u0940', ru: '\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0441\u0434\u0435\u043b\u043e\u043a', ar: '\u0633\u062c\u0644 \u0627\u0644\u0635\u0641\u0642\u0627\u062a', id: 'Riwayat trade' })}
          </Text>
          <View style={styles.panelStatusPill}>
            <Text style={styles.panelStatusLabel}>
              {getTradeRealtimeStatusLabel(realtimeFeed.status)}
            </Text>
          </View>
        </View>

        <View style={styles.tradeHeaderRow}>
          <Text style={styles.tradeHeaderCell}>
            {chartText(language, { en: 'Price', es: 'Precio', pt: 'Preco', 'zh-Hans': '\u4ef7\u683c', hi: '\u092e\u0942\u0932\u094d\u092f', ru: '\u0426\u0435\u043d\u0430', ar: '\u0627\u0644\u0633\u0639\u0631', id: 'Harga' })}
          </Text>
          <Text style={styles.tradeHeaderCellCenter}>
            {chartText(language, { en: 'Amount', es: 'Cantidad', pt: 'Quantidade', 'zh-Hans': '\u6570\u91cf', hi: '\u092e\u093e\u0924\u094d\u0930\u093e', ru: '\u041a\u043e\u043b-\u0432\u043e', ar: '\u0627\u0644\u0643\u0645\u064a\u0629', id: 'Jumlah' })}
          </Text>
          <Text style={styles.tradeHeaderCellRight}>
            {chartText(language, { en: 'Time', es: 'Hora', pt: 'Hora', 'zh-Hans': '\u65f6\u95f4', hi: '\u0938\u092e\u092f', ru: '\u0412\u0440\u0435\u043c\u044f', ar: '\u0627\u0644\u0648\u0642\u062a', id: 'Waktu' })}
          </Text>
        </View>

        {recentTrades.length ? (
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tradeList}
          >
            {recentTrades.map((trade) => (
              <View key={trade.id} style={styles.tradeRow}>
                <Text style={[styles.tradePrice, { color: trade.side === 'buy' ? BUY : SELL }]}>
                  {formatMiniPrice(trade.price)}
                </Text>
                <Text style={styles.tradeQuantity}>{trade.quantity.toFixed(4)}</Text>
                <Text style={styles.tradeTime}>{formatTradeTime(trade.time)}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {chartText(language, { en: 'No visible trades', es: 'Sin operaciones visibles', pt: 'Sem operacoes visiveis', 'zh-Hans': '\u6ca1\u6709\u53ef\u89c1\u6210\u4ea4', hi: '\u0915\u094b\u0908 visible trades nahin', ru: '\u041d\u0435\u0442 \u0432\u0438\u0434\u0438\u043c\u044b\u0445 \u0441\u0434\u0435\u043b\u043e\u043a', ar: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0641\u0642\u0627\u062a \u0645\u0631\u0626\u064a\u0629', id: 'Tidak ada trade terlihat' })}
            </Text>
            <Text style={styles.emptyBody}>
              {realtimeFeed.error ||
                chartText(language, { en: 'No recent executions have arrived for this pair yet.', es: 'Aun no llegan ejecuciones recientes para este par.', pt: 'Ainda nao chegaram execucoes recentes para este par.', 'zh-Hans': '\u8fd9\u4e2a\u4ea4\u6613\u5bf9\u8fd8\u6ca1\u6709\u6700\u8fd1\u6210\u4ea4\u8bb0\u5f55\u3002', hi: 'Is pair ke liye recent executions abhi tak nahin aaye.', ru: '\u0414\u043b\u044f \u044d\u0442\u043e\u0439 \u043f\u0430\u0440\u044b \u0435\u0449\u0451 \u043d\u0435 \u043f\u043e\u0441\u0442\u0443\u043f\u0438\u043b\u0438 \u043d\u0435\u0434\u0430\u0432\u043d\u0438\u0435 \u0438\u0441\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f.', ar: '\u0644\u0645 \u062a\u0635\u0644 \u0639\u0645\u0644\u064a\u0627\u062a \u062a\u0646\u0641\u064a\u0630 \u062d\u062f\u064a\u062b\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0632\u0648\u062c \u0628\u0639\u062f.', id: 'Belum ada eksekusi terbaru untuk pair ini.' })}
            </Text>
          </View>
        )}
      </View>
    );
  }

  function renderInfoPanel() {
    return (
      <View style={styles.panelBody}>
        <View style={styles.panelHeaderRow}>
          <Text style={styles.panelTitle}>
            {chartText(language, { en: 'Market info', es: 'Info de mercado', pt: 'Info de mercado', 'zh-Hans': '\u5e02\u573a\u4fe1\u606f', hi: '\u092e\u093e\u0930\u094d\u0915\u0947\u091f \u0907\u0928\u094d\u092b\u094b', ru: '\u0418\u043d\u0444\u043e \u043e \u0440\u044b\u043d\u043a\u0435', ar: '\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0633\u0648\u0642', id: 'Info pasar' })}
          </Text>
          <View style={styles.panelStatusPill}>
            <Text style={styles.panelStatusLabel}>
              {getTradeRealtimeStatusLabel(realtimePrice.status)}
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>{chartText(language, { en: 'Price', es: 'Precio', pt: 'Preco', 'zh-Hans': '\u4ef7\u683c', hi: '\u092e\u0942\u0932\u094d\u092f', ru: '\u0426\u0435\u043d\u0430', ar: '\u0627\u0644\u0633\u0639\u0631', id: 'Harga' })}</Text>
            <Text style={styles.infoValue}>USD {formatUsdPrice(livePrice)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>{chartText(language, { en: '24h change', es: 'Cambio 24h', pt: 'Mudanca 24h', 'zh-Hans': '24\u5c0f\u65f6\u6da8\u8dcc', hi: '24h change', ru: '\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 24\u0447', ar: '\u0627\u0644\u062a\u063a\u064a\u0631 24 \u0633\u0627\u0639\u0629', id: 'Perubahan 24j' })}</Text>
            <Text style={[styles.infoValue, { color: positive ? BUY : SELL }]}>
              {formatPercent(currentChange)}
            </Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>{chartText(language, { en: '24h high', es: 'Max 24h', pt: 'Max 24h', 'zh-Hans': '24\u5c0f\u65f6\u6700\u9ad8', hi: '24h high', ru: '\u041c\u0430\u043a\u0441 24\u0447', ar: '\u0623\u0639\u0644\u0649 24 \u0633\u0627\u0639\u0629', id: 'Tertinggi 24j' })}</Text>
            <Text style={styles.infoValue}>{formatMiniPrice(high24h)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>{chartText(language, { en: '24h low', es: 'Min 24h', pt: 'Min 24h', 'zh-Hans': '24\u5c0f\u65f6\u6700\u4f4e', hi: '24h low', ru: '\u041c\u0438\u043d 24\u0447', ar: '\u0623\u062f\u0646\u0649 24 \u0633\u0627\u0639\u0629', id: 'Terendah 24j' })}</Text>
            <Text style={styles.infoValue}>{formatMiniPrice(low24h)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>{chartText(language, { en: '24h volume', es: 'Volumen 24h', pt: 'Volume 24h', 'zh-Hans': '24\u5c0f\u65f6\u6210\u4ea4\u91cf', hi: '24h volume', ru: '\u041e\u0431\u044a\u0451\u043c 24\u0447', ar: '\u062d\u062c\u0645 24 \u0633\u0627\u0639\u0629', id: 'Volume 24j' })}</Text>
            <Text style={styles.infoValue}>{formatMetricValue(volume24h)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>{chartText(language, { en: 'Status', es: 'Estado', pt: 'Estado', 'zh-Hans': '\u72b6\u6001', hi: '\u0938\u094d\u0925\u093f\u0924\u093f', ru: '\u0421\u0442\u0430\u0442\u0443\u0441', ar: '\u0627\u0644\u062d\u0627\u0644\u0629', id: 'Status' })}</Text>
            <Text style={styles.infoValue}>{getTradeRealtimeStatusCopy(realtimePrice.status)}</Text>
          </View>
        </View>
      </View>
    );
  }

  function renderPanelContent() {
    if (!pair) {
      return null;
    }

    if (panelMode === 'info') {
      return renderInfoPanel();
    }

    if (panelMode === 'trades') {
      return renderTradesPanel();
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
      <View style={styles.backgroundLayer} pointerEvents="none">
        <LinearGradient
          colors={[withOpacity(ACCENT, 0.16), 'transparent', withOpacity(ACCENT, 0.06)]}
          start={{ x: 0.1, y: 0.02 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.screen}>
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
            <View style={styles.headerPriceRow}>
              <Text style={styles.headerPrice}>USD {formatUsdPrice(livePrice)}</Text>
              <Text style={[styles.headerChange, { color: positive ? BUY : SELL }]}>
                {formatPercent(currentChange)}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable onPress={() => pair && toggleFavoritePair(pair.id)} style={styles.iconButton}>
              <Ionicons
                name={favorite ? 'star' : 'star-outline'}
                size={15}
                color={favorite ? '#FFC857' : TEXT_MUTED}
              />
            </Pressable>
            <Pressable onPress={() => handleSurfaceTabChange('info')} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={15} color={TEXT} />
            </Pressable>
          </View>
        </View>

        {renderTopTabs()}

        <View style={styles.priceStrip}>
          <View style={styles.priceStripMain}>
            <Text style={styles.priceStripValue}>USD {formatUsdPrice(livePrice)}</Text>
            <View style={styles.priceStripMeta}>
              <Text style={[styles.priceStripChange, { color: positive ? BUY : SELL }]}>
                {formatPercent(currentChange)}
              </Text>
              <View style={styles.livePill}>
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
                <Text style={styles.livePillLabel}>
                  {getTradeRealtimeStatusLabel(realtimePrice.status)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statList}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>
                {chartText(language, { en: '24h high', es: 'Max 24h', pt: 'Max 24h', 'zh-Hans': '24\u5c0f\u65f6\u6700\u9ad8', hi: '24h high', ru: '\u041c\u0430\u043a\u0441 24\u0447', ar: '\u0623\u0639\u0644\u0649 24 \u0633\u0627\u0639\u0629', id: 'Tertinggi 24j' })}
              </Text>
              <Text style={styles.statValue}>{formatMiniPrice(high24h)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>
                {chartText(language, { en: '24h low', es: 'Min 24h', pt: 'Min 24h', 'zh-Hans': '24\u5c0f\u65f6\u6700\u4f4e', hi: '24h low', ru: '\u041c\u0438\u043d 24\u0447', ar: '\u0623\u062f\u0646\u0649 24 \u0633\u0627\u0639\u0629', id: 'Terendah 24j' })}
              </Text>
              <Text style={styles.statValue}>{formatMiniPrice(low24h)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>
                {chartText(language, { en: '24h vol', es: 'Vol 24h', pt: 'Vol 24h', 'zh-Hans': '24\u5c0f\u65f6\u91cf', hi: '24h vol', ru: '\u041e\u0431\u044a\u0451\u043c 24\u0447', ar: '\u062d\u062c\u0645 24 \u0633\u0627\u0639\u0629', id: 'Vol 24j' })}
              </Text>
              <Text style={styles.statValue}>{formatMetricValue(volume24h)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.chartToolbar}>
            <View style={styles.timeframeRow}>
              {PRIMARY_TIMEFRAMES.map((item) => {
                const active = timeframe === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setTimeframe(item);
                      setShowExtraTimeframes(false);
                    }}
                    style={styles.timeframeButton}
                  >
                    <Text style={[styles.timeframeLabel, active ? styles.timeframeLabelActive : null]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                onPress={() => setShowExtraTimeframes((value) => !value)}
                style={styles.timeframeButton}
              >
                <Text
                  style={[
                    styles.timeframeLabel,
                    showExtraTimeframes ? styles.timeframeLabelActive : null,
                  ]}
                >
                  {chartText(language, { en: 'More', es: 'Mas', pt: 'Mais', 'zh-Hans': '\u66f4\u591a', hi: '\u0914\u0930', ru: '\u0415\u0449\u0451', ar: '\u0627\u0644\u0645\u0632\u064a\u062f', id: 'Lainnya' })}
                </Text>
              </Pressable>
            </View>

            <View style={styles.chartActions}>
              <Pressable
                onPress={() => setChartResetKey((value) => value + 1)}
                style={styles.chartActionButton}
              >
                <Ionicons name="scan-outline" size={15} color={TEXT_MUTED} />
              </Pressable>
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
                    style={styles.extraTimeframeButton}
                  >
                    <Text
                      style={[
                        styles.extraTimeframeLabel,
                        active ? styles.extraTimeframeLabelActive : null,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <View style={styles.maLegendRow}>
            <Text style={styles.maLegend}>MA5 {ma5 ? formatMiniPrice(ma5) : '--'}</Text>
            <Text style={[styles.maLegend, styles.maLegendBlue]}>
              MA10 {ma10 ? formatMiniPrice(ma10) : '--'}
            </Text>
            <Text style={[styles.maLegend, styles.maLegendPurple]}>
              MA30 {ma30 ? formatMiniPrice(ma30) : '--'}
            </Text>
          </View>

          <View style={styles.chartCanvas}>
            {showChartLoading ? (
              <ChartLoadingState language={language} />
            ) : (
              <OrbitLightweightChart
                key={`${pair?.id ?? 'pair'}-${timeframe}-${chartResetKey}-${indicatorTab}`}
                history={chartHistory}
                timeframe={timeframe}
                mode="candles"
                indicators={activeChartIndicators}
                interactive
                showVolume
                height={chartHeight}
                colorOverrides={CHART_COLOR_OVERRIDES}
                emptyTitle={chartText(language, {
                  en: 'Chart unavailable',
                  es: 'Grafico no disponible',
                  pt: 'Grafico indisponivel',
                  'zh-Hans': '\u56fe\u8868\u4e0d\u53ef\u7528',
                  hi: '\u091a\u093e\u0930\u094d\u091f unavailable hai',
                  ru: '\u0413\u0440\u0430\u0444\u0438\u043a \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d',
                  ar: '\u0627\u0644\u0645\u062e\u0637\u0637 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d',
                  id: 'Grafik tidak tersedia',
                })}
                emptyBody={chartText(language, {
                  en: 'We still have not received enough verified candles for this pair.',
                  es: 'Aun no recibimos suficientes velas verificadas para este par.',
                  pt: 'Ainda nao recebemos candles verificados suficientes para este par.',
                  'zh-Hans': '\u6211\u4eec\u8fd8\u6ca1\u6709\u6536\u5230\u8fd9\u4e2a\u4ea4\u6613\u5bf9\u8db3\u591f\u7684\u5df2\u9a8c\u8bc1 K \u7ebf\u3002',
                  hi: 'Abhi tak is pair ke liye kaafi verified candles nahin mili hain.',
                  ru: '\u041c\u044b \u0435\u0449\u0451 \u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0438\u043b\u0438 \u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e \u043f\u0440\u043e\u0432\u0435\u0440\u0435\u043d\u043d\u044b\u0445 \u0441\u0432\u0435\u0447\u0435\u0439 \u0434\u043b\u044f \u044d\u0442\u043e\u0439 \u043f\u0430\u0440\u044b.',
                  ar: '\u0644\u0645 \u0646\u062a\u0644\u0642 \u0628\u0639\u062f \u0639\u062f\u062f\u0627\u064b \u0643\u0627\u0641\u064a\u0627\u064b \u0645\u0646 \u0627\u0644\u0634\u0645\u0648\u0639 \u0627\u0644\u0645\u0624\u0643\u062f\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0632\u0648\u062c.',
                  id: 'Kami belum menerima candle terverifikasi yang cukup untuk pair ini.',
                })}
              />
            )}
          </View>

          {renderIndicatorTabs()}
        </View>

        <View style={styles.panelSection}>
          <View style={styles.panelTopRow}>
            {panelMode !== 'info' ? (
              <View style={styles.panelTabsRow}>
                {PANEL_TABS.map((tab) => {
                  const active = panelMode === tab;
                  return (
                    <Pressable
                      key={tab}
                      onPress={() => handlePanelTabChange(tab)}
                      style={styles.panelTabButton}
                    >
                      <Text style={[styles.panelTabLabel, active ? styles.panelTabLabelActive : null]}>
                        {getPanelTabLabel(language, tab)}
                      </Text>
                      <View
                        style={[
                          styles.panelTabUnderline,
                          active ? styles.panelTabUnderlineActive : null,
                        ]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.panelInfoLabel}>
                {chartText(language, { en: 'Data analysis', es: 'Analisis de datos', pt: 'Analise de dados', 'zh-Hans': '\u6570\u636e\u5206\u6790', hi: '\u0921\u0947\u091f\u093e analysis', ru: '\u0410\u043d\u0430\u043b\u0438\u0437 \u0434\u0430\u043d\u043d\u044b\u0445', ar: '\u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a', id: 'Analisis data' })}
              </Text>
            )}
          </View>

          <View style={styles.panelSurface}>{renderPanelContent()}</View>
        </View>

        <View style={styles.floatingAstra}>
          <AstraEntryPoint
            onPress={openAstraForChart}
            size={44}
            accessibilityLabel={chartText(language, { en: 'Open Astra from chart', es: 'Abrir Astra desde el grafico', pt: 'Abrir Astra a partir do grafico', 'zh-Hans': '\u4ece\u56fe\u8868\u6253\u5f00 Astra', hi: '\u091a\u093e\u0930\u094d\u091f \u0938\u0947 Astra \u0916\u094b\u0932\u0947\u0902', ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c Astra \u0438\u0437 \u0433\u0440\u0430\u0444\u0438\u043a\u0430', ar: '\u0641\u062a\u062d Astra \u0645\u0646 \u0627\u0644\u0645\u062e\u0637\u0637', id: 'Buka Astra dari grafik' })}
          />
        </View>

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
              colors={[withOpacity(BUY, 0.96), withOpacity(BUY, 0.8)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.footerButtonTextBuy}>
              {chartText(language, { en: 'Buy', es: 'Comprar', pt: 'Comprar', 'zh-Hans': '\u4e70\u5165', hi: '\u0916\u0930\u0940\u0926\u0947\u0902', ru: '\u041a\u0443\u043f\u0438\u0442\u044c', ar: '\u0634\u0631\u0627\u0621', id: 'Beli' })}
            </Text>
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
              colors={[withOpacity(SELL, 0.96), withOpacity(SELL, 0.82)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.footerButtonTextSell}>
              {chartText(language, { en: 'Sell', es: 'Vender', pt: 'Vender', 'zh-Hans': '\u5356\u51fa', hi: '\u092c\u0947\u091a\u0947\u0902', ru: '\u041f\u0440\u043e\u0434\u0430\u0442\u044c', ar: '\u0628\u064a\u0639', id: 'Jual' })}
            </Text>
          </Pressable>
        </View>
      </View>
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
  },
  screen: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: BORDER,
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
    fontSize: 22,
    lineHeight: 26,
  },
  marketBadge: {
    minHeight: 20,
    paddingHorizontal: 9,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketBadgeLabel: {
    color: TEXT_SOFT,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  headerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerPrice: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  headerChange: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  topTabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 18,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  topTabButton: {
    paddingBottom: 8,
    gap: 6,
  },
  topTabLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  topTabLabelActive: {
    color: TEXT,
  },
  topTabUnderline: {
    height: 2,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  topTabUnderlineActive: {
    backgroundColor: ACCENT,
  },
  priceStrip: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  priceStripMain: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  priceStripValue: {
    color: TEXT,
    fontFamily: FONT.bold,
    fontSize: 28,
    lineHeight: 32,
  },
  priceStripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceStripChange: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  livePill: {
    minHeight: 24,
    paddingHorizontal: 9,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.28),
    backgroundColor: withOpacity(ACCENT, 0.12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  livePillLabel: {
    color: TEXT,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  statList: {
    width: 122,
    gap: 6,
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  statValue: {
    color: TEXT,
    fontFamily: FONT.medium,
    fontSize: 10,
    textAlign: 'right',
    flexShrink: 1,
  },
  chartSection: {
    gap: 8,
  },
  chartToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeframeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  timeframeButton: {
    paddingVertical: 2,
  },
  timeframeLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  timeframeLabelActive: {
    color: TEXT,
  },
  chartActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chartActionButton: {
    width: 28,
    height: 28,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraTimeframeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  extraTimeframeButton: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraTimeframeLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  extraTimeframeLabelActive: {
    color: TEXT,
  },
  maLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  maLegend: {
    color: '#F6D365',
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  maLegendBlue: {
    color: '#58A6FF',
  },
  maLegendPurple: {
    color: '#C58BFF',
  },
  chartCanvas: {
    backgroundColor: SURFACE_BACKGROUND,
    overflow: 'hidden',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 2,
  },
  indicatorChip: {
    paddingVertical: 4,
  },
  indicatorLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  indicatorLabelActive: {
    color: TEXT,
  },
  indicatorLabelDisabled: {
    opacity: 0.45,
  },
  panelSection: {
    flex: 1,
    minHeight: 220,
    gap: 10,
  },
  panelTopRow: {
    minHeight: 28,
    justifyContent: 'center',
  },
  panelTabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 18,
  },
  panelTabButton: {
    paddingBottom: 6,
    gap: 5,
  },
  panelTabLabel: {
    color: TEXT_MUTED,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  panelTabLabelActive: {
    color: TEXT,
  },
  panelTabUnderline: {
    height: 2,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  panelTabUnderlineActive: {
    backgroundColor: ACCENT,
  },
  panelInfoLabel: {
    color: TEXT_SOFT,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  panelSurface: {
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.05),
    backgroundColor: withOpacity(SURFACE_ALT, 0.52),
    overflow: 'hidden',
  },
  panelBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  panelTitle: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  panelStatusPill: {
    minHeight: 24,
    paddingHorizontal: 9,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.22),
    backgroundColor: withOpacity(ACCENT, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelStatusLabel: {
    color: TEXT,
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  tradeHeaderRow: {
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
  tradeList: {
    gap: 8,
    paddingBottom: 4,
  },
  tradeRow: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tradePrice: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  tradeQuantity: {
    flex: 1,
    color: TEXT_SOFT,
    fontFamily: FONT.medium,
    fontSize: 11,
    textAlign: 'center',
  },
  tradeTime: {
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
    backgroundColor: withOpacity(SURFACE_MUTED, 0.36),
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
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
    lineHeight: 16,
  },
  floatingAstra: {
    position: 'absolute',
    right: 18,
    bottom: 84,
    zIndex: 4,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 2,
    paddingBottom: 2,
  },
  footerButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonTextBuy: {
    color: '#04110D',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  footerButtonTextSell: {
    color: TEXT,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  loadingState: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: SURFACE_BACKGROUND,
  },
  loadingRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withOpacity(ACCENT, 0.18),
  },
  loadingTitle: {
    color: TEXT,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  loadingBody: {
    color: TEXT_MUTED,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 260,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
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
});
