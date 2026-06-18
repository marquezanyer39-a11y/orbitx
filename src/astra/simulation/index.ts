export { SimulationEngine, SIMULATION_DISCLAIMER } from './core/SimulationEngine';
export type { RunRuntimeOptions, SimulationOptions } from './core/SimulationEngine';
export { ScenarioParser } from './core/ScenarioParser';
export { AgentFactory } from './core/AgentFactory';
export { CausalGraphBuilder, graphSentiment } from './core/CausalGraph';

export { BullAgent, BearAgent, NeutralAgent, RiskAgent, MarketAgent } from './agents';
export { BaseAgent } from './agents/BaseAgent';

export { ScenarioBuilder, DEFAULT_MARKET_CONTEXT } from './scenarios/ScenarioBuilder';
export * from './scenarios/heuristics/btcHeuristics';

export { useSimulation } from './hooks/useSimulation';
export { useAstraChat } from './hooks/useAstraChat';

export {
  applyUserFeedback,
  createInitialLearningMap,
  normalizeLearningMap,
  effectiveWeight,
  adjustConfidence,
  deriveCoreMetrics,
  clampPercent,
  createSimulationMemory,
  SIMULATION_MEMORY_KEYS,
  SIMULATION_HISTORY_LIMIT,
  ALL_AGENT_ROLES,
  AGENT_DISPLAY_NAMES,
  LEARNING_BOUNDS,
} from './learning';
export type {
  FeedbackType,
  SimulationFeedback,
  AgentLearningState,
  AgentLearningMap,
  CoreSimulationMetrics,
  SimulationHistoryEntry,
  SimulationMemory,
  SimulationStorageAdapter,
} from './learning';

export type {
  AgentMemory,
  AgentOutput,
  AgentRole,
  AgentSnapshot,
  CausalEdge,
  CausalGraph,
  CausalNode,
  EducationalAction,
  ParsedQuery,
  RiskItem,
  RiskLevel,
  Scenario,
  ScenarioLabel,
  ScenarioTriple,
  SimulationDisclaimer,
  SimulationIntent,
  SimulationPressureLabel,
  SimulationResult,
} from './types/simulation.types';

export type { MarketContext } from './scenarios/ScenarioBuilder';
export type { SimContext } from './agents/BaseAgent';
export type { UseSimulationReturn, UseSimulationState } from './hooks/useSimulation';
export type { ChatMessage, MessageType } from './hooks/useAstraChat';
