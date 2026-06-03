export { SimulationEngine, SIMULATION_DISCLAIMER } from './core/SimulationEngine';
export { ScenarioParser } from './core/ScenarioParser';
export { AgentFactory } from './core/AgentFactory';
export { CausalGraphBuilder, graphSentiment } from './core/CausalGraph';

export { BullAgent, BearAgent, NeutralAgent, RiskAgent, MarketAgent } from './agents';
export { BaseAgent } from './agents/BaseAgent';

export { ScenarioBuilder, DEFAULT_MARKET_CONTEXT } from './scenarios/ScenarioBuilder';
export * from './scenarios/heuristics/btcHeuristics';

export { useSimulation } from './hooks/useSimulation';
export { useAstraChat } from './hooks/useAstraChat';

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
