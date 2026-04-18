import { useEffect, useMemo, useState } from 'react';

import type { MarketChartHistory, MarketPair } from '../types';
import type { OrbitChartTimeframe } from '../../components/charts/chartData';
import { appConfig } from '../constants/appConfig';
import { getTradePairChartData } from '../services/api/market';

interface PairChartState {
  history: MarketChartHistory | null;
  loading: boolean;
  error: string | null;
}

const chartCache = new Map<string, { history: MarketChartHistory; cachedAt: number }>();

function getCacheKey(pairId: string, timeframe: OrbitChartTimeframe) {
  return `${pairId}:${timeframe}`;
}

export function usePairChartData(
  pair:
    | Pick<
        MarketPair,
        | 'id'
        | 'baseId'
        | 'sparkline'
        | 'baseSymbol'
        | 'quoteSymbol'
        | 'contractAddress'
        | 'poolAddress'
        | 'networkKey'
        | 'dexNetwork'
        | 'geckoTerminalUrl'
      >
    | null,
  timeframe: OrbitChartTimeframe,
) {
  const [state, setState] = useState<PairChartState>({
    history: null,
    loading: false,
    error: null,
  });

  const cacheKey = useMemo(
    () => (pair ? getCacheKey(pair.id, timeframe) : ''),
    [pair, timeframe],
  );

  useEffect(() => {
    if (!pair) {
      setState({ history: null, loading: false, error: null });
      return;
    }

    const cached = chartCache.get(cacheKey);
    const isFresh =
      cached && Date.now() - cached.cachedAt < appConfig.refreshIntervals.trade;

    if (cached?.history) {
      setState({
        history: cached.history,
        loading: false,
        error: null,
      });
    }

    if (isFresh) {
      return;
    }

    let cancelled = false;

    setState((current) => ({
      history: current.history,
      loading: !current.history,
      error: null,
    }));

    const run = async () => {
      try {
        const history = await getTradePairChartData(pair, timeframe);
        if (cancelled) {
          return;
        }

        chartCache.set(cacheKey, { history, cachedAt: Date.now() });
        setState({
          history,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState((current) => ({
          history: current.history,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'No se pudo actualizar el grafico de este par.',
        }));
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, pair, timeframe]);

  return state;
}
