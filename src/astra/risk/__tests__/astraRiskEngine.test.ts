import { describe, expect, it } from 'vitest';

import type { AstraFeatureFlags } from '../../config/astraFlags';
import { astraFlagsDefaults } from '../../config/astraFlags.defaults';
import { createAstraRiskAuditRecord } from '../astraRiskAudit';
import { scanApprovalRisk, scanTokenRisk } from '../astraRiskEngine';

const TOKEN_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

function riskEnabledFlags(overrides: Partial<AstraFeatureFlags> = {}): Partial<AstraFeatureFlags> {
  return {
    ...astraFlagsDefaults,
    ASTRA_ENABLED: true,
    ASTRA_RISK_ENGINE_ENABLED: true,
    ASTRA_RISK_READ_ONLY_ENABLED: true,
    ASTRA_RISK_TOKEN_SCAN_ENABLED: true,
    ASTRA_RISK_APPROVAL_SCAN_ENABLED: true,
    ASTRA_RISK_EXTERNAL_ADAPTERS_ENABLED: false,
    ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
    ...overrides,
  };
}

describe('astraRiskEngine', () => {
  it('token seguro devuelve low risk', async () => {
    const result = await scanTokenRisk(
      {
        chainId: 1,
        tokenAddress: TOKEN_ADDRESS,
        scenario: 'safe',
      },
      {
        flags: riskEnabledFlags(),
        now: () => '2026-01-01T00:00:00.000Z',
      },
    );

    expect(result.riskLevel).toBe('low');
    expect(result.riskScore).toBe(0);
    expect(result.tokenPreview).toBe('0x1234...5678');
  });

  it('token sospechoso devuelve high o critical', async () => {
    const result = await scanTokenRisk(
      {
        chainId: 56,
        tokenAddress: TOKEN_ADDRESS,
        scenario: 'suspicious',
      },
      {
        flags: riskEnabledFlags(),
      },
    );

    expect(['high', 'critical']).toContain(result.riskLevel);
    expect(result.reasons.some((reason) => reason.code === 'ownership_not_renounced')).toBe(true);
  });

  it('token crítico devuelve critical y recomienda no firmar o desconectar', async () => {
    const result = await scanTokenRisk(
      {
        chainId: 137,
        tokenAddress: TOKEN_ADDRESS,
        scenario: 'critical',
      },
      {
        flags: riskEnabledFlags(),
      },
    );

    expect(result.riskLevel).toBe('critical');
    expect(['do_not_sign', 'disconnect_from_site']).toContain(result.recommendedAction);
  });

  it('approvals infinitos generan warning', async () => {
    const result = await scanApprovalRisk(
      {
        chainId: 1,
        tokenAddress: TOKEN_ADDRESS,
        spenderAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        scenario: 'infinite_approval',
      },
      {
        flags: riskEnabledFlags(),
      },
    );

    expect(result.warnings).toContain('Approval infinito o muy alto');
    expect(result.recommendedAction).toBe('review_approval');
  });

  it('adapter caído no rompe y devuelve fallback seguro', async () => {
    const result = await scanTokenRisk(
      {
        chainId: 1,
        tokenAddress: TOKEN_ADDRESS,
        scenario: 'adapter_failure',
      },
      {
        flags: riskEnabledFlags(),
      },
    );

    expect(result.riskLevel).toBe('medium');
    expect(result.reasons[0]?.code).toBe('adapter_unavailable');
  });

  it('flags apagadas bloquean análisis', async () => {
    const result = await scanTokenRisk(
      {
        chainId: 1,
        tokenAddress: TOKEN_ADDRESS,
        scenario: 'safe',
      },
      {
        flags: riskEnabledFlags({
          ASTRA_RISK_ENGINE_ENABLED: false,
        }),
      },
    );

    expect(result.blocked).toBe(true);
    expect(result.reasons[0]?.code).toBe('read_only_disabled');
  });

  it('auditoría no guarda direcciones completas ni payload crudo', async () => {
    const result = await scanTokenRisk(
      {
        chainId: 1,
        tokenAddress: TOKEN_ADDRESS,
        scenario: 'critical',
      },
      {
        flags: riskEnabledFlags(),
      },
    );
    const audit = createAstraRiskAuditRecord(result, { toolId: 'web3.scan_token_risk_readonly' });
    const rendered = JSON.stringify(audit);

    expect(rendered).not.toContain(TOKEN_ADDRESS);
    expect(rendered).not.toContain('rawTransaction');
    expect(audit.paramsHash).toBe('mock_hash');
  });

  it('expone solo funciones read-only sin helpers de ejecución', () => {
    const riskEngineExports = {
      scanTokenRisk,
      scanApprovalRisk,
    };

    expect(riskEngineExports.scanTokenRisk).toBeDefined();
    expect(riskEngineExports.scanApprovalRisk).toBeDefined();
    expect('signTransaction' in riskEngineExports).toBe(false);
    expect('sendTransaction' in riskEngineExports).toBe(false);
    expect('revokeApproval' in riskEngineExports).toBe(false);
  });
});
