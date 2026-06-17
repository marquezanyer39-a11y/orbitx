import { NotConfiguredTradingAdapter } from './notConfiguredAdapter';

// FUTURE PROVIDER - no productivo en esta fase.
export class BybitTradingAdapter extends NotConfiguredTradingAdapter {
  constructor() {
    super('bybit', 'not_configured');
  }
}

export const bybitTradingAdapter = new BybitTradingAdapter();
