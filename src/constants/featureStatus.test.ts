import { describe, expect, it } from 'vitest';

import { FEATURE_STATUS } from './featureStatus';

describe('FEATURE_STATUS.trade', () => {
  it('keeps real trading disabled by default', () => {
    expect(FEATURE_STATUS.trade.mode).toBe('demo');
    expect(FEATURE_STATUS.trade.provider).toBe('mock');
    expect(FEATURE_STATUS.trade.isRealTradingEnabled).toBe(false);
    expect(FEATURE_STATUS.trade.allowOrderPlacement).toBe(false);
  });

  it('keeps demo labels enabled for mock provider', () => {
    expect(FEATURE_STATUS.trade.showDemoLabels).toBe(true);
    expect(FEATURE_STATUS.trade.isDemoMode).toBe(true);
  });
});
