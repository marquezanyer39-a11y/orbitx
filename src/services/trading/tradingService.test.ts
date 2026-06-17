import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        orbitxBackendUrl: '',
      },
    },
  },
}));

import { FEATURE_STATUS } from '../../constants/featureStatus';
import {
  getCurrentTradingProvider,
  placeOrder,
  setTradingProvider,
} from './tradingService';

describe('tradingService demo safety', () => {
  it('uses mock provider by default', () => {
    expect(FEATURE_STATUS.trade.provider).toBe('mock');
    expect(getCurrentTradingProvider()).toBe('mock');
  });

  it('returns simulated execution while real trading is disabled', async () => {
    setTradingProvider('okx');

    const result = await placeOrder({
      symbol: 'BTC-USDT',
      side: 'buy',
      type: 'market',
      quantity: 0.01,
    });

    expect(result.status).toBe('simulated');
    expect(result.isSimulated).toBe(true);
    expect(result.orderId).toMatch(/^mock_/);
    expect(result.warningMessage).toContain('orden simulada');

    setTradingProvider('mock');
  });
});
