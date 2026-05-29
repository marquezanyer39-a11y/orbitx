import { describe, expect, it } from 'vitest';

import { mockRiskAdapter } from '../adapters/mockRiskAdapter';

describe('mockRiskAdapter', () => {
  it('devuelve fixture safe deterministic', async () => {
    const first = await mockRiskAdapter.scanToken({
      chainId: 1,
      tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
      scenario: 'safe',
    });
    const second = await mockRiskAdapter.scanToken({
      chainId: 1,
      tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
      scenario: 'safe',
    });

    expect(first).toEqual(second);
    expect(first.source).toBe('mock');
  });

  it('devuelve señales para infinite approval', async () => {
    const result = await mockRiskAdapter.scanApproval({
      chainId: 1,
      tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
      scenario: 'infinite_approval',
    });

    expect(result.signals.some((signal) => signal.code === 'infinite_approval' && signal.active)).toBe(true);
  });

  it('simula falla de adapter', async () => {
    await expect(
      mockRiskAdapter.scanToken({
        chainId: 1,
        tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
        scenario: 'adapter_failure',
      }),
    ).rejects.toThrow('MOCK_RISK_ADAPTER_FAILURE');
  });
});
