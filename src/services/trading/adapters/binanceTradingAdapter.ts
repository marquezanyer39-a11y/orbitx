import { NotConfiguredTradingAdapter } from './notConfiguredAdapter';

// FUTURE PROVIDER - no productivo en esta fase.
export class BinanceTradingAdapter extends NotConfiguredTradingAdapter {
  constructor() {
    super('binance', 'not_configured');
  }
}

export const binanceTradingAdapter = new BinanceTradingAdapter();
