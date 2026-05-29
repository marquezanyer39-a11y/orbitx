import type {
  AstraRiskLevel,
  AstraRiskReason,
  AstraRiskRecommendedAction,
  AstraRiskScanResult,
  AstraRiskSignal,
  AstraRiskSource,
} from './astraRisk.types';
import { normalizeRiskReasons } from './astraRiskRules';

export function getRiskLevelFromScore(score: number): AstraRiskLevel {
  if (score >= 85) {
    return 'critical';
  }

  if (score >= 65) {
    return 'high';
  }

  if (score >= 35) {
    return 'medium';
  }

  return 'low';
}

export function getRecommendedAction(
  riskLevel: AstraRiskLevel,
  reasons: AstraRiskReason[],
): AstraRiskRecommendedAction {
  if (riskLevel === 'critical') {
    if (reasons.some((reason) => reason.code === 'phishing_or_scam_signals')) {
      return 'disconnect_from_site';
    }

    return 'do_not_sign';
  }

  if (riskLevel === 'high') {
    if (reasons.some((reason) => reason.code === 'infinite_approval')) {
      return 'review_approval';
    }

    return 'avoid_interaction';
  }

  if (riskLevel === 'medium') {
    return 'review_contract';
  }

  return 'monitor_only';
}

export function calculateRiskScore(signals: AstraRiskSignal[]): number {
  const activeSignals = signals.filter((signal) => signal.active);
  const score = activeSignals.reduce((total, signal) => total + signal.weight, 0);
  return Math.max(0, Math.min(100, score));
}

export function buildRiskScanResult(
  signals: AstraRiskSignal[],
  source: AstraRiskSource,
  confidence: number,
  scannedAt: string = new Date().toISOString(),
): AstraRiskScanResult {
  const riskScore = calculateRiskScore(signals);
  const riskLevel = getRiskLevelFromScore(riskScore);
  const reasons = normalizeRiskReasons(signals);

  return {
    riskScore,
    riskLevel,
    reasons,
    warnings: reasons.map((reason) => reason.label),
    recommendedAction: getRecommendedAction(riskLevel, reasons),
    source,
    confidence: Math.max(0, Math.min(1, confidence)),
    scannedAt,
  };
}
