import type {
  AgentSnapshot,
  CausalGraph,
  ParsedQuery,
  Scenario,
  ScenarioTriple,
} from '../types/simulation.types';
import { graphSentiment } from '../core/CausalGraph';
import {
  estimateLiquidationContext,
  getBtcStressProbabilities,
  projectBtcSimulationReferences,
  projectSimulatedFearGreed,
} from './heuristics/btcHeuristics';

export interface MarketContext {
  btcCurrentPrice: number;
  fearGreedIndex: number;
  marketTrend: 'bullish' | 'bearish' | 'sideways';
  btcDominance: number;
  isSimulated?: boolean;
  sourceLabel?: string;
}

export const DEFAULT_MARKET_CONTEXT: MarketContext = {
  btcCurrentPrice: 67_000,
  fearGreedIndex: 62,
  marketTrend: 'bullish',
  btcDominance: 52,
  isSimulated: true,
  sourceLabel: 'simulated_context',
};

export class ScenarioBuilder {
  static build(
    query: ParsedQuery,
    _agents: AgentSnapshot[],
    graph: CausalGraph,
    market: MarketContext = DEFAULT_MARKET_CONTEXT,
  ): ScenarioTriple {
    switch (query.intent) {
      case 'btc_crash':
        return ScenarioBuilder.buildBtcCrash(query, graph, market);
      default:
        return ScenarioBuilder.buildGeneric(graph);
    }
  }

  private static buildBtcCrash(
    query: ParsedQuery,
    _graph: CausalGraph,
    market: MarketContext,
  ): ScenarioTriple {
    const dropPct = query.percentage ?? 30;
    const probabilities = getBtcStressProbabilities(dropPct);
    const references = projectBtcSimulationReferences(market.btcCurrentPrice, dropPct);
    const liquidationContext = estimateLiquidationContext(dropPct);
    const projectedFearGreed = projectSimulatedFearGreed(market.fearGreedIndex, dropPct);

    const optimist: Scenario = {
      label: 'optimist',
      probability: probabilities.optimist,
      priceChange: -dropPct + 12,
      simulatedPriceReference: references.optimistReference,
      timeframe: '1-3 months',
      narrative:
        `Educational scenario: after a simulated ${dropPct}% stress move, liquidity absorption ` +
        `could create a partial recovery reference near ${references.optimistReference.toFixed(0)}. ` +
        'This is not real-time data and not a market forecast.',
      keyRisks: [
        'Scenario recovery fails if liquidity remains thin',
        'Macro uncertainty changes the model assumptions',
        'Simulated sentiment may not match real market behavior',
      ],
      triggers: [
        'Improved simulated liquidity context',
        'Reduced liquidation pressure in the model',
        'Stabilizing simulated sentiment',
      ],
      technicalLevels: {
        support: references.stressReference,
        resistance: references.optimistReference,
      },
    };

    const base: Scenario = {
      label: 'base',
      probability: probabilities.base,
      priceChange: -dropPct * 0.55,
      simulatedPriceReference: references.baseReference,
      timeframe: '3-6 months',
      narrative:
        `Educational scenario: the simulated stress reaches ${references.stressReference.toFixed(0)} ` +
        `and then moves into a sideways review phase. Liquidation context: ${liquidationContext}. ` +
        `Simulated sentiment index: ${projectedFearGreed}.`,
      keyRisks: [
        `Liquidation context remains ${liquidationContext}`,
        'Cross-asset pressure amplifies uncertainty',
        'Liquidity assumptions may be too optimistic',
      ],
      triggers: [
        'Gradual stabilization in the simulated model',
        'Lower stress readings over multiple time windows',
        'Sentiment returning toward neutral in the simulated context',
      ],
      technicalLevels: {
        support: references.stressReference * 0.95,
        resistance: references.baseReference,
      },
    };

    const stress: Scenario = {
      label: 'stress',
      probability: probabilities.stress,
      priceChange: -dropPct * 1.2,
      simulatedPriceReference: references.extendedStressReference,
      timeframe: '6-18 months',
      narrative:
        `Educational stress scenario: the simulated reference ${references.stressReference.toFixed(0)} ` +
        `does not stabilize and extends toward ${references.extendedStressReference.toFixed(0)}. ` +
        'This describes risk context only.',
      keyRisks: [
        'Persistent sentiment stress',
        `Liquidation context remains ${liquidationContext}`,
        'Lower liquidity across simulated venues',
        'Regulatory or macro shock changes the scenario path',
      ],
      triggers: [
        'Breakdown in simulated liquidity conditions',
        'Extended fear readings in the model',
        'Large risk-off shock in the scenario assumptions',
      ],
      technicalLevels: {
        support: references.extendedStressReference * 0.9,
        resistance: references.stressReference,
      },
    };

    return { optimist, base, stress };
  }

  private static buildGeneric(graph: CausalGraph): ScenarioTriple {
    const sentiment = graphSentiment(graph);
    const shared = {
      timeframe: '3-6 months',
      keyRisks: ['Scenario uncertainty', 'Liquidity assumptions', 'Regulatory context'],
      triggers: ['Improved context', 'Lower stress signals', 'Higher model uncertainty'],
    };

    return {
      optimist: {
        ...shared,
        label: 'optimist',
        probability: 0.25,
        priceChange: 20,
        narrative: 'Educational favorable scenario with positive context assumptions.',
      },
      base: {
        ...shared,
        label: 'base',
        probability: 0.55,
        priceChange: sentiment > 0 ? 8 : -8,
        narrative: 'Educational base scenario based on current model assumptions.',
      },
      stress: {
        ...shared,
        label: 'stress',
        probability: 0.2,
        priceChange: -28,
        narrative: 'Educational stress scenario with adverse assumptions.',
      },
    };
  }
}
