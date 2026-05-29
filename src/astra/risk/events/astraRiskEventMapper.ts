import type { AstraRiskEngineResult } from '../astraRisk.types';
import { sanitizeRiskUiText } from '../ui/astraRiskUiFormatters';
import type {
  AstraRiskEventPayload,
  AstraRiskEventSource,
  AstraRiskEventSurface,
  AstraRiskEventType,
  AstraRiskWeb3Event,
} from './astraRiskEvents.types';

function resolveRiskEventType(result: AstraRiskEngineResult): AstraRiskEventType {
  if (result.reasons.some((reason) => reason.code === 'adapter_unavailable')) {
    return 'adapter_unavailable';
  }

  if (result.riskLevel === 'critical') {
    return 'critical_risk_detected';
  }

  if (result.reasons.some((reason) => reason.code === 'infinite_approval' || reason.code === 'suspicious_spender')) {
    return 'approval_scanned';
  }

  if (result.riskLevel === 'high') {
    return 'high_risk_detected';
  }

  return 'token_scanned';
}

function resolveSeverity(result: AstraRiskEngineResult): AstraRiskWeb3Event['severity'] {
  if (result.riskLevel === 'critical') {
    return 'critical';
  }

  if (result.riskLevel === 'high' || result.riskLevel === 'medium') {
    return 'warning';
  }

  return 'info';
}

export function createRiskDedupKey(result: AstraRiskEngineResult): string {
  return `risk:${result.chainId}:${result.tokenPreview}:${result.riskLevel}:${result.recommendedAction}`;
}

export function mapRiskResultToEventPayload(result: AstraRiskEngineResult): AstraRiskEventPayload {
  return {
    riskEventType: resolveRiskEventType(result),
    chainId: result.chainId,
    tokenPreview: sanitizeRiskUiText(result.tokenPreview),
    riskScore: result.riskScore,
    riskLevel: result.riskLevel,
    reasons: result.reasons.map((reason) => sanitizeRiskUiText(reason.code)),
    warnings: result.warnings.map(sanitizeRiskUiText),
    recommendedAction: result.recommendedAction,
    confidence: result.confidence,
    source: result.source,
    scannedAt: result.scannedAt,
  };
}

export function mapRiskResultToAstraEvent(
  result: AstraRiskEngineResult,
  options: {
    surface: AstraRiskEventSurface;
    eventSource: AstraRiskEventSource;
  },
): AstraRiskWeb3Event {
  const payload = mapRiskResultToEventPayload(result);

  return {
    id: `risk-${payload.riskEventType}-${result.chainId}-${result.tokenPreview}-${result.scannedAt}`,
    type: 'web3',
    severity: resolveSeverity(result),
    title: 'ASTRA Web3 Risk',
    message: `Risk ${payload.riskLevel} (${payload.riskScore}/100) for ${payload.tokenPreview}`,
    timestamp: result.scannedAt,
    source: options.eventSource,
    dedupKey: createRiskDedupKey(result),
    throttleMs: payload.riskEventType === 'adapter_unavailable' ? 15 * 60 * 1000 : 5 * 60 * 1000,
    targetScreen: options.surface,
    payload,
  };
}
