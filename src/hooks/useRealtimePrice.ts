import { useEffect, useMemo, useState } from 'react';

import type { MarketPair, MarketRealtimeStatus, MarketRealtimeTicker } from '../types';
import { appConfig } from '../constants/appConfig';
import { getTradePairDataByBaseId } from '../services/api/market';
import { fetchGeckoTerminalTicker } from '../services/marketRealtime/geckoTerminal';
import { resolveMarketProvider } from '../services/marketRealtime/providerResolver';
import {
  createRealtimeTickerStream,
  fetchRealtimeTickerSnapshot,
  resolveRealtimeSymbol,
} from '../services/api/realtimeMarket';

interface RealtimePriceState {
  ticker: MarketRealtimeTicker | null;
  status: MarketRealtimeStatus;
  loading: boolean;
  error: string | null;
  sourceLabel: string;
  lastUpdated: string | null;
}

const INITIAL_STATE: RealtimePriceState = {
  ticker: null,
  status: 'connecting',
  loading: false,
  error: null,
  sourceLabel: 'Cargando',
  lastUpdated: null,
};

function buildSeedTicker(
  pair: Pick<MarketPair, 'price' | 'change24h' | 'high24h' | 'low24h' | 'volume24h'>,
): MarketRealtimeTicker {
  return {
    source: 'pair',
    price: pair.price,
    change24h: pair.change24h,
    high24h: pair.high24h,
    low24h: pair.low24h,
    volume24h: pair.volume24h,
    updatedAt: new Date().toISOString(),
  };
}

export function useRealtimePrice(
  pair:
    | Pick<
        MarketPair,
        | 'id'
        | 'baseId'
        | 'baseSymbol'
        | 'quoteSymbol'
        | 'price'
        | 'change24h'
        | 'high24h'
        | 'low24h'
        | 'volume24h'
        | 'contractAddress'
        | 'poolAddress'
        | 'networkKey'
        | 'dexNetwork'
        | 'geckoTerminalUrl'
      >
    | null,
  enabled = true,
) {
  const [state, setState] = useState<RealtimePriceState>(INITIAL_STATE);
  const symbol = useMemo(() => resolveRealtimeSymbol(pair), [pair]);

  useEffect(() => {
    if (!pair) {
      setState(INITIAL_STATE);
      return;
    }

    const seedTicker = buildSeedTicker(pair);

    if (!enabled) {
      setState({
        ticker: seedTicker,
        status: 'fallback',
        loading: false,
        error: null,
        sourceLabel: 'Vista ligera',
        lastUpdated: seedTicker.updatedAt,
      });
      return;
    }

    if (!symbol) {
      let cancelled = false;
      let pollTimer: ReturnType<typeof setInterval> | null = null;

      setState({
        ticker: seedTicker,
        status: 'fallback',
        loading: false,
        error: null,
        sourceLabel: 'Ultima lectura',
        lastUpdated: seedTicker.updatedAt,
      });

      const poll = async () => {
        try {
          const provider = await resolveMarketProvider(pair);
          if (cancelled) {
            return;
          }

          if (provider.kind === 'geckoterminal') {
            const ticker = await fetchGeckoTerminalTicker(provider.reference);
            if (cancelled) {
              return;
            }

            setState({
              ticker,
              status: 'live',
              loading: false,
              error: null,
              sourceLabel: 'GeckoTerminal live',
              lastUpdated: ticker.updatedAt,
            });
            return;
          }

          const nextPair = await getTradePairDataByBaseId(pair.baseId);
          if (cancelled) {
            return;
          }

          setState({
            ticker: {
              source: 'coingecko',
              price: nextPair.price,
              change24h: nextPair.change24h,
              high24h: nextPair.high24h,
              low24h: nextPair.low24h,
              volume24h: nextPair.volume24h,
              updatedAt: new Date().toISOString(),
            },
            status: 'fallback',
            loading: false,
            error: null,
            sourceLabel: 'CoinGecko',
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          if (cancelled) {
            return;
          }

          setState((current) => ({
            ...current,
            status: current.ticker ? 'fallback' : 'error',
            loading: false,
            error:
              current.ticker || !(error instanceof Error)
                ? null
                : error.message,
            sourceLabel: current.ticker ? 'Sin stream en vivo' : 'Sin datos',
          }));
        }
      };

      void poll();
      pollTimer = setInterval(poll, appConfig.refreshIntervals.trade);

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
        ticker: current.ticker ?? seedTicker,
        status: isReconnect ? 'reconnecting' : 'connecting',
        loading: !current.ticker,
        error: null,
        sourceLabel: isReconnect ? 'Reconectando' : 'Conectando',
        lastUpdated: current.lastUpdated ?? seedTicker.updatedAt,
      }));

      void fetchRealtimeTickerSnapshot(symbol)
        .then((ticker) => {
          if (cancelled) {
            return;
          }

          setState({
            ticker,
            status: 'live',
            loading: false,
            error: null,
            sourceLabel: 'Binance live',
            lastUpdated: ticker.updatedAt,
          });
        })
        .catch((error) => {
          if (cancelled) {
            return;
          }

          setState((current) => ({
            ticker: current.ticker ?? seedTicker,
            status: current.ticker ? 'reconnecting' : 'error',
            loading: false,
            error:
              current.ticker || !(error instanceof Error)
                ? null
                : error.message,
            sourceLabel: current.ticker ? 'Reconectando' : 'Sin conexion',
            lastUpdated: current.lastUpdated ?? seedTicker.updatedAt,
          }));
        });

      socket = createRealtimeTickerStream(
        symbol,
        (ticker) => {
          if (cancelled) {
            return;
          }

          setState({
            ticker,
            status: 'live',
            loading: false,
            error: null,
            sourceLabel: 'Binance live',
            lastUpdated: ticker.updatedAt,
          });
        },
        (error) => {
          if (cancelled) {
            return;
          }

          setState((current) => ({
            ticker: current.ticker ?? seedTicker,
            status: current.ticker ? 'reconnecting' : 'error',
            loading: false,
            error:
              current.ticker || !(error instanceof Error)
                ? null
                : error.message,
            sourceLabel: current.ticker ? 'Reconectando' : 'Sin conexion',
            lastUpdated: current.lastUpdated ?? seedTicker.updatedAt,
          }));
        },
      );

      socket.onclose = () => {
        if (cancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          status: current.ticker ? 'reconnecting' : 'error',
          loading: false,
          error: current.ticker ? null : 'No pudimos sostener el ticker en vivo.',
          sourceLabel: current.ticker ? 'Reconectando' : 'Sin conexion',
        }));

        reconnectTimer = setTimeout(() => connect(true), 2500);
      };
    };

    setState({
      ticker: seedTicker,
      status: 'connecting',
      loading: true,
      error: null,
      sourceLabel: 'Conectando',
      lastUpdated: seedTicker.updatedAt,
    });

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [enabled, pair, symbol]);

  return state;
}
