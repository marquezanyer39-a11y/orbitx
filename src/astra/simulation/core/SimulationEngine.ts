import type {
  AgentSnapshot,
  ParsedQuery,
  RiskItem,
  SimulationDisclaimer,
  SimulationResult,
} from '../types/simulation.types';
import { AgentFactory } from './AgentFactory';
import { CausalGraphBuilder } from './CausalGraph';
import { ScenarioParser } from './ScenarioParser';
import { ScenarioBuilder, DEFAULT_MARKET_CONTEXT, MarketContext } from '../scenarios/ScenarioBuilder';
import type { SimContext } from '../agents/BaseAgent';

const ENGINE_VERSION = '1.0.0-educational-local';

export const SIMULATION_DISCLAIMER: SimulationDisclaimer = {
  title: 'Solo simulacion educativa',
  body:
    'No es asesoria financiera. No es prediccion. No usa datos en tiempo real. ' +
    'No ejecuta operaciones ni envia ordenes.',
  bullets: [
    'No recomienda comprar, vender ni mantener activos.',
    'No reemplaza investigacion propia ni revision profesional.',
    'Los precios mostrados son contexto simulado, no cotizaciones reales.',
    'Usalo solo para revisar escenarios y considerar riesgos.',
  ],
};

function generateLocalSimulationId(prefix = 'sim'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface SimulationOptions {
  market?: MarketContext;
}

export class SimulationEngine {
  private market: MarketContext;

  constructor(options: SimulationOptions = {}) {
    this.market = {
      ...DEFAULT_MARKET_CONTEXT,
      ...options.market,
      isSimulated: true,
      sourceLabel: options.market?.sourceLabel ?? 'simulated_context',
    };
  }

  run(userQuery: string): SimulationResult {
    const query = ScenarioParser.parse(userQuery);
    const enrichedQuery: ParsedQuery = {
      ...query,
      simulatedCurrentBtcPrice: this.market.btcCurrentPrice,
    };

    const agents = AgentFactory.createAgents(query.intent);
    const simContext: SimContext = {
      query: enrichedQuery,
      simulatedCurrentBtcPrice: this.market.btcCurrentPrice,
      fearGreedIndex: this.market.fearGreedIndex,
      marketTrend: this.market.marketTrend,
    };
    const agentSnapshots: AgentSnapshot[] = agents.map((agent) => {
      const output = agent.reason(simContext);
      return agent.snapshot(output);
    });

    const causalGraph = CausalGraphBuilder.build(query.intent, enrichedQuery);
    const scenarios = ScenarioBuilder.build(
      enrichedQuery,
      agentSnapshots,
      causalGraph,
      this.market,
    );

    const risks = this.consolidateRisks(agentSnapshots, scenarios);
    const summary = this.generateSummary(enrichedQuery, agentSnapshots, scenarios);
    const educationalNotes = this.generateEducationalNotes(enrichedQuery);
    const analysisPoints = this.generateAnalysisPoints(agentSnapshots);
    const considerations = this.generateConsiderations(risks);

    return {
      id: generateLocalSimulationId(),
      query: enrichedQuery,
      agents: agentSnapshots,
      causalGraph,
      scenarios,
      summary,
      risks,
      educationalNotes,
      analysisPoints,
      considerations,
      disclaimer: SIMULATION_DISCLAIMER,
      contextLabel: 'MOCK/current prices are simulated context only',
      createdAt: Date.now(),
      engineVersion: ENGINE_VERSION,
    };
  }

  private consolidateRisks(
    agents: AgentSnapshot[],
    scenarios: SimulationResult['scenarios'],
  ): RiskItem[] {
    const risks: RiskItem[] = [];

    scenarios.stress.keyRisks.slice(0, 2).forEach((risk) => {
      risks.push({
        level: 'critical',
        description: risk,
        mitigation: 'Evaluar exposicion y revisar escenarios antes de tomar decisiones personales.',
      });
    });

    scenarios.base.keyRisks.slice(0, 2).forEach((risk) => {
      risks.push({
        level: 'high',
        description: risk,
        mitigation: 'Considerar riesgos, liquidez y sensibilidad del portafolio.',
      });
    });

    const riskAgent = agents.find((agent) => agent.role === 'risk');
    if (riskAgent) {
      risks.push({
        level: 'high',
        description: riskAgent.output.keyArgument,
        mitigation: 'Revisar exposicion y no tomar esto como instruccion.',
      });
    }

    return risks.filter(
      (risk, index, self) => index === self.findIndex((item) => item.description === risk.description),
    );
  }

  private generateSummary(
    query: ParsedQuery,
    agents: AgentSnapshot[],
    scenarios: SimulationResult['scenarios'],
  ): string {
    const dropPct = query.percentage ?? 30;
    const asset = query.asset ?? 'BTC';
    const baseReference = scenarios.base.simulatedPriceReference;
    const stressReference = scenarios.stress.simulatedPriceReference;

    const bullishView = agents.find((agent) => agent.output.pressureLabel === 'bullish_pressure');
    const bearishView = agents.find((agent) => agent.output.pressureLabel === 'bearish_pressure');

    const baseReferenceText = baseReference
      ? `${baseReference.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`
      : 'lower simulated references';
    const stressReferenceText = stressReference
      ? `${stressReference.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`
      : 'stress references';

    return (
      `Solo simulacion educativa: a ${dropPct}% stress move in ${asset} creates a causal chain ` +
      'with liquidity stress, sentiment pressure and cross-asset uncertainty. ' +
      `${bullishView ? `Bullish pressure note: ${bullishView.output.keyArgument} ` : ''}` +
      `${bearishView ? `Bearish pressure note: ${bearishView.output.keyArgument} ` : ''}` +
      `The base scenario uses simulated reference ${baseReferenceText}; the stress scenario uses ` +
      `simulated reference ${stressReferenceText}. No tomar esto como instruccion.`
    );
  }

  private generateEducationalNotes(query: ParsedQuery): string[] {
    const asset = query.asset ?? 'BTC';
    return [
      `Evaluar exposicion a ${asset} solo como ejercicio educativo.`,
      'Revisar escenarios alternativos antes de asumir que un camino es mas probable.',
      'Considerar riesgos de liquidez, volatilidad y horizonte temporal.',
      'No tomar esto como instruccion ni como prediccion.',
    ];
  }

  private generateAnalysisPoints(agents: AgentSnapshot[]): string[] {
    return agents.map(
      (agent) => `${agent.name}: ${agent.output.pressureLabel} (${Math.round(agent.output.confidence * 100)}% confidence)`,
    );
  }

  private generateConsiderations(risks: RiskItem[]): string[] {
    return [
      'Solo simulacion educativa.',
      'Los datos son locales/offline y no usan precios reales.',
      ...risks.slice(0, 3).map((risk) => `${risk.level}: ${risk.mitigation}`),
    ];
  }
}
