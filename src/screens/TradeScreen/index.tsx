import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { OrbitChartTimeframe } from '../../../components/charts/chartData';
import { RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { OrderBook } from '../../components/trade/OrderBook';
import { TradeActivityPanel } from '../../components/trade/TradeActivityPanel';
import { TradeChart } from '../../components/trade/TradeChart';
import { TradeForm } from '../../components/trade/TradeForm';
import { TradeHeader } from '../../components/trade/TradeHeader';
import { useAstra } from '../../hooks/useAstra';
import { useMarketData } from '../../hooks/useMarketData';
import { usePairChartData } from '../../hooks/usePairChartData';
import { useRealtimeCandles } from '../../hooks/useRealtimeCandles';
import { useRealtimeMarketFeed } from '../../hooks/useRealtimeMarketFeed';
import { useRealtimePrice } from '../../hooks/useRealtimePrice';
import { useTradeForm } from '../../hooks/useTradeForm';
import { useProfileStore } from '../../store/profileStore';
import { useAstraStore } from '../../store/astraStore';
import { getTradeRealtimeStatusLabel } from '../../utils/tradeRealtimeUi';

export default function TradeScreen() {
  const params = useLocalSearchParams<{
    pairId?: string;
    tokenId?: string;
    side?: 'buy' | 'sell';
  }>();
  const { colors } = useAppTheme();
  const { selectedPair, loading, error, selectPairById, refreshSelectedPair } =
    useMarketData('trade');
  const trade = useTradeForm();
  const [timeframe, setTimeframe] = useState<OrbitChartTimeframe>('5m');
  const favoritePairIds = useProfileStore((state) => state.favoritePairIds);
  const toggleFavoritePair = useProfileStore((state) => state.toggleFavoritePair);
  const { openAstra, language } = useAstra();
  const rememberAstraContext = useAstraStore((state) => state.rememberContext);
  const recordAstraError = useAstraStore((state) => state.recordError);

  const {
    selectedPairId,
    buySellSide,
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
    submitOrderSimulation,
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
  const realtimePrice = useRealtimePrice(pair, Boolean(pair));
  const realtimeCandles = useRealtimeCandles(pair, timeframe, fallbackHistory, Boolean(pair));
  const realtimeFeed = useRealtimeMarketFeed(pair, Boolean(pair));
  const livePrice = realtimePrice.ticker?.price ?? pair?.price ?? 0;
  const chartHistory = realtimeCandles.history ?? fallbackHistory;
  const recentTrades = useMemo(
    () => [...recentOrders, ...realtimeFeed.recentTrades].slice(0, 14),
    [recentOrders, realtimeFeed.recentTrades],
  );
  const favorite = pair ? favoritePairIds.includes(pair.id) : false;

  const astraTradeContext = useMemo(() => {
    if (!pair) {
      return null;
    }

    return {
      surface: 'trade' as const,
      path: '/spot',
      language,
      screenName: language === 'en' ? 'Trade' : 'Operar',
      summary: `Estas en ${pair.symbol} con formulario de orden, libro compacto y acceso al grafico completo.`,
      currentTask: 'trade_execution',
      currentPairSymbol: pair.symbol,
      currentPriceLabel: `USD ${livePrice.toFixed(livePrice >= 100 ? 0 : 2)}`,
      selectedEntity: {
        type: 'trading_pair',
        id: pair.id,
        pair: pair.symbol,
        symbol: pair.baseSymbol,
        name: pair.baseSymbol,
      },
      uiState: {
        activeTimeframe: timeframe,
        activeOrderType: orderType,
        activeTradeSide: buySellSide,
        priceFeedStatus: realtimePrice.status,
        priceSourceLabel: realtimePrice.sourceLabel,
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
        pairLabel: pair.symbol,
        currentPriceLabel: `USD ${livePrice.toFixed(livePrice >= 100 ? 0 : 2)}`,
        marketStateLabel: getTradeRealtimeStatusLabel(realtimePrice.status),
      },
      errorBody: error ?? undefined,
    };
  }, [
    buySellSide,
    error,
    language,
    livePrice,
    loading,
    orderType,
    pair,
    recentTrades.length,
    realtimeCandles.sourceLabel,
    realtimeCandles.status,
    realtimeFeed.orderBook.length,
    realtimeFeed.sourceLabel,
    realtimeFeed.status,
    realtimePrice.sourceLabel,
    realtimePrice.status,
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
          body="Estamos preparando el par, el grafico y la mesa de ejecucion."
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

  function openAstraForTrade() {
    openAstra({
      ...(astraTradeContext ?? {}),
      surfaceTitle: language === 'en' ? 'Trade' : 'Operar',
    });
  }

  function openFullscreenChart() {
    router.push({ pathname: '/trade/chart', params: { pairId: activePairId } });
  }

  return (
    <ScreenContainer backgroundMode="plain" contentContainerStyle={styles.content}>
      <TradeHeader
        pair={pair}
        ticker={realtimePrice.ticker}
        favorite={favorite}
        onBack={() => router.back()}
        onToggleFavorite={() => toggleFavoritePair(activePairId)}
        onOpenPairSelector={() =>
          router.push({ pathname: '/pair-selector', params: { pairId: activePairId } })
        }
        onOpenChart={openFullscreenChart}
        onOpenAstra={openAstraForTrade}
      />

      <View
        style={[
          styles.executionCard,
          {
            backgroundColor: withOpacity(colors.card, 0.94),
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.executionGrid}>
          <View style={styles.formColumn}>
            <TradeForm
              side={buySellSide}
              orderType={orderType}
              price={price}
              quantity={quantity}
              total={total}
              stopPrice={stopPrice}
              feeEstimate={feeEstimate}
              availableQuote={availableQuote}
              availableBase={availableBase}
              baseSymbol={pair.baseSymbol}
              quoteSymbol={pair.quoteSymbol}
              quickPercent={quickPercent}
              onChangeSide={setSide}
              onChangeOrderType={setOrderType}
              onChangePrice={setPrice}
              onChangeQuantity={setQuantity}
              onChangeTotal={setTotal}
              onChangeStopPrice={setStopPrice}
              onPercent={applyPercent}
              onSubmit={() => submitOrderSimulation()}
            />
          </View>

          <View
            style={[
              styles.bookColumn,
              { borderLeftColor: withOpacity(colors.border, 0.9) },
            ]}
          >
            <OrderBook
              rows={realtimeFeed.orderBook}
              baseSymbol={pair.baseSymbol}
              status={realtimeFeed.status}
              statusLabel={getTradeRealtimeStatusLabel(realtimeFeed.status)}
              error={realtimeFeed.error}
              onPickPrice={(nextPrice) => {
                setOrderType('limit');
                setPrice(String(nextPrice));
              }}
            />

            <TradeChart
              history={chartHistory}
              timeframe={timeframe}
              onChangeTimeframe={setTimeframe}
              onOpenFullscreen={openFullscreenChart}
              compact
            />
          </View>
        </View>
      </View>

      <TradeActivityPanel
        openOrders={openOrders}
        recentTrades={recentTrades}
        baseSymbol={pair.baseSymbol}
        quoteSymbol={pair.quoteSymbol}
        baseBalance={availableBase}
        quoteBalance={availableQuote}
        onOpenChart={openFullscreenChart}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingBottom: 18,
  },
  executionCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  executionGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  formColumn: {
    flex: 1,
    paddingRight: 10,
  },
  bookColumn: {
    width: 136,
    paddingLeft: 10,
    gap: 8,
    borderLeftWidth: 1,
  },
});
