import { describe, expect, it } from 'vitest';

import { BearAgent, BullAgent, MarketAgent, NeutralAgent, RiskAgent } from '../agents';
import type { SimContext } from '../agents/BaseAgent';
import { AgentFactory } from '../core/AgentFactory';
import { CausalGraphBuilder } from '../core/CausalGraph';
import { ScenarioParser } from '../core/ScenarioParser';
import { ScenarioBuilder, DEFAULT_MARKET_CONTEXT } from '../scenarios/ScenarioBuilder';
import type {
  AgentRole,
  ParsedQuery,
  SimulationIntent,
  SimulationPressureLabel,
} from '../types/simulation.types';

const VALID_ROLES: AgentRole[] = ['bull', 'bear', 'neutral', 'risk', 'market'];
const VALID_PRESSURES: SimulationPressureLabel[] = [
  'bullish_pressure',
  'bearish_pressure',
  'neutral_pressure',
  'risk_alert',
];

const OPERATIONAL_TERMS = [
  'comprar',
  'vender',
  'holdear',
  'buy',
  'sell',
  'hold',
  'entrada',
  'salida',
  'senal',
  'señal',
  'precio objetivo',
];

const NEGATIVE_DISCLAIMER = 'no recomienda comprar, vender ni mantener';

const parserCases: Array<{ query: string; intent: SimulationIntent }> = [
  { query: 'inflacion alta y tasas elevadas', intent: 'macro_pressure' },
  { query: 'dolar fuerte presiona mercados', intent: 'macro_pressure' },
  { query: 'aversión al riesgo global', intent: 'macro_pressure' },
  { query: 'FOMO social impulsa QVEX', intent: 'social_sentiment_shift' },
  { query: 'narrativa viral aumenta menciones', intent: 'social_sentiment_shift' },
  { query: 'sentimiento negativo en cripto', intent: 'social_sentiment_shift' },
  { query: 'riesgo operativo en exchange', intent: 'operational_risk' },
  { query: 'incertidumbre operativa', intent: 'operational_risk' },
  { query: 'deterioro de confianza', intent: 'operational_risk' },
  { query: 'caida de liquidez en mercado', intent: 'liquidity_stress' },
  { query: 'liquidez baja y volatilidad alta', intent: 'liquidity_stress' },
  { query: 'QVEX crece rapido', intent: 'qvex_growth' },
  { query: 'QVEX llega a 1 millon de usuarios', intent: 'qvex_growth' },
  { query: 'QVEX enfrenta tension operativa', intent: 'qvex_operational_stress' },
  {
    query: 'crecimiento acelerado con problemas operativos',
    intent: 'qvex_operational_stress',
  },
];

const intentQueries: Array<{ intent: SimulationIntent; query: string; expectedRisk: string[] }> = [
  {
    intent: 'macro_pressure',
    query: 'inflacion alta y tasas elevadas',
    expectedRisk: ['tasas', 'dolar', 'liquidez', 'inflacion'],
  },
  {
    intent: 'social_sentiment_shift',
    query: 'FOMO social impulsa QVEX',
    expectedRisk: ['social', 'narrativa', 'confianza', 'volatilidad'],
  },
  {
    intent: 'operational_risk',
    query: 'riesgo operativo en exchange',
    expectedRisk: ['operativo', 'continuidad', 'confianza'],
  },
  {
    intent: 'liquidity_stress',
    query: 'caida de liquidez en mercado',
    expectedRisk: ['liquidez', 'volatilidad', 'confianza'],
  },
  {
    intent: 'qvex_growth',
    query: 'QVEX crece rapido',
    expectedRisk: ['crecimiento', 'capacidad', 'liquidez', 'confianza'],
  },
  {
    intent: 'qvex_operational_stress',
    query: 'QVEX enfrenta tension operativa',
    expectedRisk: ['operativa', 'continuidad', 'confianza'],
  },
];

function buildSimContext(query: ParsedQuery): SimContext {
  return {
    query: {
      ...query,
      simulatedCurrentBtcPrice: 67_000,
    },
    simulatedCurrentBtcPrice: 67_000,
    fearGreedIndex: 62,
    marketTrend: 'bullish',
  };
}

function isOperationalRecommendation(text: string) {
  const lower = text.toLowerCase();
  return OPERATIONAL_TERMS.some(
    (term) => lower.includes(term) && !lower.includes(NEGATIVE_DISCLAIMER),
  );
}

describe('ASTRA Simulation category parser', () => {
  it.each(parserCases)('parses "$query" as $intent', ({ query, intent }) => {
    expect(ScenarioParser.parse(query).intent).toBe(intent);
  });
});

describe('ASTRA Simulation scenario builder', () => {
  it.each(intentQueries)(
    'builds differentiated scenarios for $intent',
    ({ intent, query, expectedRisk }) => {
      const parsed = ScenarioParser.parse(query);
      expect(parsed.intent).toBe(intent);

      const graph = CausalGraphBuilder.build(parsed.intent, {
        ...parsed,
        simulatedCurrentBtcPrice: 67_000,
      });
      const scenarios = ScenarioBuilder.build(
        { ...parsed, simulatedCurrentBtcPrice: 67_000 },
        [],
        graph,
        DEFAULT_MARKET_CONTEXT,
      );

      const totalProbability =
        scenarios.optimist.probability + scenarios.base.probability + scenarios.stress.probability;

      expect(scenarios.optimist.probability).toBeGreaterThan(0);
      expect(scenarios.base.probability).toBeGreaterThan(0);
      expect(scenarios.stress.probability).toBeGreaterThan(0);
      expect(totalProbability).toBeGreaterThan(0.99);
      expect(totalProbability).toBeLessThan(1.01);
      expect(scenarios.base.narrative).not.toBe(
        'Escenario educativo central basado en los supuestos actuales del modelo.',
      );

      const combinedRisks = [
        ...scenarios.optimist.keyRisks,
        ...scenarios.base.keyRisks,
        ...scenarios.stress.keyRisks,
      ]
        .join(' ')
        .toLowerCase();

      expect(expectedRisk.some((term) => combinedRisks.includes(term))).toBe(true);
      expect(isOperationalRecommendation(scenarios.base.narrative)).toBe(false);
    },
  );
});

describe('ASTRA Simulation agent factory', () => {
  it.each(intentQueries)(
    'creates valid agent outputs for $intent',
    ({ intent, query }) => {
      const parsed = ScenarioParser.parse(query);
      const ctx = buildSimContext(parsed);
      const agents = AgentFactory.createAgents(intent);

      expect(agents.length).toBeGreaterThan(0);

      const snapshots = agents.map((agent) => agent.snapshot(agent.reason(ctx)));

      snapshots.forEach((agent) => {
        expect(VALID_ROLES).toContain(agent.role);
        expect(agent.output.confidence).toBeGreaterThan(0);
        expect(agent.output.confidence).toBeLessThanOrEqual(1);
        expect(VALID_PRESSURES).toContain(agent.output.pressureLabel);

        const combined = `${agent.output.opinion} ${agent.output.keyArgument}`;
        expect(isOperationalRecommendation(combined)).toBe(false);
      });
    },
  );
});

describe('ASTRA Simulation textual safety', () => {
  it('keeps operational wording only inside negative disclaimers', () => {
    const agents = [
      new BullAgent(),
      new BearAgent(),
      new NeutralAgent(),
      new RiskAgent(),
      new MarketAgent(),
    ];

    const parsed = ScenarioParser.parse('QVEX enfrenta tension operativa');
    const ctx = buildSimContext(parsed);
    const outputs = agents.map((agent) => agent.reason(ctx));
    const text = outputs.map((output) => `${output.opinion} ${output.keyArgument}`).join(' ');

    expect(isOperationalRecommendation(text)).toBe(false);
  });
});
