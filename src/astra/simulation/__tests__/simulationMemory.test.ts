import { describe, expect, it } from 'vitest';

import { createSimulationMemory, type SimulationStorageAdapter } from '../learning/simulationMemory';
import { createInitialLearningMap } from '../learning/learningEngine';
import { SIMULATION_HISTORY_LIMIT, type SimulationHistoryEntry } from '../learning/learning.types';

function createMemoryAdapter(): SimulationStorageAdapter {
  const store = new Map<string, string>();
  return {
    getItem: async (key) => store.get(key) ?? null,
    setItem: async (key, value) => {
      store.set(key, value);
    },
    removeItem: async (key) => {
      store.delete(key);
    },
  };
}

function makeEntry(index: number): SimulationHistoryEntry {
  return {
    id: `sim-${index}`,
    rawQuery: `escenario ${index}`,
    intent: 'generic',
    summary: 'resumen educativo',
    metrics: { risk: 50, volatility: 40, confidence: 60, liquidity: 55, sentiment: 50, score: 58 },
    createdAt: 1_000 + index,
  };
}

describe('Astra simulation memory', () => {
  it('saves and reads simulation history newest first', async () => {
    const memory = createSimulationMemory(createMemoryAdapter());
    await memory.saveSimulation(makeEntry(1));
    await memory.saveSimulation(makeEntry(2));

    const history = await memory.getSimulationHistory();
    expect(history).toHaveLength(2);
    expect(history[0].id).toBe('sim-2');
  });

  it('caps history at the configured limit', async () => {
    const memory = createSimulationMemory(createMemoryAdapter());
    for (let i = 0; i < SIMULATION_HISTORY_LIMIT + 10; i += 1) {
      await memory.saveSimulation(makeEntry(i));
    }
    const history = await memory.getSimulationHistory();
    expect(history).toHaveLength(SIMULATION_HISTORY_LIMIT);
  });

  it('clears history', async () => {
    const memory = createSimulationMemory(createMemoryAdapter());
    await memory.saveSimulation(makeEntry(1));
    await memory.clearSimulationHistory();
    expect(await memory.getSimulationHistory()).toHaveLength(0);
  });

  it('stores and reads feedback', async () => {
    const memory = createSimulationMemory(createMemoryAdapter());
    await memory.saveFeedback({ resultId: 'sim-1', feedbackType: 'useful', createdAt: 1 });
    const feedback = await memory.getFeedbackHistory();
    expect(feedback[0].feedbackType).toBe('useful');
  });

  it('persists and resets agent learning state', async () => {
    const memory = createSimulationMemory(createMemoryAdapter());
    const learning = createInitialLearningMap();
    learning.risk.weightAdjustment = 0.1;
    await memory.saveAgentLearningState(learning);

    const loaded = await memory.getAgentLearningState();
    expect(loaded.risk.weightAdjustment).toBeCloseTo(0.1);

    const reset = await memory.resetAgentLearning();
    expect(reset.risk.weightAdjustment).toBe(0);
  });

  it('returns a normalized learning map when storage is empty', async () => {
    const memory = createSimulationMemory(createMemoryAdapter());
    const learning = await memory.getAgentLearningState();
    expect(Object.keys(learning)).toHaveLength(5);
  });
});
