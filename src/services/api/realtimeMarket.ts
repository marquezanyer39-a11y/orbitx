import type { OrbitChartTimeframe } from '../../../components/charts/chartData';
import type {
  MarketChartCandle,
  MarketChartHistory,
  MarketChartPoint,
  MarketChartVolume,
  MarketPair,
  MarketRealtimeStatus,
  MarketRealtimeTicker,
  OrderBookRow,
  RecentTradeRow,
  TradeSide,
} from '../../types';
import { appConfig } from '../../constants/appConfig';

const BINANCE_REST_BASE_URL = 'https://api.binance.com/api/v3';
const BINANCE_STREAM_BASE_URL = 'wss://stream.binance.com:9443/stream?streams=';
const MAX_KLINE_POINTS = 320;

type BinanceKlineRow = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string?,
];

interface BinanceDepthSnapshot {
  lastUpdateId: number;
  bids: string[][];
  asks: string[][];
}

interface BinanceRecentTrade {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
  isBestMatch: boolean;
}

interface BinanceTickerRestPayload {
  symbol: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  quoteVolume: string;
  closeTime: number;
}

interface BinanceTradeStreamPayload {
  e: 'trade';
  E: number;
  s: string;
  t: number;
  p: string;
  q: string;
  T: number;
  m: boolean;
  M: boolean;
}

interface BinanceTickerStreamPayload {
  e: '24hrTicker';
  E: number;
  s: string;
  c: string;
  P: string;
  h: string;
  l: string;
  q: string;
}

interface BinanceKlineStreamPayload {
  e: 'kline';
  E: number;
  s: string;
  k: {
    t: number;
    T: number;
    s: string;
    i: string;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    q: string;
    n: number;
    x: boolean;
  };
}

interface BinancePartialDepthPayload {
  lastUpdateId: number;
  bids: string[][];
  asks: string[][];
}

interface BinanceCombinedStreamEnvelope<T> {
  stream: string;
  data: T;
}

export type RealtimeFeedStatus = MarketRealtimeStatus;

function normalizePairId(pairId: string) {
  return pairId.trim().toLowerCase();
}

function parseDepthEntries(entries: string[][], side: TradeSide, descending = true): OrderBookRow[] {
  const rows = entries
    .map(([priceRaw, quantityRaw], index) => {
      const price = Number(priceRaw);
      const quantity = Number(quantityRaw);

      if (!Number.isFinite(price) || !Number.isFinite(quantity) || price <= 0 || quantity <= 0) {
        return null;
      }

      return {
        id: `${side}-${priceRaw}-${index}`,
        side,
        price,
        quantity,
        total: price * quantity,
      } satisfies OrderBookRow;
    })
    .filter((row): row is OrderBookRow => Boolean(row));

  return rows.sort((left, right) =>
    descending ? right.price - left.price : left.price - right.price,
  );
}

function parseTradeSide(isBuyerMaker: boolean): TradeSide {
  return isBuyerMaker ? 'sell' : 'buy';
}

function asPositiveNumber(raw: string | number) {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function mapTickerPayload(
  payload: Pick<
    BinanceTickerRestPayload,
    'lastPrice' | 'priceChangePercent' | 'highPrice' | 'lowPrice' | 'quoteVolume'
  > &
    Partial<Pick<BinanceTickerRestPayload, 'closeTime'>>,
): MarketRealtimeTicker {
  return {
    source: 'binance',
    price: asPositiveNumber(payload.lastPrice),
    change24h: Number(payload.priceChangePercent) || 0,
    high24h: asPositiveNumber(payload.highPrice),
    low24h: asPositiveNumber(payload.lowPrice),
    volume24h: asPositiveNumber(payload.quoteVolume),
    updatedAt: new Date(payload.closeTime ?? Date.now()).toISOString(),
  };
}

function mapTradeRow(trade: BinanceRecentTrade): RecentTradeRow | null {
  const price = Number(trade.price);
  const quantity = Number(trade.qty);

  if (!Number.isFinite(price) || !Number.isFinite(quantity) || price <= 0 || quantity <= 0) {
    return null;
  }

  return {
    id: `binance-trade-${trade.id}`,
    side: parseTradeSide(trade.isBuyerMaker),
    price,
    quantity,
    time: new Date(trade.time).toISOString(),
  };
}

function klineTimeToSeconds(openTime: number) {
  return Math.floor(openTime / 1000);
}

function mapKlineRowToCandle(row: BinanceKlineRow): MarketChartCandle | null {
  const [openTime, openRaw, highRaw, lowRaw, closeRaw] = row;
  const open = Number(openRaw);
  const high = Number(highRaw);
  const low = Number(lowRaw);
  const close = Number(closeRaw);

  if (
    !Number.isFinite(open) ||
    !Number.isFinite(high) ||
    !Number.isFinite(low) ||
    !Number.isFinite(close) ||
    close <= 0
  ) {
    return null;
  }

  return {
    time: klineTimeToSeconds(openTime),
    open,
    high,
    low,
    close,
  };
}

function mapKlineRowToVolume(row: BinanceKlineRow): MarketChartVolume | null {
  const [openTime, , , , , volumeRaw] = row;
  const value = Number(volumeRaw);

  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return {
    time: klineTimeToSeconds(openTime),
    value,
  };
}

function buildHistoryFromKlines(rows: BinanceKlineRow[]): MarketChartHistory {
  const candles = rows
    .map(mapKlineRowToCandle)
    .filter((candle): candle is MarketChartCandle => Boolean(candle));
  const volume = rows
    .map(mapKlineRowToVolume)
    .filter((point): point is MarketChartVolume => Boolean(point));
  const line: MarketChartPoint[] = candles.map((candle) => ({
    time: candle.time,
    value: candle.close,
  }));

  return {
    source: 'binance',
    candles,
    line,
    volume,
    updatedAt: new Date().toISOString(),
  };
}

function clampHistoryLength(history: MarketChartHistory) {
  return {
    ...history,
    candles: history.candles.slice(-MAX_KLINE_POINTS),
    line: history.line.slice(-MAX_KLINE_POINTS),
    volume: history.volume.slice(-MAX_KLINE_POINTS),
  };
}

export function mapChartTimeframeToBinanceInterval(timeframe: OrbitChartTimeframe) {
  switch (timeframe) {
    case '1m':
      return '1m';
    case '5m':
      return '5m';
    case '15m':
      return '15m';
    case '1h':
      return '1h';
    case '4h':
      return '4h';
    case '1D':
      return '1d';
    default:
      return '5m';
  }
}

export function applyRealtimeKlineUpdate(
  history: MarketChartHistory,
  payload: BinanceKlineStreamPayload['k'],
) {
  const nextCandle: MarketChartCandle = {
    time: klineTimeToSeconds(payload.t),
    open: asPositiveNumber(payload.o),
    high: asPositiveNumber(payload.h),
    low: asPositiveNumber(payload.l),
    close: asPositiveNumber(payload.c),
  };
  const nextVolume: MarketChartVolume = {
    time: nextCandle.time,
    value: asPositiveNumber(payload.v),
  };
  const nextLinePoint: MarketChartPoint = {
    time: nextCandle.time,
    value: nextCandle.close,
  };

  const candles = history.candles.slice();
  const volume = history.volume.slice();
  const line = history.line.slice();
  const existingIndex = candles.findIndex((item) => item.time === nextCandle.time);

  if (existingIndex >= 0) {
    candles[existingIndex] = nextCandle;
    volume[existingIndex] = nextVolume;
    line[existingIndex] = nextLinePoint;
  } else {
    candles.push(nextCandle);
    volume.push(nextVolume);
    line.push(nextLinePoint);
  }

  return clampHistoryLength({
    source: 'binance',
    candles,
    volume,
    line,
    updatedAt: new Date(payload.T || Date.now()).toISOString(),
  });
}

export function resolveRealtimeSymbol(
  pair: Pick<MarketPair, 'id' | 'baseSymbol' | 'quoteSymbol'> | null,
) {
  if (!pair) {
    return null;
  }

  const pairId = normalizePairId(pair.id);
  const supported = appConfig.supportedPairs.includes(
    pairId as (typeof appConfig.supportedPairs)[number],
  );

  if (!supported || pair.quoteSymbol.toUpperCase() !== 'USDT') {
    return null;
  }

  return `${pair.baseSymbol}${pair.quoteSymbol}`.replace('/', '').toUpperCase();
}

export async function fetchRealtimeDepthSnapshot(symbol: string, limit = 20) {
  const response = await fetch(
    `${BINANCE_REST_BASE_URL}/depth?symbol=${encodeURIComponent(symbol)}&limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error(`Binance respondio ${response.status} al cargar profundidad.`);
  }

  const payload = (await response.json()) as BinanceDepthSnapshot;

  return [
    ...parseDepthEntries(payload.asks ?? [], 'sell', true),
    ...parseDepthEntries(payload.bids ?? [], 'buy', true),
  ];
}

export async function fetchRealtimeRecentTrades(symbol: string, limit = 14) {
  const response = await fetch(
    `${BINANCE_REST_BASE_URL}/trades?symbol=${encodeURIComponent(symbol)}&limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error(`Binance respondio ${response.status} al cargar operaciones.`);
  }

  const payload = (await response.json()) as BinanceRecentTrade[];

  return payload
    .map(mapTradeRow)
    .filter((trade): trade is RecentTradeRow => Boolean(trade))
    .sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime());
}

export async function fetchRealtimeTickerSnapshot(symbol: string) {
  const response = await fetch(
    `${BINANCE_REST_BASE_URL}/ticker/24hr?symbol=${encodeURIComponent(symbol)}`,
  );

  if (!response.ok) {
    throw new Error(`Binance respondio ${response.status} al cargar el ticker.`);
  }

  const payload = (await response.json()) as BinanceTickerRestPayload;
  return mapTickerPayload(payload);
}

export async function fetchRealtimeKlines(
  symbol: string,
  timeframe: OrbitChartTimeframe,
  limit = MAX_KLINE_POINTS,
) {
  const response = await fetch(
    `${BINANCE_REST_BASE_URL}/klines?symbol=${encodeURIComponent(symbol)}&interval=${mapChartTimeframeToBinanceInterval(timeframe)}&limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error(`Binance respondio ${response.status} al cargar las velas.`);
  }

  const payload = (await response.json()) as BinanceKlineRow[];
  return buildHistoryFromKlines(payload);
}

function createStreamSocket(streams: string[]) {
  return new WebSocket(`${BINANCE_STREAM_BASE_URL}${streams.join('/')}`);
}

export function createRealtimeCombinedStream(
  symbol: string,
  onDepth: (rows: OrderBookRow[]) => void,
  onTrade: (trade: RecentTradeRow) => void,
  onError?: (error: Error) => void,
) {
  const normalized = symbol.toLowerCase();
  const socket = createStreamSocket([`${normalized}@depth20@100ms`, `${normalized}@trade`]);

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(
        typeof event.data === 'string' ? event.data : String(event.data),
      ) as
        | BinanceCombinedStreamEnvelope<BinancePartialDepthPayload>
        | BinanceCombinedStreamEnvelope<BinanceTradeStreamPayload>;

      if (payload.stream.endsWith('@trade')) {
        const tradePayload = payload.data as BinanceTradeStreamPayload;
        const price = Number(tradePayload.p);
        const quantity = Number(tradePayload.q);

        if (!Number.isFinite(price) || !Number.isFinite(quantity) || price <= 0 || quantity <= 0) {
          return;
        }

        onTrade({
          id: `binance-live-${tradePayload.t}`,
          side: parseTradeSide(tradePayload.m),
          price,
          quantity,
          time: new Date(tradePayload.T).toISOString(),
        });
        return;
      }

      const depthPayload = payload.data as BinancePartialDepthPayload;
      onDepth([
        ...parseDepthEntries(depthPayload.asks ?? [], 'sell', true),
        ...parseDepthEntries(depthPayload.bids ?? [], 'buy', true),
      ]);
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error('No se pudo leer el feed en vivo.'),
      );
    }
  };

  socket.onerror = () => {
    onError?.(new Error('El feed en vivo de Binance no respondio como esperabamos.'));
  };

  return socket;
}

export function createRealtimeTickerStream(
  symbol: string,
  onTicker: (ticker: MarketRealtimeTicker) => void,
  onError?: (error: Error) => void,
) {
  const normalized = symbol.toLowerCase();
  const socket = createStreamSocket([`${normalized}@ticker`]);

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(
        typeof event.data === 'string' ? event.data : String(event.data),
      ) as BinanceCombinedStreamEnvelope<BinanceTickerStreamPayload>;

      onTicker(
        mapTickerPayload({
          lastPrice: payload.data.c,
          priceChangePercent: payload.data.P,
          highPrice: payload.data.h,
          lowPrice: payload.data.l,
          quoteVolume: payload.data.q,
          closeTime: payload.data.E,
        }),
      );
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error('No se pudo leer el ticker en vivo.'),
      );
    }
  };

  socket.onerror = () => {
    onError?.(new Error('El ticker en vivo no respondio como esperabamos.'));
  };

  return socket;
}

export function createRealtimeKlineStream(
  symbol: string,
  timeframe: OrbitChartTimeframe,
  onKline: (payload: BinanceKlineStreamPayload['k']) => void,
  onError?: (error: Error) => void,
) {
  const normalized = symbol.toLowerCase();
  const interval = mapChartTimeframeToBinanceInterval(timeframe);
  const socket = createStreamSocket([`${normalized}@kline_${interval}`]);

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(
        typeof event.data === 'string' ? event.data : String(event.data),
      ) as BinanceCombinedStreamEnvelope<BinanceKlineStreamPayload>;

      onKline(payload.data.k);
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error('No se pudo leer las velas en vivo.'),
      );
    }
  };

  socket.onerror = () => {
    onError?.(new Error('La transmision de velas no respondio como esperabamos.'));
  };

  return socket;
}
