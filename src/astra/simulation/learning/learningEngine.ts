import type { AgentRole, SimulationResult } from '../types/simulation.types';
import {
  ALL_AGENT_ROLES,
  LEARNING_BOUNDS,
  type AgentLearningMap,
  type AgentLearningState,
  type FeedbackType,
} from './learning.types';

function clampAdjustment(value: number): number {
  return Math.max(LEARNING_BOUNDS.minAdjustment, Math.min(LEARNING_BOUNDS.maxAdjustment, value));
}

export function createInitialAgentLearning(agentId: AgentRole, now: number = Date.now()): AgentLearningState {
  return {
    agentId,
    weightAdjustment: 0,
    confidenceAdjustment: 0,
    feedbackCount: 0,
    usefulCount: 0,
    confusingCount: 0,
    tooBullishCount: 0,
    tooBearishCount: 0,
    tooRiskyCount: 0,
    tooSoftCount: 0,
    updatedAt: now,
  };
}

export function createInitialLearningMap(now: number = Date.now()): AgentLearningMap {
  return ALL_AGENT_ROLES.reduce((map, role) => {
    map[role] = createInitialAgentLearning(role, now);
    return map;
  }, {} as AgentLearningMap);
}

/** Garantiza que el mapa tenga los 5 agentes, rellenando los que falten. */
export function normalizeLearningMap(
  partial: Partial<AgentLearningMap> | null | undefined,
  now: number = Date.now(),
): AgentLearningMap {
  const base = createInitialLearningMap(now);
  if (!partial) {
    return base;
  }
  ALL_AGENT_ROLES.forEach((role) => {
    const existing = partial[role];
    if (existing) {
      base[role] = {
        ...base[role],
        ...existing,
        agentId: role,
        weightAdjustment: clampAdjustment(existing.weightAdjustment ?? 0),
        confidenceAdjustment: clampAdjustment(existing.confidenceAdjustment ?? 0),
      };
    }
  });
  return base;
}

interface RoleDelta {
  weight?: number;
  confidence?: number;
}

/**
 * Reglas de calibracion local por tipo de feedback. Devuelve deltas por rol.
 * Los deltas se acumulan sobre los ajustes existentes y luego se acotan.
 */
function deltasForFeedback(feedbackType: FeedbackType, dominantRoles: AgentRole[]): Partial<Record<AgentRole, RoleDelta>> {
  const s = LEARNING_BOUNDS.stepSmall;
  const m = LEARNING_BOUNDS.stepMedium;

  switch (feedbackType) {
    case 'useful': {
      // Subir ligeramente confianza/peso de agentes dominantes.
      const deltas: Partial<Record<AgentRole, RoleDelta>> = {};
      dominantRoles.forEach((role) => {
        deltas[role] = { weight: s, confidence: s };
      });
      return deltas;
    }
    case 'confusing':
      // Bajar confianza general de todos los agentes.
      return ALL_AGENT_ROLES.reduce((acc, role) => {
        acc[role] = { confidence: -s };
        return acc;
      }, {} as Partial<Record<AgentRole, RoleDelta>>);
    case 'too_bullish':
      // Reducir peso de Alex Bull, reforzar Lena Risk y Sara Bear.
      return {
        bull: { weight: -m, confidence: -s },
        risk: { weight: s },
        bear: { weight: s },
      };
    case 'too_bearish':
      // Reducir peso de Sara Bear, reforzar Marco Analisis y Alex Bull.
      return {
        bear: { weight: -m, confidence: -s },
        neutral: { weight: s },
        bull: { weight: s },
      };
    case 'too_risky':
      // Reducir sensibilidad/peso de Lena Risk, reforzar lectura neutral.
      return {
        risk: { weight: -m, confidence: -s },
        neutral: { weight: s },
      };
    case 'too_soft':
      // Aumentar sensibilidad de riesgo: subir peso de Lena Risk.
      return {
        risk: { weight: m, confidence: s },
        bear: { weight: s },
      };
    default:
      return {};
  }
}

function bumpCounters(state: AgentLearningState, feedbackType: FeedbackType): void {
  state.feedbackCount += 1;
  switch (feedbackType) {
    case 'useful':
      state.usefulCount += 1;
      break;
    case 'confusing':
      state.confusingCount += 1;
      break;
    case 'too_bullish':
      state.tooBullishCount += 1;
      break;
    case 'too_bearish':
      state.tooBearishCount += 1;
      break;
    case 'too_risky':
      state.tooRiskyCount += 1;
      break;
    case 'too_soft':
      state.tooSoftCount += 1;
      break;
    default:
      break;
  }
}

export interface ApplyFeedbackParams {
  result: SimulationResult;
  feedbackType: FeedbackType;
  currentLearning: AgentLearningMap;
  now?: number;
}

/**
 * Aplica feedback del usuario y devuelve un NUEVO mapa de aprendizaje (inmutable).
 * Aprendizaje local controlado: ajustes acotados, sin entrenar ningun modelo.
 */
export function applyUserFeedback(params: ApplyFeedbackParams): AgentLearningMap {
  const { result, feedbackType, now = Date.now() } = params;
  const current = normalizeLearningMap(params.currentLearning, now);

  // Agentes dominantes = los de mayor confianza en este resultado.
  const dominantRoles = [...result.agents]
    .sort((a, b) => b.output.confidence - a.output.confidence)
    .slice(0, 2)
    .map((agent) => agent.role);

  const deltas = deltasForFeedback(feedbackType, dominantRoles);

  const next = createInitialLearningMap(now);
  ALL_AGENT_ROLES.forEach((role) => {
    const prev = current[role];
    const delta = deltas[role] ?? {};
    const updated: AgentLearningState = {
      ...prev,
      agentId: role,
      weightAdjustment: clampAdjustment(prev.weightAdjustment + (delta.weight ?? 0)),
      confidenceAdjustment: clampAdjustment(prev.confidenceAdjustment + (delta.confidence ?? 0)),
      updatedAt: now,
    };
    // El feedback afecta a todos los contadores (es feedback de la simulacion completa).
    bumpCounters(updated, feedbackType);
    next[role] = updated;
  });

  return next;
}

/**
 * Multiplicador de peso efectivo para un agente (nunca 0, nunca dominante total).
 * baseWeight 1.0 +/- ajuste, acotado a [0.5, 1.5].
 */
export function effectiveWeight(state: AgentLearningState | undefined): number {
  const adjustment = state?.weightAdjustment ?? 0;
  return Math.max(0.5, Math.min(1.5, 1 + adjustment));
}

/** Confianza ajustada por aprendizaje, acotada a un rango educativo seguro. */
export function adjustConfidence(baseConfidence: number, state: AgentLearningState | undefined): number {
  const adjustment = state?.confidenceAdjustment ?? 0;
  return Math.max(0.05, Math.min(0.98, baseConfidence + adjustment));
}
