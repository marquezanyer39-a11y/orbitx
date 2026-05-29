import { describe, expect, it } from 'vitest';

import { buildRiskScanResult, calculateRiskScore, getRiskLevelFromScore } from '../astraRiskScoring';
import { createRiskSignal } from '../astraRiskRules';

describe('astraRiskScoring', () => {
  it('calcula score y nivel low para señales inactivas', () => {
    const signals = [
      createRiskSignal('contract_unverified', false, 18, 'medium'),
      createRiskSignal('low_liquidity', false, 12, 'medium'),
    ];

    expect(calculateRiskScore(signals)).toBe(0);
    expect(getRiskLevelFromScore(0)).toBe('low');
  });

  it('normaliza resultados high/critical con acciones recomendadas', () => {
    const result = buildRiskScanResult(
      [
        createRiskSignal('infinite_approval', true, 38, 'high'),
        createRiskSignal('suspicious_spender', true, 28, 'high'),
      ],
      'mock',
      0.8,
      '2026-01-01T00:00:00.000Z',
    );

    expect(result.riskScore).toBe(66);
    expect(result.riskLevel).toBe('high');
    expect(result.recommendedAction).toBe('review_approval');
    expect(result.warnings).toContain('Approval infinito o muy alto');
  });
});
