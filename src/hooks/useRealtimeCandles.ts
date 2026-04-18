import { useEffect, useMemo, useState } from 'react';

import type { OrbitChartTimeframe } from '../../components/charts/chartData';
import type { MarketChartHistory, MarketPair, MarketRealtimeStatus } from '../types';
import { getTradePairChartData } from '../services/api/market';
import { fetchGeckoTerminalHistory } from '../services/marketRealtime/geckoTerminal';
import { resolveMarketProvider } from '../services/marketRealtime/providerResolver';
import {
  applyRealtimeKlineUpdate,
  createRealtimeKlineStream,
  fetchRealtimeKlines,
  resolveRealtimeSymbol,
} from '../services/api/realtimeMarket';

interface RealtimeCandlesState {
  history: MarketChartHistory | null;
  status: MarketRealtimeStatus;
  loading: boolean;
  error: string | null;
  sourceLabel: string;
  lastUpdated: string | null;
}

const INITIAL_STATE: RealtimeCandlesState = {
  history: null,
  status: 'connecting',
  loading: false,
  error: null,
  sourceLabel: 'Cargando',
  lastUpdated: null,
};

function getFallbackPollInterval(timeframe: OrbitChartTimeframe) {
  switch (timeframe) {
    case '1m':
    case '5m':
      return 20_000;
    case '15m':
      return 30_000;
    case '1h':
      return 45_000;
    case '4h':
      return 90_000;
    case '1D':
      return 180_000;
    default:
      return 30_000;
  }
}

export function useRealtimeCandles(
  pair:
    | Pick<
        MarketPair,
        | 'id'
        | 'baseId'
        | 'baseSymbol'
        | 'quoteSymbol'
        | 'sparkline'
        | 'contractAddress'
        | 'poolAddress'
        | 'networkKey'
        | 'dexNetwork'
        | 'geckoTerminalUrl'
      >
    | null,
  timeframe: OrbitChartTimeframe,
  fallbackHistory: MarketChartHistory | null,
  enabled = true,
) {
  const [state, setState] = useState<RealtimeCandlesState>(INITIAL_STATE);
  const symbol = useMemo(() => resolveRealtimeSymbol(pair), [pair]);

  useEffect(() => {
    if (!pair) {
      setState(INITIAL_STATE);
      return;
    }

    if (!enabled) {
      setState({
        history: fallbackHistory,
        status: fallbackHistory ? 'fallback' : 'unsupported',
        loading: false,
        error: null,
        sourceLabel: fallbackHistory ? 'Vista ligera' : 'Sin datos',
        lastUpdated: fallbackHistory?.updatedAt ?? null,
      });
      return;
    }

    if (!symbol) {
      let cancelled = false;
      let pollTimer: ReturnType<typeof setInterval> | null = null;

      setState({
        history: fallbackHistory,
        status: fallbackHistory ? 'fallback' : 'connecting',
        loading: !fallbackHistory,
        error: null,
        sourceLabel:
          fallbackHistory?.source === 'coingecko'
            ? 'CoinGecko'
            : fallbackHistory?.source === 'geckoterminal'
              ? 'GeckoTerminal'
            : fallbackHistory?.source === 'sparkline'
              ? 'Serie local'
              : 'Cargando',
        lastUpdated: fallbackHistory?.updatedAt ?? null,
      });

      const poll = async () => {
        try {
          const provider = await resolveMarketProvider(pair);
          if (cancelled) {
            return;
          }

          if (provider.kind === 'geckoterminal') {
            const nextHistory = await fetchGeckoTerminalHistory(provider.reference, timeframe);
            if (cancelled) {
              return;
            }

            setState({
              history: nextHistory,
              status: 'live',
              loading: false,
              error: null,
              sourceLabel: 'GeckoTerminal live',
              lastUpdated: nextHistory.updatedAt,
            });
            return;
          }

          const nextHistory = await getTradePairChartData(pair, timeframe);
          if (cancelled) {
            return;
          }

          setState({
            history: nextHistory,
            status: 'fallback',
            loading: false,
            error: null,
            sourceLabel:
              nextHistory.source === 'coingecko'
                ? 'CoinGecko'
                : nextHistory.source === 'geckoterminal'
                  ? 'GeckoTerminal'
                  : 'Serie local',
            lastUpdated: nextHistory.updatedAt,
          });
        } catch (error) {
          if (cancelled) {
            return;
          }

          setState((current) => ({
            history: current.history ?? fallbackHistory,
            status: current.history || fallbackHistory ? 'fallback' : 'error',
            loading: false,
            error:
              current.history || fallbackHistory || !(error instanceof Error)
                ? null
                : error.message,
            sourceLabel: current.history || fallbackHistory ? 'Sin stream en vivo' : 'Sin datos',
            lastUpdated: current.lastUpdated ?? fallbackHistory?.updatedAt ?? null,
          }));
        }
      };

      if (!fallbackHistory) {
        void poll();
      } else {
        pollTimer = setInterval(poll, getFallbackPollInterval(timeframe));
      }

      if (!pollTimer) {
        pollTimer = setInterval(poll, getFallbackPollInterval(timeframe));
      }

      return () => {
        cancelled = true;
        if (pollTimer) {
          clearInterval(pollTimer);
        }
      };
    }

    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = (isReconnect = false) => {
      if (cancelled) {
        return;
      }

      setState((current) => ({
        history: current.history ?? fallbackHistory,
        status: isReconnect ? 'reconnecting' : 'connecting',
        loading: !current.history,
        error: null,
        sourceLabel: isReconnect ? 'Reconectando' : 'Conectando',
        lastUpdated: current.lastUpdated ?? fallbackHistory?.updatedAt ?? null,
      }));

      void fetchRealtimeKlines(symbol, timeframe)
        .then((history) => {
          if (cancelled) {
            return;
          }

          setState({
            history,
            status: 'live',
            loading: false,
            error: null,
            sourceLabel: 'Binance live',
            lastUpdated: history.updatedAt,
          });
        })
        .catch((error) => {
          if (cancelled) {
            return;
          }

          setState((current) => ({
            history: current.history ?? fallbackHistory,
            status: current.history || fallbackHistory ? 'reconnecting' : 'error',
            loading: false,
            error:
              current.history || fallbackHistory || !(error instanceof Error)
                ? null
                : error.message,
            sourceLabel: current.history || fallbackHistory ? 'Reconectando' : 'Sin conexion',
            lastUpdated: current.lastUpdated ?? fallbackHistory?.updatedAt ?? null,
          }));
        });

      socket = createRealtimeKlineStream(
        symbol,
        timeframe,
        (kline) => {
          if (cancelled) {
            return;
          }

          setState((current) => {
            const baseHistory = current.history ?? fallbackHistory;
            if (!baseHistory) {
              return current;
            }

            const history = applyRealtimeKlineUpdate(baseHistory, kline);
            return {
              history,
              status: 'live',
              loading: false,
              error: null,
              sourceLabel: 'Binance live',
              lastUpdated: history.updatedAt,
            };
          });
        },
        (error) => {
          if (cancelled) {
            return;
          }

          setState((current) => ({
            history: current.history ?? fallbackHistory,
            status: current.history || fallbackHistory ? 'reconnecting' : 'error',
            loading: false,
            error:
              current.history || fallbackHistory || !(error instanceof Error)
                ? null
                : error.message,
            sourceLabel: current.history || fallbackHistory ? 'Reconectando' : 'Sin conexion',
            lastUpdated: current.lastUpdated ?? fallbackHistory?.updatedAt ?? null,
          }));
        },
      );

      socket.onclose = () => {
        if (cancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          status: current.history ? 'reconnecting' : 'error',
          loading: false,
          error: current.history ? null : 'No pudimos sostener la serie en vivo.',
          sourceLabel: current.history ? 'Reconectando' : 'Sin conexion',
        }));

        reconnectTimer = setTimeout(() => connect(true), 2500);
      };
    };

    setState({
      history: fallbackHistory,
      status: 'connecting',
      loading: !fallbackHistory,
      error: null,
      sourceLabel: 'Conectando',
      lastUpdated: fallbackHistory?.updatedAt ?? null,
    });

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [enabled, fallbackHistory, pair, symbol, timeframe]);

  return state;
}
