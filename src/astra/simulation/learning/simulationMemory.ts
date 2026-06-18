import { createInitialLearningMap, normalizeLearningMap } from './learningEngine';
import {
  SIMULATION_HISTORY_LIMIT,
  type AgentLearningMap,
  type SimulationFeedback,
  type SimulationHistoryEntry,
} from './learning.types';

const SCHEMA_VERSION = 1;

export const SIMULATION_MEMORY_KEYS = {
  history: 'qvex.astra.sim.history.v1',
  feedback: 'qvex.astra.sim.feedback.v1',
  learning: 'qvex.astra.sim.learning.v1',
} as const;

export interface SimulationStorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

function defaultAdapter(): SimulationStorageAdapter {
  // Carga diferida: evita resolver el modulo nativo de RN en entornos de test (node).
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return {
    getItem: (key) => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
    removeItem: (key) => AsyncStorage.removeItem(key),
  };
}

interface Envelope<T> {
  schemaVersion: number;
  savedAt: string;
  data: T;
}

async function readEnvelope<T>(
  adapter: SimulationStorageAdapter,
  key: string,
  fallback: T,
): Promise<T> {
  const raw = await adapter.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw) as Envelope<T>;
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      return fallback;
    }
    return parsed.data;
  } catch {
    return fallback;
  }
}

async function writeEnvelope<T>(
  adapter: SimulationStorageAdapter,
  key: string,
  data: T,
  now: number,
): Promise<void> {
  const envelope: Envelope<T> = {
    schemaVersion: SCHEMA_VERSION,
    savedAt: new Date(now).toISOString(),
    data,
  };
  await adapter.setItem(key, JSON.stringify(envelope));
}

/**
 * Memoria local del simulador. No guarda wallet, claves, ni precios reales:
 * solo historial educativo, feedback y calibracion de agentes.
 */
export function createSimulationMemory(adapter: SimulationStorageAdapter = defaultAdapter()) {
  return {
    async saveSimulation(entry: SimulationHistoryEntry, now: number = Date.now()): Promise<SimulationHistoryEntry[]> {
      const history = await readEnvelope<SimulationHistoryEntry[]>(adapter, SIMULATION_MEMORY_KEYS.history, []);
      const next = [entry, ...history].slice(0, SIMULATION_HISTORY_LIMIT);
      await writeEnvelope(adapter, SIMULATION_MEMORY_KEYS.history, next, now);
      return next;
    },

    async getSimulationHistory(): Promise<SimulationHistoryEntry[]> {
      return readEnvelope<SimulationHistoryEntry[]>(adapter, SIMULATION_MEMORY_KEYS.history, []);
    },

    async clearSimulationHistory(): Promise<void> {
      await adapter.removeItem(SIMULATION_MEMORY_KEYS.history);
    },

    async saveFeedback(feedback: SimulationFeedback, now: number = Date.now()): Promise<SimulationFeedback[]> {
      const all = await readEnvelope<SimulationFeedback[]>(adapter, SIMULATION_MEMORY_KEYS.feedback, []);
      const next = [feedback, ...all].slice(0, SIMULATION_HISTORY_LIMIT);
      await writeEnvelope(adapter, SIMULATION_MEMORY_KEYS.feedback, next, now);
      return next;
    },

    async getFeedbackHistory(): Promise<SimulationFeedback[]> {
      return readEnvelope<SimulationFeedback[]>(adapter, SIMULATION_MEMORY_KEYS.feedback, []);
    },

    async getAgentLearningState(now: number = Date.now()): Promise<AgentLearningMap> {
      const stored = await readEnvelope<AgentLearningMap | null>(
        adapter,
        SIMULATION_MEMORY_KEYS.learning,
        null,
      );
      return normalizeLearningMap(stored, now);
    },

    async saveAgentLearningState(state: AgentLearningMap, now: number = Date.now()): Promise<void> {
      await writeEnvelope(adapter, SIMULATION_MEMORY_KEYS.learning, normalizeLearningMap(state, now), now);
    },

    async resetAgentLearning(now: number = Date.now()): Promise<AgentLearningMap> {
      const fresh = createInitialLearningMap(now);
      await writeEnvelope(adapter, SIMULATION_MEMORY_KEYS.learning, fresh, now);
      return fresh;
    },
  };
}

export type SimulationMemory = ReturnType<typeof createSimulationMemory>;
