import { describe, expect, it } from 'vitest';

import { createAstraRiskAuditRecord } from '../../astraRiskAudit';
import { scanApprovalRisk, scanTokenRisk } from '../../astraRiskEngine';
import {
  formatRiskAction,
  formatRiskConfidence,
  formatRiskScore,
  getRiskLevelAccent,
  sanitizeRiskAuditForUi,
  sanitizeRiskUiText,
  truncateRiskUiAddress,
} from '../astraRiskUiFormatters';
import {
  adapterFailureFixture,
  createAstraRiskSandboxFlags,
  criticalTokenFixture,
  infiniteApprovalFixture,
  safeTokenFixture,
  suspiciousTokenFixture,
} from '../astraRiskSandboxFixtures';

describe('astraRiskUiFormatters', () => {
  it('render/format de low, high y critical', async () => {
    const low = await scanTokenRisk(safeTokenFixture.tokenInput!, {
      flags: createAstraRiskSandboxFlags(),
    });
    const high = await scanTokenRisk(suspiciousTokenFixture.tokenInput!, {
      flags: createAstraRiskSandboxFlags(),
    });
    const critical = await scanTokenRisk(criticalTokenFixture.tokenInput!, {
      flags: createAstraRiskSandboxFlags(),
    });

    expect(low.riskLevel).toBe('low');
    expect(['high', 'critical']).toContain(high.riskLevel);
    expect(critical.riskLevel).toBe('critical');
    expect(getRiskLevelAccent(low.riskLevel)).toBe('success');
    expect(getRiskLevelAccent(critical.riskLevel)).toBe('danger');
  });

  it('recommendedAction se traduce a texto seguro', () => {
    expect(formatRiskAction('monitor_only')).toBe('Monitorear solamente');
    expect(formatRiskAction('review_approval')).toBe('Revisar approval');
    expect(formatRiskAction('do_not_sign')).toBe('No firmar');
    expect(formatRiskScore(101)).toBe('100/100');
    expect(formatRiskConfidence(0.823)).toBe('82%');
  });

  it('infinite approval muestra warning y review_approval', async () => {
    const result = await scanApprovalRisk(infiniteApprovalFixture.approvalInput!, {
      flags: createAstraRiskSandboxFlags(),
    });

    expect(result.warnings).toContain('Approval infinito o muy alto');
    expect(result.recommendedAction).toBe('review_approval');
  });

  it('adapter failure muestra fallback seguro', async () => {
    const result = await scanTokenRisk(adapterFailureFixture.tokenInput!, {
      flags: createAstraRiskSandboxFlags(),
    });

    expect(result.reasons[0]?.code).toBe('adapter_unavailable');
    expect(result.source).toBe('mock');
  });

  it('AuditPreview no muestra direcciones completas', async () => {
    const result = await scanTokenRisk(criticalTokenFixture.tokenInput!, {
      flags: createAstraRiskSandboxFlags(),
    });
    const audit = sanitizeRiskAuditForUi(
      createAstraRiskAuditRecord(result, {
        toolId: 'web3.scan_token_risk_readonly',
      }),
    );
    const rendered = JSON.stringify(audit);

    expect(rendered).not.toContain(criticalTokenFixture.tokenInput!.tokenAddress);
    expect(audit.tokenPreview).toBe('0x1234...5678');
  });

  it('Formatters truncan full addresses y ocultan balances exactos', () => {
    const fullAddress = '0x1234567890abcdef1234567890abcdef12345678';
    expect(truncateRiskUiAddress(fullAddress)).toBe('0x1234...5678');
    expect(sanitizeRiskUiText(`balance 123.456 en ${fullAddress}`)).not.toContain(fullAddress);
    expect(sanitizeRiskUiText('balance 123.456')).toContain('balance [redacted]');
  });

  it('Flags apagadas muestran estado bloqueado', async () => {
    const result = await scanTokenRisk(safeTokenFixture.tokenInput!, {
      flags: createAstraRiskSandboxFlags(true),
    });

    expect(result.blocked).toBe(true);
    expect(result.reasons[0]?.code).toBe('read_only_disabled');
  });
});
