export interface MarketCoin {
  id: string;
  coingeckoId: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChange24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  sparkline: number[];
  lastUpdated: string;
}

export interface MarketPair {
  id: string;
  baseId: string;
  quoteId: string;
  symbol: string;
  baseSymbol: string;
  quoteSymbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  image: string;
  sparkline: number[];
  coin: MarketCoin;
  marketSource?: 'binance' | 'coingecko' | 'geckoterminal' | 'legacy';
  networkKey?: string | null;
  contractAddress?: string | null;
  poolAddress?: string | null;
  dexNetwork?: string | null;
  geckoTerminalUrl?: string | null;
}

export interface PriceSnapshot {
  id: string;
  price: number;
  change24h: number;
  updatedAt: string;
}

export interface MarketChartPoint {
  time: number;
  value: number;
}

export interface MarketChartCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MarketChartVolume {
  time: number;
  value: number;
}

export interface MarketChartHistory {
  source: 'binance' | 'coingecko' | 'geckoterminal' | 'sparkline';
  line: MarketChartPoint[];
  candles: MarketChartCandle[];
  volume: MarketChartVolume[];
  updatedAt: string;
}

export type MarketRealtimeStatus =
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'fallback'
  | 'unsupported'
  | 'error';

export interface MarketRealtimeTicker {
  source: 'binance' | 'coingecko' | 'geckoterminal' | 'pair';
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  updatedAt: string;
}
