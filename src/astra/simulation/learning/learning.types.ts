import type { AgentRole, SimulationIntent } from '../types/simulation.types';

/**
 * Feedback educativo que el usuario puede dar sobre una simulacion.
 * No representa señales financieras: solo calibra el simulador local.
 */
export type FeedbackType =
  | 'useful'
  | 'confusing'
  | 'too_bullish'
  | 'too_bearish'
  | 'too_risky'
  | 'too_soft';

export interface SimulationFeedback {
  resultId: string;
  feedbackType: FeedbackType;
  createdAt: number;
}

/**
 * Estado de aprendizaje local por agente. Es una calibracion simple por reglas,
 * NO un modelo entrenado. Los ajustes estan acotados para evitar dominacion.
 */
export interface AgentLearningState {
  agentId: AgentRole;
  weightAdjustment: number;
  confidenceAdjustment: number;
  feedbackCount: number;
  usefulCount: number;
  confusingCount: number;
  tooBullishCount: number;
  tooBearishCount: number;
  tooRiskyCount: number;
  tooSoftCount: number;
  updatedAt: number;
}

export type AgentLearningMap = Record<AgentRole, AgentLearningState>;

/**
 * Metricas nucleo derivadas de una SimulationResult. 0-100.
 */
export interface CoreSimulationMetrics {
  risk: number;
  volatility: number;
  confidence: number;
  liquidity: number;
  sentiment: number;
  score: number;
}

/**
 * Entrada compacta de historial local. No guarda wallet, claves ni precios reales.
 */
export interface SimulationHistoryEntry {
  id: string;
  rawQuery: string;
  intent: SimulationIntent;
  summary: string;
  metrics: CoreSimulationMetrics;
  createdAt: number;
}

export const SIMULATION_HISTORY_LIMIT = 50;

export const ALL_AGENT_ROLES: AgentRole[] = ['bull', 'bear', 'neutral', 'risk', 'market'];

export const AGENT_DISPLAY_NAMES: Record<AgentRole, string> = {
  bull: 'Alex Bull',
  bear: 'Sara Bear',
  neutral: 'Marco Analisis',
  risk: 'Lena Risk',
  market: 'Market Sim',
};

/** Limites de seguridad para los ajustes de aprendizaje. */
export const LEARNING_BOUNDS = {
  minAdjustment: -0.2,
  maxAdjustment: 0.2,
  /** Maximo cambio por evento de feedback. */
  stepSmall: 0.03,
  stepMedium: 0.05,
} as const;
