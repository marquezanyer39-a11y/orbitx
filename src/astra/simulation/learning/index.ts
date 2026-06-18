export {
  applyUserFeedback,
  createInitialAgentLearning,
  createInitialLearningMap,
  normalizeLearningMap,
  effectiveWeight,
  adjustConfidence,
} from './learningEngine';
export type { ApplyFeedbackParams } from './learningEngine';

export { deriveCoreMetrics, clampPercent } from './simulationMetrics';

export {
  createSimulationMemory,
  SIMULATION_MEMORY_KEYS,
} from './simulationMemory';
export type { SimulationMemory, SimulationStorageAdapter } from './simulationMemory';

export {
  SIMULATION_HISTORY_LIMIT,
  ALL_AGENT_ROLES,
  AGENT_DISPLAY_NAMES,
  LEARNING_BOUNDS,
} from './learning.types';
export type {
  FeedbackType,
  SimulationFeedback,
  AgentLearningState,
  AgentLearningMap,
  CoreSimulationMetrics,
  SimulationHistoryEntry,
} from './learning.types';
