import { useEffect, useMemo, useState } from 'react';

import type { MarketPair, OrderBookRow, RecentTradeRow } from '../types';
import { fetchGeckoTerminalRecentTrades } from '../services/marketRealtime/geckoTerminal';
import { resolveMarketProvider } from '../services/marketRealtime/providerResolver';
import {
  createRealtimeCombinedStream,
  fetchRealtimeDepthSnapshot,
  fetchRealtimeRecentTrades,
  resolveRealtimeSymbol,
  type RealtimeFeedStatus,
} from '../services/api/realtimeMarket';

interface RealtimeMarketFeedState {
  orderBook: OrderBookRow[];
  recentTrades: RecentTradeRow[];
  status: RealtimeFeedStatus;
  loading: boolean;
  error: string | null;
  sourceLabel: string;
  lastUpdated: string | null;
}

const INITIAL_STATE: RealtimeMarketFeedState = {
  orderBook: [],
  recentTrades: [],
  status: 'connecting',
  loading: false,
  error: null,
  sourceLabel: 'Conectando',
  lastUpdated: null,
};

export function useRealtimeMarketFeed(
  pair:
    | Pick<
        MarketPair,
        | 'id'
        | 'baseId'
        | 'baseSymbol'
        | 'quoteSymbol'
        | 'contractAddress'
        | 'poolAddress'
        | 'networkKey'
        | 'dexNetwork'
        | 'geckoTerminalUrl'
      >
    | null,
  enabled = true,
) {
  const [state, setState] = useState<RealtimeMarketFeedState>(INITIAL_STATE);

  const symbol = useMemo(() => resolveRealtimeSymbol(pair), [pair]);

  useEffect(() => {
    if (!pair) {
      setState(INITIAL_STATE);
      return;
    }

    if (!enabled) {
      setState({
        orderBook: [],
        recentTrades: [],
        status: 'unsupported',
        loading: false,
        error: null,
        sourceLabel: 'Vista ligera',
        lastUpdated: null,
      });
      return;
    }

    if (!symbol) {
      let cancelled = false;
      let pollTimer: ReturnType<typeof setInterval> | null = null;

      setState({
        orderBook: [],
        recentTrades: [],
        status: 'connecting',
        loading: true,
        error: null,
        sourceLabel: 'Buscando fuente',
        lastUpdated: null,
      });

      const poll = async () => {
        try {
          const provider = await resolveMarketProvider(pair);
          if (cancelled) {
            return;
          }

          if (provider.kind === 'geckoterminal') {
            const recentTrades = await fetchGeckoTerminalRecentTrades(provider.reference);
            if (cancelled) {
              return;
            }

            setState({
              orderBook: [],
              recentTrades,
              status: 'unsupported',
              loading: false,
              error: null,
              sourceLabel: 'GeckoTerminal live',
              lastUpdated: new Date().toISOString(),
            });
            return;
          }

          setState({
            orderBook: [],
            recentTrades: [],
            status: 'unsupported',
            loading: false,
            error: null,
            sourceLabel: 'No disponible',
            lastUpdated: null,
          });
        } catch (error) {
          if (cancelled) {
            return;
          }

          setState({
            orderBook: [],
            recentTrades: [],
            status: 'error',
            loading: false,
            error:
              error instanceof Error ? error.message : 'No se pudo cargar la cinta de mercado.',
            sourceLabel: 'Sin conexion',
            lastUpdated: null,
          });
        }
      };

      void poll();
      pollTimer = setInterval(poll, 12_000);

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

    const connect = () => {
      if (cancelled) {
        return;
      }

      setState((current) => ({
        ...current,
        status: current.orderBook.length ? current.status : 'connecting',
        loading: !current.orderBook.length,
        error: null,
        sourceLabel: current.orderBook.length ? current.sourceLabel : 'Conectando',
      }));

      socket = createRealtimeCombinedStream(
        symbol,
        (rows) => {
          if (cancelled) {
            return;
          }

          setState((current) => ({
            ...current,
            orderBook: rows,
            status: 'live',
            loading: false,
            error: null,
            sourceLabel: 'Binance live',
            lastUpdated: new Date().toISOString(),
          }));
        },
        (trade) => {
          if (cancelled) {
            return;
          }

          setState((current) => ({
            ...current,
            recentTrades: [trade, ...current.recentTrades]
              .filter(
                (row, index, rows) =>
                  rows.findIndex((candidate) => candidate.id === row.id) === index,
              )
              .slice(0, 16),
            status: 'live',
            loading: false,
            error: null,
            sourceLabel: 'Binance live',
            lastUpdated: new Date().toISOString(),
          }));
        },
        (error) => {
          if (cancelled) {
            return;
          }

          setState((current) => ({
            ...current,
            status: current.orderBook.length ? 'live' : 'error',
            loading: false,
            error: current.orderBook.length ? null : error.message,
            sourceLabel: current.orderBook.length ? 'Binance live' : 'Sin conexion',
          }));
        },
      );

      socket.onclose = () => {
        if (cancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          status: current.orderBook.length ? 'live' : 'error',
          loading: false,
          error: current.orderBook.length ? null : 'El libro en vivo se desconecto temporalmente.',
          sourceLabel: current.orderBook.length ? 'Binance live' : 'Sin conexion',
        }));

        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    setState({
      orderBook: [],
      recentTrades: [],
      status: 'connecting',
      loading: true,
      error: null,
      sourceLabel: 'Conectando',
      lastUpdated: null,
    });

    void Promise.all([
      fetchRealtimeDepthSnapshot(symbol),
      fetchRealtimeRecentTrades(symbol),
    ])
      .then(([orderBook, recentTrades]) => {
        if (cancelled) {
          return;
        }

        setState({
          orderBook,
          recentTrades,
          status: 'connecting',
          loading: false,
          error: null,
          sourceLabel: 'Sincronizando',
          lastUpdated: new Date().toISOString(),
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setState({
          orderBook: [],
          recentTrades: [],
          status: 'error',
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el libro en vivo.',
          sourceLabel: 'Sin conexion',
          lastUpdated: null,
        });
      })
      .finally(() => {
        connect();
      });

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
