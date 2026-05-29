import type {
  AstraRiskAuditRecord,
  AstraRiskLevel,
  AstraRiskRecommendedAction,
} from '../astraRisk.types';

const FULL_ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/g;
const BALANCE_PATTERN = /\b(balance|saldo|amount|allowance|value)\b[^a-zA-Z]{0,8}[0-9]+(?:[.,][0-9]+)?/gi;

export const ASTRA_RISK_ACTION_LABELS: Record<AstraRiskRecommendedAction, string> = {
  monitor_only: 'Monitorear solamente',
  avoid_interaction: 'Evitar interacción',
  review_contract: 'Revisar contrato',
  review_approval: 'Revisar approval',
  do_not_sign: 'No firmar',
  disconnect_from_site: 'Desconectar del sitio',
  manual_review_required: 'Revisión manual requerida',
};

export const ASTRA_RISK_LEVEL_LABELS: Record<AstraRiskLevel, string> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
};

export function formatRiskAction(action: AstraRiskRecommendedAction): string {
  return ASTRA_RISK_ACTION_LABELS[action];
}

export function formatRiskScore(score: number): string {
  return `${Math.max(0, Math.min(100, Math.round(score)))}/100`;
}

export function formatRiskConfidence(confidence: number): string {
  return `${Math.round(Math.max(0, Math.min(1, confidence)) * 100)}%`;
}

export function truncateRiskUiAddress(value: string): string {
  return value.replace(FULL_ADDRESS_PATTERN, (address) => `${address.slice(0, 6)}...${address.slice(-4)}`);
}

export function sanitizeRiskUiText(value: string): string {
  return truncateRiskUiAddress(value).replace(BALANCE_PATTERN, '$1 [redacted]').slice(0, 160);
}

export function sanitizeRiskAuditForUi(audit: AstraRiskAuditRecord): AstraRiskAuditRecord {
  return {
    ...audit,
    tokenPreview: sanitizeRiskUiText(audit.tokenPreview),
    reasons: audit.reasons.map(sanitizeRiskUiText),
    paramsHash: 'mock_hash',
  };
}

export function getRiskLevelAccent(riskLevel: AstraRiskLevel): 'success' | 'warning' | 'danger' {
  if (riskLevel === 'low') {
    return 'success';
  }

  if (riskLevel === 'medium') {
    return 'warning';
  }

  return 'danger';
}
