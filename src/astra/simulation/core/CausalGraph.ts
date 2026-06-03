import type {
  CausalEdge,
  CausalGraph,
  CausalNode,
  ParsedQuery,
  SimulationIntent,
} from '../types/simulation.types';

type GraphTemplate = (query: ParsedQuery) => { nodes: CausalNode[]; edges: CausalEdge[] };

const btcCrashGraph: GraphTemplate = (query) => {
  const pct = query.percentage ?? 30;
  const price = query.simulatedCurrentBtcPrice ?? 67_000;
  const simulatedReference = price * (1 - pct / 100);

  const nodes: CausalNode[] = [
    {
      id: 'trigger',
      label: `BTC simulated stress ${pct}%`,
      type: 'trigger',
      weight: 1,
      sentiment: -0.9,
    },
    {
      id: 'altcoin_pressure',
      label: 'Altcoin pressure',
      type: 'first_order',
      weight: 0.9,
      sentiment: -0.85,
    },
    {
      id: 'leverage_liquidations',
      label: 'Leverage stress',
      type: 'first_order',
      weight: 0.85,
      sentiment: -0.9,
    },
    {
      id: 'defensive_liquidity',
      label: 'Defensive liquidity shift',
      type: 'first_order',
      weight: 0.75,
      sentiment: -0.3,
    },
    {
      id: 'volume_spike',
      label: 'Simulated volume spike',
      type: 'second_order',
      weight: 0.7,
      sentiment: -0.2,
    },
    {
      id: 'fear_greed_stress',
      label: 'Sentiment stress',
      type: 'second_order',
      weight: 0.8,
      sentiment: -0.8,
    },
    {
      id: 'demand_pressure',
      label: 'Possible demand pressure',
      type: 'second_order',
      weight: 0.5,
      sentiment: 0.45,
    },
    {
      id: 'outcome_reference',
      label: `Simulated reference ${simulatedReference.toFixed(0)}`,
      type: 'outcome',
      weight: 0.6,
      sentiment: 0.05,
    },
    {
      id: 'outcome_uncertainty',
      label: 'Scenario uncertainty',
      type: 'outcome',
      weight: 0.7,
      sentiment: 0,
    },
  ];

  const edges: CausalEdge[] = [
    { from: 'trigger', to: 'altcoin_pressure', weight: 0.95, label: 'historical correlation context' },
    { from: 'trigger', to: 'leverage_liquidations', weight: 0.88, label: 'stress cascade context' },
    { from: 'trigger', to: 'defensive_liquidity', weight: 0.75 },
    { from: 'altcoin_pressure', to: 'fear_greed_stress', weight: 0.8 },
    { from: 'leverage_liquidations', to: 'volume_spike', weight: 0.85 },
    { from: 'leverage_liquidations', to: 'fear_greed_stress', weight: 0.7 },
    { from: 'defensive_liquidity', to: 'demand_pressure', weight: 0.45 },
    { from: 'fear_greed_stress', to: 'outcome_uncertainty', weight: 0.6 },
    { from: 'demand_pressure', to: 'outcome_reference', weight: 0.55 },
    { from: 'outcome_reference', to: 'outcome_uncertainty', weight: 0.7 },
  ];

  return { nodes, edges };
};

const GRAPH_TEMPLATES: Partial<Record<SimulationIntent, GraphTemplate>> = {
  btc_crash: btcCrashGraph,
};

function genericGraph(_query: ParsedQuery): { nodes: CausalNode[]; edges: CausalEdge[] } {
  const nodes: CausalNode[] = [
    { id: 'trigger', label: 'Scenario trigger', type: 'trigger', weight: 1, sentiment: 0 },
    { id: 'market_reaction', label: 'Market reaction context', type: 'first_order', weight: 0.7, sentiment: -0.2 },
    { id: 'outcome', label: 'Educational scenario outcome', type: 'outcome', weight: 0.5, sentiment: 0 },
  ];
  const edges: CausalEdge[] = [
    { from: 'trigger', to: 'market_reaction', weight: 0.8 },
    { from: 'market_reaction', to: 'outcome', weight: 0.6 },
  ];
  return { nodes, edges };
}

export class CausalGraphBuilder {
  static build(intent: SimulationIntent, query: ParsedQuery): CausalGraph {
    const template = GRAPH_TEMPLATES[intent] ?? genericGraph;
    return template(query);
  }
}

export function graphSentiment(graph: CausalGraph): number {
  if (graph.nodes.length === 0) return 0;
  const total = graph.nodes.reduce((sum, node) => sum + node.sentiment * node.weight, 0);
  const totalWeight = graph.nodes.reduce((sum, node) => sum + node.weight, 0);
  return totalWeight > 0 ? total / totalWeight : 0;
}
