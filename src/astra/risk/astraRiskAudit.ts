import type { AstraRiskAuditRecord, AstraRiskEngineResult } from './astraRisk.types';

export function createAstraRiskAuditRecord(
  result: AstraRiskEngineResult,
  ids: { toolId?: string; eventId?: string } = {},
): AstraRiskAuditRecord {
  return {
    ...ids,
    timestamp: new Date().toISOString(),
    chainId: result.chainId,
    tokenPreview: result.tokenPreview,
    riskLevel: result.riskLevel,
    riskScore: result.riskScore,
    reasons: result.reasons.map((reason) => reason.code),
    paramsHash: 'mock_hash',
  };
}
