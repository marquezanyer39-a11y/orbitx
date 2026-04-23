import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { OrderBook } from '../../components/trade/OrderBook';
import { TradeActivityPanel } from '../../components/trade/TradeActivityPanel';
import { TradeChart } from '../../components/trade/TradeChart';
import { TradeForm } from '../../components/trade/TradeForm';
import { TradeHeader } from '../../components/trade/TradeHeader';
import { useMarketData } from '../../hooks/useMarketData';
import { usePairChartData } from '../../hooks/usePairChartData';
import { useRealtimeCandles } from '../../hooks/useRealtimeCandles';
import { useRealtimeMarketFeed } from '../../hooks/useRealtimeMarketFeed';
import { useRealtimePrice } from '../../hooks/useRealtimePrice';
import { useTradeForm } from '../../hooks/useTradeForm';
import { useProfileStore } from '../../store/profileStore';
import { useAstra } from '../../hooks/useAstra';
import { useAstraStore } from '../../store/astraStore';

export default function TradeScreen() {
  const params = useLocalSearchParams<{ pairId?: string; tokenId?: string; side?: 'buy' | 'sell' }>();
  const { colors } = useAppTheme();
  const { selectedPair, loading, error, selectPairById, refreshSelectedPair } = useMarketData('trade');
  const trade = useTradeForm();
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1D'>('1h');
  const favoritePairIds = useProfileStore((state) => state.favoritePairIds);
  const toggleFavoritePair = useProfileStore((state) => state.toggleFavoritePair);
  const { openAstra, language } = useAstra();
  const rememberAstraContext = useAstraStore((state) => state.rememberContext);
  const recordAstraError = useAstraStore((state) => state.recordError);

  const {
    selectedPairId,
    openOrders,
    recentOrders,
    buySellSide,
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
  const realtimeTicker = useRealtimePrice(pair, Boolean(pair));
  const realtimeCandles = useRealtimeCandles(pair, timeframe, fallbackHistory, Boolean(pair));
  const realtimeFeed = useRealtimeMarketFeed(pair, Boolean(pair));
  const livePrice = realtimeTicker.ticker?.price ?? pair?.price ?? 0;
  const chartHistory = realtimeCandles.history ?? fallbackHistory;
  const recentTrades = useMemo(
    () => [...recentOrders, ...realtimeFeed.recentTrades].slice(0, 12),
    [recentOrders, realtimeFeed.recentTrades],
  );
  const favorite = pair ? favoritePairIds.includes(pair.id) : false;
  const astraTradeContext = useMemo(() => {
    if (!pair) {
      return null;
    }

    const currentPriceLabel = `USD ${livePrice.toFixed(livePrice >= 100 ? 0 : 2)}`;
    const summary = error
      ? language === 'en'
        ? `Trade detected this issue: ${error}`
        : `Operar detecto este problema: ${error}`
      : language === 'en'
        ? `You are on ${pair.symbol} with live order book, chart and form ready to trade.`
        : `Estas en ${pair.symbol} con libro en vivo, grafico y formulario listos para operar.`;

    return {
      surface: 'trade' as const,
      path: '/spot',
      language,
      screenName: language === 'en' ? 'Trade' : 'Operar',
      summary,
      currentTask: 'trade_pair_review',
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
      <ScreenContainer>
        <LoadingState title="Abriendo Spot" body="Estamos preparando el par y la mesa de ejecucion." />
      </ScreenContainer>
    );
  }

  if (error && !pair) {
    return (
      <ScreenContainer>
        <ErrorState body={error} onRetry={() => void refreshSelectedPair()} />
      </ScreenContainer>
    );
  }

  if (!pair) {
    return (
      <ScreenContainer>
        <ErrorState body="No encontramos este par de trading." onRetry={() => void refreshSelectedPair()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <TradeHeader
        pair={pair}
        ticker={realtimeTicker.ticker}
        favorite={favorite}
        onBack={() => router.back()}
        onToggleFavorite={() => toggleFavoritePair(pair.id)}
        onOpenPairSelector={() => router.push({ pathname: '/pair-selector', params: { pairId: pair.id } })}
        onOpenChart={() => router.push({ pathname: '/trade/chart', params: { pairId: pair.id } })}
        onOpenAstra={() =>
          openAstra({
            ...(astraTradeContext ?? {}),
            surfaceTitle: language === 'en' ? 'Trade' : 'Operar',
          })
        }
      />

      <View
        style={[
          styles.executionCard,
          {
            backgroundColor: colors.card,
            borderColor: withOpacity(colors.primary, 0.18),
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
              onSubmit={submitOrderSimulation}
            />
          </View>

          <View style={[styles.bookColumn, { borderLeftColor: withOpacity(colors.border, 0.72) }]}>
            <OrderBook
              rows={realtimeFeed.orderBook}
              baseSymbol={pair.baseSymbol}
              status={realtimeFeed.status}
              statusLabel={realtimeFeed.sourceLabel}
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
              onOpenFullscreen={() =>
                router.push({ pathname: '/trade/chart', params: { pairId: pair.id } })
              }
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
        onOpenChart={() =>
          router.push({ pathname: '/trade/chart', params: { pairId: pair.id } })
        }
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
