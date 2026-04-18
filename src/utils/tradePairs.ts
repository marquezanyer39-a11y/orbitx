import type { MarketToken } from '../../types';
import type { MarketPair } from '../types';

function safePositive(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function buildLegacyTokenPairId(token: Pick<MarketToken, 'symbol'> | string) {
  const symbol = typeof token === 'string' ? token : token.symbol;
  return `${symbol.trim().toLowerCase()}-usdt`;
}

export function mapLegacyTokenToMarketPair(token: MarketToken): MarketPair {
  const price = safePositive(token.price);
  const move = token.change24h / 100;
  const derivedHigh = price > 0 ? price * (1 + Math.max(move, 0) * 0.35) : 0;
  const derivedLow = price > 0 ? price * (1 - Math.abs(Math.min(move, 0)) * 0.35) : 0;
  const image = token.logo ?? '';
  const updatedAt = token.updatedAt ?? token.createdAt ?? new Date().toISOString();

  return {
    id: buildLegacyTokenPairId(token),
    baseId: token.coingeckoId || token.id,
    quoteId: 'tether',
    symbol: `${token.symbol}/USDT`,
    baseSymbol: token.symbol,
    quoteSymbol: 'USDT',
    price,
    change24h: token.change24h,
    high24h: safePositive(token.price) || derivedHigh || price,
    low24h: safePositive(token.price) || derivedLow || price,
    volume24h: safePositive(token.volume24h),
    image,
    sparkline: Array.isArray(token.sparkline) ? token.sparkline : [],
    marketSource: token.poolAddress || token.contractAddress ? 'geckoterminal' : 'legacy',
    networkKey: token.networkKey ?? token.chain ?? null,
    contractAddress: token.contractAddress ?? null,
    poolAddress: token.poolAddress ?? null,
    dexNetwork: token.dexNetwork ?? null,
    coin: {
      id: buildLegacyTokenPairId(token),
      coingeckoId: token.coingeckoId || token.id,
      symbol: token.symbol,
      name: token.name,
      image,
      currentPrice: price,
      priceChange24h: token.change24h,
      high24h: safePositive(token.price) || derivedHigh || price,
      low24h: safePositive(token.price) || derivedLow || price,
      volume24h: safePositive(token.volume24h),
      marketCap: safePositive(token.marketCap),
      sparkline: Array.isArray(token.sparkline) ? token.sparkline : [],
      lastUpdated: updatedAt,
    },
  };
}

export function findLegacyTokenForTradeId(tokens: MarketToken[], tradeId: string) {
  const normalized = tradeId.trim().toLowerCase();

  return (
    tokens.find((token) => token.id.toLowerCase() === normalized) ??
    tokens.find((token) => buildLegacyTokenPairId(token) === normalized) ??
    null
  );
}
