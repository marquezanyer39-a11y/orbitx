export const appConfig = {
  refreshIntervals: {
    home: 45_000,
    markets: 30_000,
    trade: 15_000,
    wallet: 20_000,
    news: 60 * 60 * 1000,
  },
  defaultPairId: 'btc-usdt',
  defaultQuoteSymbol: 'USDT',
  defaultNetwork: 'base',
  supportedPairs: [
    'btc-usdt',
    'eth-usdt',
    'sol-usdt',
    'bnb-usdt',
    'xrp-usdt',
    'doge-usdt',
    'pepe-usdt',
    'wif-usdt',
    'bonk-usdt',
  ],
} as const;
