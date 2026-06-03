import type {
  AgentMemory,
  AgentOutput,
  AgentRole,
  AgentSnapshot,
  ParsedQuery,
  SimulationPressureLabel,
} from '../types/simulation.types';

export interface SimContext {
  query: ParsedQuery;
  simulatedCurrentBtcPrice: number;
  fearGreedIndex: number;
  marketTrend: 'bullish' | 'bearish' | 'sideways';
}

export abstract class BaseAgent {
  abstract role: AgentRole;
  abstract name: string;
  abstract bias: number;

  protected memory: AgentMemory = {
    sessionHistory: [],
    beliefs: {},
    lastPressure: null,
  };

  abstract reason(ctx: SimContext): AgentOutput;

  protected remember(fact: string, pressure: SimulationPressureLabel | null = null): void {
    this.memory.sessionHistory.push(fact);
    if (pressure) this.memory.lastPressure = pressure;
    if (this.memory.sessionHistory.length > 10) {
      this.memory.sessionHistory.shift();
    }
  }

  protected setBelief(key: string, value: number): void {
    this.memory.beliefs[key] = Math.max(-1, Math.min(1, value));
  }

  snapshot(output: AgentOutput): AgentSnapshot {
    return {
      role: this.role,
      name: this.name,
      bias: this.bias,
      memory: { ...this.memory },
      output,
    };
  }

  protected applyBias(baseChange: number): number {
    const biasEffect = baseChange * this.bias * 0.25;
    return baseChange + biasEffect;
  }
}
