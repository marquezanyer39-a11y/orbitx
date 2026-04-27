import { useMemo } from 'react';

import { useMarketData } from './useMarketData';
import type { MarketPair } from '../types';

const FALLBACK_MARKETS: MarketPair[] = [
  {
    id: 'btc-usdt-fallback',
    baseId: 'bitcoin',
    quoteId: 'tether',
    symbol: 'BTC/USDT',
    baseSymbol: 'BTC',
    quoteSymbol: 'USDT',
    price: 76822.69,
    change24h: 1.57,
    high24h: 77210,
    low24h: 75680,
    volume24h: 0,
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    sparkline: [75210, 75420, 75540, 75780, 75960, 76240, 76480, 76820],
    coin: {
      id: 'btc-home-fallback',
      coingeckoId: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      currentPrice: 76822.69,
      priceChange24h: 1.57,
      high24h: 77210,
      low24h: 75680,
      volume24h: 0,
      marketCap: 0,
      sparkline: [75210, 75420, 75540, 75780, 75960, 76240, 76480, 76820],
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    id: 'eth-usdt-fallback',
    baseId: 'ethereum',
    quoteId: 'tether',
    symbol: 'ETH/USDT',
    baseSymbol: 'ETH',
    quoteSymbol: 'USDT',
    price: 2275.93,
    change24h: -2.99,
    high24h: 2358,
    low24h: 2248,
    volume24h: 0,
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    sparkline: [2368, 2352, 2338, 2328, 2314, 2306, 2292, 2275],
    coin: {
      id: 'eth-home-fallback',
      coingeckoId: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      currentPrice: 2275.93,
      priceChange24h: -2.99,
      high24h: 2358,
      low24h: 2248,
      volume24h: 0,
      marketCap: 0,
      sparkline: [2368, 2352, 2338, 2328, 2314, 2306, 2292, 2275],
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    id: 'sol-usdt-fallback',
    baseId: 'solana',
    quoteId: 'tether',
    symbol: 'SOL/USDT',
    baseSymbol: 'SOL',
    quoteSymbol: 'USDT',
    price: 84.22,
    change24h: -2.69,
    high24h: 87.11,
    low24h: 83.94,
    volume24h: 0,
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    sparkline: [86.9, 86.4, 86.1, 85.6, 85.1, 84.8, 84.6, 84.22],
    coin: {
      id: 'sol-home-fallback',
      coingeckoId: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      currentPrice: 84.22,
      priceChange24h: -2.69,
      high24h: 87.11,
      low24h: 83.94,
      volume24h: 0,
      marketCap: 0,
      sparkline: [86.9, 86.4, 86.1, 85.6, 85.1, 84.8, 84.6, 84.22],
      lastUpdated: new Date().toISOString(),
    },
  },
  {
    id: 'xrp-usdt-fallback',
    baseId: 'ripple',
    quoteId: 'tether',
    symbol: 'XRP/USDT',
    baseSymbol: 'XRP',
    quoteSymbol: 'USDT',
    price: 1.3868,
    change24h: -2.9,
    high24h: 1.42,
    low24h: 1.36,
    volume24h: 0,
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    sparkline: [1.43, 1.42, 1.41, 1.4, 1.398, 1.394, 1.39, 1.3868],
    coin: {
      id: 'xrp-home-fallback',
      coingeckoId: 'ripple',
      symbol: 'XRP',
      name: 'XRP',
      image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
      currentPrice: 1.3868,
      priceChange24h: -2.9,
      high24h: 1.42,
      low24h: 1.36,
      volume24h: 0,
      marketCap: 0,
      sparkline: [1.43, 1.42, 1.41, 1.4, 1.398, 1.394, 1.39, 1.3868],
      lastUpdated: new Date().toISOString(),
    },
  },
];

export function useLiveMarkets() {
  const { homeMarkets, loading, error, loadHomeMarkets } = useMarketData('home');

  const items = useMemo(() => {
    if (homeMarkets.length >= 4) {
      return homeMarkets.slice(0, 4);
    }

    if (homeMarkets.length > 0) {
      const fallbackRemainder = FALLBACK_MARKETS.filter(
        (fallback) =>
          !homeMarkets.some(
            (market) => market.baseSymbol.toUpperCase() === fallback.baseSymbol.toUpperCase(),
          ),
      );
      return [...homeMarkets, ...fallbackRemainder].slice(0, 4);
    }

    return FALLBACK_MARKETS;
  }, [homeMarkets]);

  return {
    items,
    loading,
    error,
    usingFallback: !homeMarkets.length,
    refresh: () => void loadHomeMarkets(),
  };
}
