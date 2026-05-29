import { formatRiskAction, sanitizeRiskUiText } from '../ui/astraRiskUiFormatters';
import { mapRiskDisplayModeToUi } from '../relevance/astraRiskDisplayMapper';
import type { AstraRiskWeb3Event } from '../events/astraRiskEvents.types';
import type { AstraRiskRelevanceResult } from '../relevance/astraRiskRelevanceRules';
import type { AstraRiskInsightViewModel } from './astraRiskInsight.types';

function getTone(displayMode: AstraRiskInsightViewModel['displayMode']): AstraRiskInsightViewModel['tone'] {
  if (displayMode === 'critical') {
    return 'critical';
  }

  if (displayMode === 'banner') {
    return 'warning';
  }

  if (displayMode === 'card') {
    return 'warning';
  }

  return 'neutral';
}

export function mapRiskInsightToAstraUi(
  event: AstraRiskWeb3Event,
  relevance: AstraRiskRelevanceResult,
): AstraRiskInsightViewModel {
  const displayMode = mapRiskDisplayModeToUi(relevance.displayMode);
  const payload = event.payload;
  const reasons = payload.reasons.map(sanitizeRiskUiText).slice(0, 3);
  const warnings = payload.warnings.map(sanitizeRiskUiText).slice(0, 2);
  const reasonCopy = reasons.length > 0 ? reasons.join(', ') : 'sin señales activas';
  const warningCopy = warnings.length > 0 ? ` Warnings: ${warnings.join(', ')}.` : '';
  const actionCopy = formatRiskAction(payload.recommendedAction);

  return {
    displayMode,
    title:
      displayMode === 'critical'
        ? 'Riesgo critico Web3'
        : `Riesgo Web3 ${sanitizeRiskUiText(payload.riskLevel)}`,
    body: `Token ${sanitizeRiskUiText(payload.tokenPreview)} en chain ${payload.chainId}. Score ${payload.riskScore}/100. Senales: ${reasonCopy}.${warningCopy} Accion sugerida: ${actionCopy}.`,
    tone: getTone(displayMode),
    actionLabel: displayMode === 'none' ? undefined : 'Revisar riesgo',
    metadata: {
      chainId: payload.chainId,
      tokenPreview: sanitizeRiskUiText(payload.tokenPreview),
      riskLevel: sanitizeRiskUiText(payload.riskLevel),
      riskScore: String(payload.riskScore),
      recommendedAction: actionCopy,
    },
    dedupKey: event.dedupKey,
  };
}
