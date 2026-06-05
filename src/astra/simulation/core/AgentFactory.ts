import type { SimulationIntent } from '../types/simulation.types';
import { BaseAgent } from '../agents/BaseAgent';
import {
  BearAgent,
  BullAgent,
  MarketAgent,
  NeutralAgent,
  RiskAgent,
} from '../agents';

const AGENT_SETS: Record<SimulationIntent, () => BaseAgent[]> = {
  btc_crash: () => [
    new BearAgent(),
    new BullAgent(),
    new NeutralAgent(),
    new RiskAgent(),
    new MarketAgent(),
  ],
  sol_exposure: () => [
    new BullAgent(),
    new NeutralAgent(),
    new RiskAgent(),
    new MarketAgent(),
  ],
  memecoin_launch: () => [
    new RiskAgent(),
    new BearAgent(),
    new MarketAgent(),
    new BullAgent(),
  ],
  portfolio_stress: () => [
    new RiskAgent(),
    new BearAgent(),
    new NeutralAgent(),
    new BullAgent(),
    new MarketAgent(),
  ],
  exchange_growth: () => [
    new BullAgent(),
    new NeutralAgent(),
    new RiskAgent(),
    new MarketAgent(),
  ],
  qvex_growth: () => [
    new BullAgent(),
    new MarketAgent(),
    new NeutralAgent(),
    new RiskAgent(),
  ],
  qvex_operational_stress: () => [
    new RiskAgent(),
    new NeutralAgent(),
    new BearAgent(),
    new MarketAgent(),
  ],
  macro_pressure: () => [
    new MarketAgent(),
    new RiskAgent(),
    new NeutralAgent(),
    new BearAgent(),
  ],
  social_sentiment_shift: () => [
    new MarketAgent(),
    new BullAgent(),
    new BearAgent(),
    new NeutralAgent(),
  ],
  operational_risk: () => [
    new RiskAgent(),
    new NeutralAgent(),
    new BearAgent(),
    new MarketAgent(),
  ],
  liquidity_stress: () => [
    new RiskAgent(),
    new BearAgent(),
    new MarketAgent(),
    new NeutralAgent(),
  ],
  generic: () => [
    new NeutralAgent(),
    new BullAgent(),
    new BearAgent(),
    new RiskAgent(),
  ],
};

export class AgentFactory {
  static createAgents(intent: SimulationIntent): BaseAgent[] {
    const factory = AGENT_SETS[intent] ?? AGENT_SETS.generic;
    return factory();
  }
}
