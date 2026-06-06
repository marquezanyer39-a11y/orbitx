import { describe, expect, it } from 'vitest';

import { getPortfolioDistribution, getTotalPortfolioBalanceUsd } from './portfolioTotals';

describe('portfolioTotals', () => {
  it('excludes demo Spot and Cuenta Local when callers pass them as zero', () => {
    const total = getTotalPortfolioBalanceUsd({
      spotBalanceUsd: 0,
      localAccountBalanceUsd: 0,
      web3BalanceUsd: 125.5,
    });

    expect(total).toBe(125.5);
  });

  it('adds local and external Web3 totals once they are consolidated by the caller', () => {
    const localWeb3 = 20;
    const externalWeb3 = 30;

    expect(
      getTotalPortfolioBalanceUsd({
        spotBalanceUsd: 0,
        localAccountBalanceUsd: 0,
        web3BalanceUsd: localWeb3 + externalWeb3,
      }),
    ).toBe(50);
  });

  it('never returns NaN for invalid, null or negative inputs', () => {
    const total = getTotalPortfolioBalanceUsd({
      spotBalanceUsd: Number.NaN,
      localAccountBalanceUsd: undefined,
      web3BalanceUsd: -10,
    });

    expect(Number.isNaN(total)).toBe(false);
    expect(total).toBe(0);
  });

  it('returns zero distribution when total is zero', () => {
    expect(getPortfolioDistribution({})).toEqual({
      spotPercent: 0,
      localPercent: 0,
      web3Percent: 0,
    });
  });
});
