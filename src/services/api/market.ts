import type {
  MarketChartCandle,
  MarketChartHistory,
  MarketChartPoint,
  MarketChartVolume,
  MarketCoin,
  MarketPair,
} from '../../types';
import { appConfig } from '../../constants/appConfig';
import {
  fetchCoinDetail,
  fetchCoinMarketChart,
  fetchCoinMarkets,
  fetchSimplePrices,
  type CoinGeckoCoinDetail,
  type CoinGeckoMarketRow,
} from './coingecko';
import type { OrbitChartTimeframe } from '../../../components/charts/chartData';
import { fetchGeckoTerminalHistory } from '../marketRealtime/geckoTerminal';
import { resolveMarketProvider } from '../marketRealtime/providerResolver';

function symbolToPairId(symbol: string) {
  return `${symbol.toLowerCase()}-usdt`;
}

function mapMarketRow(row: CoinGeckoMarketRow): MarketCoin {
  return {
    id: symbolToPairId(row.symbol),
    coingeckoId: row.id,
    symbol: row.symbol.toUpperCase(),
    name: row.name,
    image: row.image,
    currentPrice: row.current_price ?? 0,
    priceChange24h: row.price_change_percentage_24h ?? 0,
    high24h: row.high_24h ?? row.current_price ?? 0,
    low24h: row.low_24h ?? row.current_price ?? 0,
    volume24h: row.total_volume ?? 0,
    marketCap: row.market_cap ?? 0,
    sparkline: row.sparkline_in_7d?.price?.slice(-48) ?? [],
    lastUpdated: row.last_updated ?? new Date().toISOString(),
  };
}

function mapPair(coin: MarketCoin): MarketPair {
  return {
    id: coin.id,
    baseId: coin.coingeckoId,
    quoteId: 'tether',
    symbol: `${coin.symbol}/USDT`,
    baseSymbol: coin.symbol,
    quoteSymbol: 'USDT',
    price: coin.currentPrice,
    change24h: coin.priceChange24h,
    high24h: coin.high24h,
    low24h: coin.low24h,
    volume24h: coin.volume24h,
    image: coin.image,
    sparkline: coin.sparkline,
    marketSource: 'coingecko',
    coin,
  };
}

function mapDetailToPair(detail: CoinGeckoCoinDetail): MarketPair {
  const price = detail.market_data?.current_price?.usd ?? 0;
  const detailPlatforms = detail.detail_platforms ?? {};
  const preferredPlatform =
    Object.entries(detailPlatforms).find(([, platform]) => platform?.geckoterminal_url)?.[1] ??
    Object.values(detailPlatforms).find((platform) => platform?.contract_address);
  const geckoTerminalUrl = preferredPlatform?.geckoterminal_url ?? null;
  const contractAddress = preferredPlatform?.contract_address?.trim() || null;

  return {
    id: symbolToPairId(detail.symbol),
    baseId: detail.id,
    quoteId: 'tether',
    symbol: `${detail.symbol.toUpperCase()}/USDT`,
    baseSymbol: detail.symbol.toUpperCase(),
    quoteSymbol: 'USDT',
    price,
    change24h: detail.market_data?.price_change_percentage_24h ?? 0,
    high24h: detail.market_data?.high_24h?.usd ?? price,
    low24h: detail.market_data?.low_24h?.usd ?? price,
    volume24h: detail.market_data?.total_volume?.usd ?? 0,
    image: detail.image?.large || detail.image?.thumb || '',
    sparkline: [],
    marketSource: contractAddress ? 'geckoterminal' : 'coingecko',
    contractAddress,
    geckoTerminalUrl,
    coin: {
      id: symbolToPairId(detail.symbol),
      coingeckoId: detail.id,
      symbol: detail.symbol.toUpperCase(),
      name: detail.name,
      image: detail.image?.large || detail.image?.thumb || '',
      currentPrice: price,
      priceChange24h: detail.market_data?.price_change_percentage_24h ?? 0,
      high24h: detail.market_data?.high_24h?.usd ?? price,
      low24h: detail.market_data?.low_24h?.usd ?? price,
      volume24h: detail.market_data?.total_volume?.usd ?? 0,
      marketCap: 0,
      sparkline: [],
      lastUpdated: new Date().toISOString(),
    },
  };
}

export async function getTradePairDataByBaseId(baseId: string) {
  const detail = await fetchCoinDetail(baseId);
  return mapDetailToPair(detail);
}

const CHART_TIMEFRAME_CONFIG: Record<
  OrbitChartTimeframe,
  { days: number; interval?: 'hourly' | 'daily'; bucketMinutes: number }
> = {
  '1m': { days: 1, bucketMinutes: 5 },
  '5m': { days: 1, bucketMinutes: 5 },
  '15m': { days: 1, bucketMinutes: 15 },
  '1h': { days: 7, interval: 'hourly', bucketMinutes: 60 },
  '4h': { days: 30, interval: 'hourly', bucketMinutes: 240 },
  '1D': { days: 180, interval: 'daily', bucketMinutes: 1440 },
};

function sanitizeMarketChartRows(rows: number[][]) {
  return rows.filter(
    (row): row is [number, number] =>
      Array.isArray(row) &&
      row.length >= 2 &&
      Number.isFinite(row[0]) &&
      Number.isFinite(row[1]) &&
      row[1] > 0,
  );
}

function bucketTimestamp(timestampMs: number, bucketMinutes: number) {
  const bucketMs = bucketMinutes * 60 * 1000;
  return Math.floor(timestampMs / bucketMs) * bucketMs;
}

function buildHistoryFromSparkline(
  sparkline: number[],
  timeframe: OrbitChartTimeframe,
): MarketChartHistory {
  const nowMs = Date.now();
  const stepMs = CHART_TIMEFRAME_CONFIG[timeframe].bucketMinutes * 60 * 1000;
  const cleaned = sparkline.filter((value) => Number.isFinite(value) && value > 0);
  const startMs = nowMs - stepMs * Math.max(cleaned.length - 1, 0);

  const line: MarketChartPoint[] = cleaned.map((value, index) => ({
    time: Math.floor((startMs + stepMs * index) / 1000),
    value,
  }));

  const candles: MarketChartCandle[] = line.map((point, index) => {
    const previousClose = index === 0 ? point.value : line[index - 1].value;
    const high = Math.max(previousClose, point.value);
    const low = Math.min(previousClose, point.value);

    return {
      time: point.time,
      open: previousClose,
      high,
      low,
      close: point.value,
    };
  });

  return {
    source: 'sparkline',
    line,
    candles,
    volume: [],
    updatedAt: new Date().toISOString(),
  };
}

function aggregateMarketChartHistory(
  prices: number[][],
  totalVolumes: number[][],
  timeframe: OrbitChartTimeframe,
): MarketChartHistory {
  const bucketMinutes = CHART_TIMEFRAME_CONFIG[timeframe].bucketMinutes;
  const safePrices = sanitizeMarketChartRows(prices);
  const safeVolumes = sanitizeMarketChartRows(totalVolumes);
  const volumeMap = new Map<number, number>(safeVolumes);

  const buckets = new Map<
    number,
    {
      open: number;
      high: number;
      low: number;
      close: number;
      lastTimeMs: number;
      volume: number;
    }
  >();

  safePrices.forEach(([timestampMs, price], index) => {
    const bucketKey = bucketTimestamp(timestampMs, bucketMinutes);
    const existing = buckets.get(bucketKey);
    const volume =
      volumeMap.get(timestampMs) ??
      volumeMap.get(safeVolumes[Math.min(index, safeVolumes.length - 1)]?.[0] ?? timestampMs) ??
      0;

    if (!existing) {
      buckets.set(bucketKey, {
        open: price,
        high: price,
        low: price,
        close: price,
        lastTimeMs: timestampMs,
        volume,
      });
      return;
    }

    existing.high = Math.max(existing.high, price);
    existing.low = Math.min(existing.low, price);
    existing.close = price;
    existing.lastTimeMs = timestampMs;
    existing.volume = Math.max(existing.volume, volume);
  });

  const orderedBuckets = [...buckets.entries()].sort((a, b) => a[0] - b[0]);

  const candles: MarketChartCandle[] = orderedBuckets.map(([timeMs, bucket]) => ({
    time: Math.floor(timeMs / 1000),
    open: bucket.open,
    high: bucket.high,
    low: bucket.low,
    close: bucket.close,
  }));

  const line: MarketChartPoint[] = candles.map((candle) => ({
    time: candle.time,
    value: candle.close,
  }));

  const volume: MarketChartVolume[] = orderedBuckets.map(([timeMs, bucket]) => ({
    time: Math.floor(timeMs / 1000),
    value: bucket.volume,
  }));

  return {
    source: 'coingecko',
    line,
    candles,
    volume,
    updatedAt: new Date().toISOString(),
  };
}

export async function getMarketsList() {
  const rows = await fetchCoinMarkets(60);
  return rows.map(mapMarketRow).map(mapPair);
}

export async function getHomeMarketData() {
  const rows = await fetchCoinMarkets(20);
  return rows.slice(0, 8).map(mapMarketRow).map(mapPair);
}

export async function getTradePairData(pairId: string = appConfig.defaultPairId) {
  const baseSymbol = pairId.split('-')[0]?.trim().toLowerCase();
  const markets = await fetchCoinMarkets(80);
  const matched = markets.find((row) => row.symbol.toLowerCase() === baseSymbol);

  if (matched) {
    return mapPair(mapMarketRow(matched));
  }

  const fallbackId = appConfig.supportedPairs.includes(pairId as (typeof appConfig.supportedPairs)[number])
    ? pairId.split('-')[0]
    : 'bitcoin';
  const detail = await fetchCoinDetail(fallbackId);
  return mapDetailToPair(detail);
}

export async function getTradePairChartData(
  pair: Pick<
    MarketPair,
    'id' | 'baseId' | 'baseSymbol' | 'quoteSymbol' | 'sparkline' | 'contractAddress' | 'poolAddress' | 'networkKey' | 'dexNetwork' | 'geckoTerminalUrl'
  >,
  timeframe: OrbitChartTimeframe,
) {
  try {
    const provider = await resolveMarketProvider(pair);
    if (provider.kind === 'geckoterminal') {
      const history = await fetchGeckoTerminalHistory(provider.reference, timeframe);
      if (history.line.length >= 2) {
        return history;
      }
    }
  } catch {
    // Si la fuente on-chain no responde, seguimos con el fallback siguiente.
  }

  try {
    const config = CHART_TIMEFRAME_CONFIG[timeframe];
    const chart = await fetchCoinMarketChart(pair.baseId, {
      days: config.days,
      interval: config.interval,
    });

    const history = aggregateMarketChartHistory(
      chart.prices ?? [],
      chart.total_volumes ?? [],
      timeframe,
    );

    if (history.line.length >= 2) {
      return history;
    }
  } catch {
    // Fall back to the provider sparkline without fabricating synthetic prices.
  }

  return buildHistoryFromSparkline(pair.sparkline ?? [], timeframe);
}

export async function getPairSnapshots(pairIds: string[]) {
  const ids = pairIds.map((pairId) => pairId.split('-')[0]).join(',');
  const prices = await fetchSimplePrices(
    ids
      .split(',')
      .filter(Boolean)
      .map((symbol) => {
        if (symbol === 'btc') return 'bitcoin';
        if (symbol === 'eth') return 'ethereum';
        if (symbol === 'sol') return 'solana';
        if (symbol === 'bnb') return 'binancecoin';
        if (symbol === 'xrp') return 'ripple';
        return symbol;
      }),
  );

  return prices;
}
