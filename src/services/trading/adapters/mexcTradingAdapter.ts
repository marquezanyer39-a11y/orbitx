import { NotConfiguredTradingAdapter } from './notConfiguredAdapter';

// FUTURE PROVIDER - no productivo en esta fase.
export class MexcTradingAdapter extends NotConfiguredTradingAdapter {
  constructor() {
    super('mexc', 'not_configured');
  }
}

export const mexcTradingAdapter = new MexcTradingAdapter();
