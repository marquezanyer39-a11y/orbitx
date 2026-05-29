import type { AstraApprovalRiskInput, AstraTokenRiskInput } from '../astraRisk.types';
import { createRiskSignal } from '../astraRiskRules';
import type { AstraRiskAdapter, AstraRiskAdapterResult } from './astraRiskAdapter.types';

export function createMockRiskAdapterFailure(): AstraRiskAdapterResult {
  return {
    source: 'mock',
    confidence: 0.2,
    signals: [
      createRiskSignal('adapter_unavailable', true, 35, 'medium', 'Adapter mock no disponible'),
    ],
  };
}

export const mockRiskAdapter: AstraRiskAdapter = {
  async scanToken(input: AstraTokenRiskInput): Promise<AstraRiskAdapterResult> {
    if (input.scenario === 'adapter_failure') {
      throw new Error('MOCK_RISK_ADAPTER_FAILURE');
    }

    if (input.scenario === 'critical') {
      return {
        source: 'mock',
        confidence: 0.92,
        signals: [
          createRiskSignal('possible_honeypot', true, 30, 'critical'),
          createRiskSignal('blacklist_whitelist_controls', true, 18, 'high'),
          createRiskSignal('dangerous_permissions', true, 18, 'high'),
          createRiskSignal('phishing_or_scam_signals', true, 28, 'critical'),
          createRiskSignal('low_liquidity', true, 12, 'medium'),
        ],
      };
    }

    if (input.scenario === 'suspicious') {
      return {
        source: 'mock',
        confidence: 0.84,
        signals: [
          createRiskSignal('contract_unverified', true, 18, 'medium'),
          createRiskSignal('ownership_not_renounced', true, 18, 'high'),
          createRiskSignal('holder_concentration', true, 16, 'high'),
          createRiskSignal('high_buy_sell_tax', true, 16, 'high'),
        ],
      };
    }

    return {
      source: 'mock',
      confidence: 0.78,
      signals: [
        createRiskSignal('contract_unverified', false, 18, 'medium'),
        createRiskSignal('low_liquidity', false, 12, 'medium'),
        createRiskSignal('dangerous_permissions', false, 18, 'high'),
      ],
    };
  },

  async scanApproval(input: AstraApprovalRiskInput): Promise<AstraRiskAdapterResult> {
    if (input.scenario === 'adapter_failure') {
      throw new Error('MOCK_RISK_ADAPTER_FAILURE');
    }

    if (input.scenario === 'infinite_approval') {
      return {
        source: 'mock',
        confidence: 0.88,
        signals: [
          createRiskSignal('infinite_approval', true, 38, 'high'),
          createRiskSignal('suspicious_spender', true, 28, 'high'),
          createRiskSignal('proxy_contract', true, 12, 'medium'),
        ],
      };
    }

    return {
      source: 'mock',
      confidence: 0.72,
      signals: [
        createRiskSignal('infinite_approval', false, 38, 'high'),
        createRiskSignal('suspicious_spender', false, 28, 'high'),
      ],
    };
  },
};
