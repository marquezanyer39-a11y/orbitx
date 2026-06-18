import type { RiskLevel, SimulationResult } from '../types/simulation.types';
import type { CoreSimulationMetrics } from './learning.types';

const RISK_LEVEL_SCORE: Record<RiskLevel, number> = {
  low: 20,
  medium: 48,
  high: 72,
  critical: 88,
};

export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Fuente unica de las metricas nucleo de una simulacion. Todas las metricas son
 * derivadas del resultado del motor (no hardcodeadas) y van de 0 a 100.
 */
export function deriveCoreMetrics(result: SimulationResult): CoreSimulationMetrics {
  const scenarios = Object.values(result.scenarios);
  const agents = result.agents;

  const averageConfidence = agents.length
    ? agents.reduce((sum, agent) => sum + agent.output.confidence, 0) / agents.length
    : 0.5;

  const risk = result.risks.length
    ? Math.max(...result.risks.map((item) => RISK_LEVEL_SCORE[item.level]))
    : 40;

  const volatility = clampPercent(
    Math.max(...scenarios.map((scenario) => Math.abs(scenario.priceChange))) * 2.4,
  );

  const confidence = clampPercent(averageConfidence * 100);

  const liquidity = clampPercent(
    100 -
      Math.max(20, Math.abs(result.scenarios.stress.priceChange) * 1.5) +
      result.scenarios.base.probability * 18,
  );

  // Sentimiento: pulso combinado de presion alcista vs bajista entre agentes.
  const bullish = agents.filter((agent) => agent.output.pressureLabel === 'bullish_pressure').length;
  const bearish = agents.filter((agent) => agent.output.pressureLabel === 'bearish_pressure').length;
  const sentimentRaw = 50 + (bullish - bearish) * 16;
  const sentiment = clampPercent(sentimentRaw);

  // Score general: confianza alta sube, riesgo y volatilidad bajan.
  const score = clampPercent(confidence * 0.5 + (100 - risk) * 0.3 + (100 - volatility) * 0.2);

  return { risk, volatility, confidence, liquidity, sentiment, score };
}
