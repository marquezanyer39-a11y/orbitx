import { describe, expect, it } from 'vitest';

import { SimulationEngine } from '../core/SimulationEngine';
import {
  applyUserFeedback,
  createInitialLearningMap,
  normalizeLearningMap,
} from '../learning/learningEngine';
import { LEARNING_BOUNDS } from '../learning/learning.types';

function runResult() {
  return new SimulationEngine().run('BTC cae 30%');
}

describe('Astra learning engine', () => {
  it('starts with a neutral learning map for all five agents', () => {
    const map = createInitialLearningMap();
    expect(Object.keys(map).sort()).toEqual(['bear', 'bull', 'market', 'neutral', 'risk']);
    Object.values(map).forEach((state) => {
      expect(state.weightAdjustment).toBe(0);
      expect(state.confidenceAdjustment).toBe(0);
      expect(state.feedbackCount).toBe(0);
    });
  });

  it('useful feedback raises confidence/weight of dominant agents', () => {
    const result = runResult();
    const next = applyUserFeedback({
      result,
      feedbackType: 'useful',
      currentLearning: createInitialLearningMap(),
    });

    const dominant = [...result.agents].sort(
      (a, b) => b.output.confidence - a.output.confidence,
    )[0].role;

    expect(next[dominant].confidenceAdjustment).toBeGreaterThan(0);
    expect(next[dominant].usefulCount).toBe(1);
  });

  it('confusing feedback lowers confidence for all agents', () => {
    const result = runResult();
    const next = applyUserFeedback({
      result,
      feedbackType: 'confusing',
      currentLearning: createInitialLearningMap(),
    });

    Object.values(next).forEach((state) => {
      expect(state.confidenceAdjustment).toBeLessThan(0);
      expect(state.confusingCount).toBe(1);
    });
  });

  it('too_bullish reduces bull weight and reinforces risk and bear', () => {
    const result = runResult();
    const next = applyUserFeedback({
      result,
      feedbackType: 'too_bullish',
      currentLearning: createInitialLearningMap(),
    });

    expect(next.bull.weightAdjustment).toBeLessThan(0);
    expect(next.risk.weightAdjustment).toBeGreaterThan(0);
    expect(next.bear.weightAdjustment).toBeGreaterThan(0);
  });

  it('clamps cumulative adjustments to safety bounds', () => {
    const result = runResult();
    let learning = createInitialLearningMap();
    for (let i = 0; i < 50; i += 1) {
      learning = applyUserFeedback({ result, feedbackType: 'too_soft', currentLearning: learning });
    }
    expect(learning.risk.weightAdjustment).toBeLessThanOrEqual(LEARNING_BOUNDS.maxAdjustment);
    expect(learning.risk.weightAdjustment).toBeGreaterThanOrEqual(LEARNING_BOUNDS.minAdjustment);
  });

  it('normalizes a partial learning map to all five agents', () => {
    const partial = { bull: { agentId: 'bull' as const, weightAdjustment: 0.5, confidenceAdjustment: 0 } };
    const normalized = normalizeLearningMap(partial as never);
    expect(Object.keys(normalized)).toHaveLength(5);
    // weight 0.5 must be clamped into bounds
    expect(normalized.bull.weightAdjustment).toBeLessThanOrEqual(LEARNING_BOUNDS.maxAdjustment);
  });

  it('learning state shifts aggregate confidence in the engine', () => {
    const result = runResult();
    const learning = applyUserFeedback({
      result,
      feedbackType: 'confusing',
      currentLearning: createInitialLearningMap(),
    });

    const baseAvg =
      result.agents.reduce((s, a) => s + a.output.confidence, 0) / result.agents.length;

    const calibrated = new SimulationEngine().run('BTC cae 30%', { learningState: learning });
    const calibratedAvg =
      calibrated.agents.reduce((s, a) => s + a.output.confidence, 0) / calibrated.agents.length;

    expect(calibratedAvg).toBeLessThan(baseAvg);
  });
});
