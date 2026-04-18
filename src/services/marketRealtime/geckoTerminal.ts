import type { OrbitChartTimeframe } from '../../../components/charts/chartData';
import type {
  MarketChartCandle,
  MarketChartHistory,
  MarketChartPoint,
  MarketChartVolume,
  MarketRealtimeTicker,
  RecentTradeRow,
  TradeSide,
} from '../../types';

const GECKO_TERMINAL_BASE_URL = 'https://api.geckoterminal.com/api/v2';

export type GeckoTerminalNetworkId = 'eth' | 'base' | 'bsc' | 'solana';

export interface GeckoTerminalPoolReference {
  networkId: GeckoTerminalNetworkId;
  tokenAddress?: string | null;
  poolAddress: string;
  pairId?: string;
}

interface GeckoTerminalPoolAttributes {
  address?: string;
  base_token_price_usd?: string;
  token_price_usd?: string;
  fdv_usd?: string;
  market_cap_usd?: string;
  reserve_in_usd?: string;
  volume_usd?: Record<string, string>;
  price_change_percentage?: Record<string, string>;
}

interface GeckoTerminalPoolPayload {
  data?: {
    id?: string;
    attributes?: GeckoTerminalPoolAttributes;
  };
}

interface GeckoTerminalPoolListPayload {
  data?: Array<{
    id?: string;
    attributes?: GeckoTerminalPoolAttributes;
  }>;
}

interface GeckoTerminalOhlcvPayload {
  data?: {
    attributes?: {
      ohlcv_list?: Array<[number, number, number, number, number, number]>;
    };
  };
}

interface GeckoTerminalTradesPayload {
  data?: Array<{
    id?: string;
    attributes?: {
      price_from_in_usd?: string;
      price_to_in_usd?: string;
      from_token_amount?: string;
      to_token_amount?: string;
      block_timestamp?: string;
      kind?: 'buy' | 'sell';
      volume_in_usd?: string;
    };
  }>;
}

function buildHeaders() {
  const headers: Record<string, string> = {
    Accept: 'application/json;version=20230302',
  };

  if (typeof document === 'undefined') {
    headers['User-Agent'] = 'OrbitX/1.0 (+https://orbitx.app)';
  }

  return headers;
}

async function fetchGeckoTerminalJson<T>(path: string) {
  const response = await fetch(`${GECKO_TERMINAL_BASE_URL}${path}`, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(`GeckoTerminal respondio ${response.status}`);
  }

  return (await response.json()) as T;
}

function asPositiveNumber(raw: string | number | undefined | null) {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function parseTradeSide(value?: string): TradeSide {
  return value === 'sell' ? 'sell' : 'buy';
}

function mapPoolPrice(attributes?: GeckoTerminalPoolAttributes) {
  return asPositiveNumber(attributes?.base_token_price_usd ?? attributes?.token_price_usd);
}

function getTimeframeConfig(timeframe: OrbitChartTimeframe) {
  switch (timeframe) {
    case '1m':
      return { unit: 'minute', aggregate: 1, limit: 240 };
    case '5m':
      return { unit: 'minute', aggregate: 5, limit: 240 };
    case '15m':
      return { unit: 'minute', aggregate: 15, limit: 240 };
    case '1h':
      return { unit: 'hour', aggregate: 1, limit: 240 };
    case '4h':
      return { unit: 'hour', aggregate: 4, limit: 180 };
    case '1D':
      return { unit: 'day', aggregate: 1, limit: 180 };
    default:
      return { unit: 'minute', aggregate: 5, limit: 240 };
  }
}

function mapOhlcvListToHistory(
  rows: Array<[number, number, number, number, number, number]>,
): MarketChartHistory {
  const orderedRows = rows
    .filter(
      (row) =>
        Array.isArray(row) &&
        row.length >= 6 &&
        row.every((value) => Number.isFinite(value)) &&
        row[4] > 0,
    )
    .slice()
    .sort((left, right) => left[0] - right[0]);

  const candles: MarketChartCandle[] = orderedRows.map(([time, open, high, low, close]) => ({
    time,
    open,
    high,
    low,
    close,
  }));
  const line: MarketChartPoint[] = orderedRows.map(([time, , , , close]) => ({
    time,
    value: close,
  }));
  const volume: MarketChartVolume[] = orderedRows.map(([time, , , , , rawVolume]) => ({
    time,
    value: rawVolume,
  }));

  return {
    source: 'geckoterminal',
    candles,
    line,
    volume,
    updatedAt: new Date().toISOString(),
  };
}

function scorePool(attributes?: GeckoTerminalPoolAttributes) {
  const reserve = asPositiveNumber(attributes?.reserve_in_usd);
  const volume24h = asPositiveNumber(attributes?.volume_usd?.h24);
  const marketCap = asPositiveNumber(attributes?.market_cap_usd);

  return reserve * 10 + volume24h + marketCap * 0.05;
}

export function mapOrbitNetworkToGeckoNetwork(raw?: string | null): GeckoTerminalNetworkId | null {
  if (!raw) {
    return null;
  }

  const normalized = raw.trim().toLowerCase();

  if (['ethereum', 'eth', 'ethereummainnet'].includes(normalized)) {
    return 'eth';
  }

  if (['base', 'base-mainnet', 'base network'].includes(normalized)) {
    return 'base';
  }

  if (
    ['bnb', 'bsc', 'binance-smart-chain', 'binance smart chain', 'bnb chain'].includes(
      normalized,
    )
  ) {
    return 'bsc';
  }

  if (['solana', 'sol'].includes(normalized)) {
    return 'solana';
  }

  return null;
}

export async function fetchGeckoTerminalPool(
  networkId: GeckoTerminalNetworkId,
  poolAddress: string,
) {
  const payload = await fetchGeckoTerminalJson<GeckoTerminalPoolPayload>(
    `/networks/${networkId}/pools/${poolAddress}`,
  );

  return payload.data?.attributes ?? null;
}

export async function fetchGeckoTerminalTopPool(
  networkId: GeckoTerminalNetworkId,
  tokenAddress: string,
) {
  const payload = await fetchGeckoTerminalJson<GeckoTerminalPoolListPayload>(
    `/networks/${networkId}/tokens/${tokenAddress}/pools`,
  );

  const bestPool = (payload.data ?? [])
    .filter((item) => Boolean(item.attributes?.address))
    .sort((left, right) => scorePool(right.attributes) - scorePool(left.attributes))[0];

  if (!bestPool?.attributes?.address) {
    return null;
  }

  return {
    networkId,
    tokenAddress,
    poolAddress: bestPool.attributes.address,
  } satisfies GeckoTerminalPoolReference;
}

export async function fetchGeckoTerminalTicker(reference: GeckoTerminalPoolReference) {
  const [pool, dayHistory] = await Promise.all([
    fetchGeckoTerminalPool(reference.networkId, reference.poolAddress),
    fetchGeckoTerminalHistory(reference, '1D', 2).catch(() => null),
  ]);

  if (!pool) {
    throw new Error('No encontramos la referencia on-chain de este pool.');
  }

  const latestDay = dayHistory?.candles[dayHistory.candles.length - 1] ?? null;
  const price = mapPoolPrice(pool);

  return {
    source: 'geckoterminal',
    price,
    change24h: Number(pool.price_change_percentage?.h24 ?? 0) || 0,
    high24h: latestDay?.high ?? price,
    low24h: latestDay?.low ?? price,
    volume24h: asPositiveNumber(pool.volume_usd?.h24),
    updatedAt: new Date().toISOString(),
  } satisfies MarketRealtimeTicker;
}

export async function fetchGeckoTerminalHistory(
  reference: GeckoTerminalPoolReference,
  timeframe: OrbitChartTimeframe,
  limitOverride?: number,
) {
  const config = getTimeframeConfig(timeframe);
  const limit = limitOverride ?? config.limit;
  const payload = await fetchGeckoTerminalJson<GeckoTerminalOhlcvPayload>(
    `/networks/${reference.networkId}/pools/${reference.poolAddress}/ohlcv/${config.unit}?aggregate=${config.aggregate}&limit=${limit}&currency=usd`,
  );

  const ohlcvList = payload.data?.attributes?.ohlcv_list ?? [];
  return mapOhlcvListToHistory(ohlcvList);
}

export async function fetchGeckoTerminalRecentTrades(
  reference: GeckoTerminalPoolReference,
  limit = 16,
) {
  const payload = await fetchGeckoTerminalJson<GeckoTerminalTradesPayload>(
    `/networks/${reference.networkId}/pools/${reference.poolAddress}/trades`,
  );

  return (payload.data ?? [])
    .map((trade) => {
      const side = parseTradeSide(trade.attributes?.kind);
      const price = asPositiveNumber(
        side === 'buy' ? trade.attributes?.price_to_in_usd : trade.attributes?.price_from_in_usd,
      );
      const quantity = asPositiveNumber(
        side === 'buy' ? trade.attributes?.to_token_amount : trade.attributes?.from_token_amount,
      );
      const time = trade.attributes?.block_timestamp ?? new Date().toISOString();

      if (!price || !quantity) {
        return null;
      }

      return {
        id: trade.id ?? `${reference.poolAddress}-${time}-${price}`,
        side,
        price,
        quantity,
        time,
      } satisfies RecentTradeRow;
    })
    .filter((trade): trade is RecentTradeRow => Boolean(trade))
    .slice(0, limit);
}

export async function fetchGeckoTerminalMiniSparkline(reference: GeckoTerminalPoolReference) {
  const history = await fetchGeckoTerminalHistory(reference, '5m', 28);
  return history.line.map((point) => point.value).slice(-28);
}
