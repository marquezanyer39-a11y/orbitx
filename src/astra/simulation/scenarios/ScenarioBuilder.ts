import type {
  AgentSnapshot,
  CausalGraph,
  ParsedQuery,
  Scenario,
  ScenarioLabel,
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

interface ScenarioBlueprint {
  probabilities: Record<ScenarioLabel, number>;
  priceChange: Record<ScenarioLabel, number>;
  timeframe: Record<ScenarioLabel, string>;
  narrative: Record<ScenarioLabel, string>;
  keyRisks: Record<ScenarioLabel, string[]>;
  triggers: Record<ScenarioLabel, string[]>;
  technicalLevels?: Partial<
    Record<ScenarioLabel, { support?: number; resistance?: number }>
  >;
}

const REFERENCE_MULTIPLIERS: Record<ScenarioLabel, number> = {
  optimist: 1.08,
  base: 0.98,
  stress: 0.84,
};

export const DEFAULT_MARKET_CONTEXT: MarketContext = {
  btcCurrentPrice: 67_000,
  fearGreedIndex: 62,
  marketTrend: 'bullish',
  btcDominance: 52,
  isSimulated: true,
  sourceLabel: 'simulated_context',
};

function resolveReferenceAnchor(query: ParsedQuery, market: MarketContext) {
  return query.amount ?? query.simulatedCurrentBtcPrice ?? market.btcCurrentPrice;
}

function buildScenarioTriple(
  blueprint: ScenarioBlueprint,
  referenceAnchor: number,
): ScenarioTriple {
  const createScenario = (label: ScenarioLabel): Scenario => {
    const technicalLevels = blueprint.technicalLevels?.[label];

    return {
      label,
      probability: blueprint.probabilities[label],
      priceChange: blueprint.priceChange[label],
      simulatedPriceReference: Math.round(referenceAnchor * REFERENCE_MULTIPLIERS[label]),
      timeframe: blueprint.timeframe[label],
      narrative: blueprint.narrative[label],
      keyRisks: blueprint.keyRisks[label],
      triggers: blueprint.triggers[label],
      technicalLevels,
    };
  };

  return {
    optimist: createScenario('optimist'),
    base: createScenario('base'),
    stress: createScenario('stress'),
  };
}

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
      case 'sol_exposure':
        return ScenarioBuilder.buildSolExposure(query, market);
      case 'memecoin_launch':
        return ScenarioBuilder.buildMemecoinLaunch(query, market);
      case 'portfolio_stress':
        return ScenarioBuilder.buildPortfolioStress(query, graph, market);
      case 'exchange_growth':
        return ScenarioBuilder.buildExchangeGrowth(query, market);
      case 'qvex_growth':
        return ScenarioBuilder.buildQvexGrowth(query, market);
      case 'qvex_operational_stress':
        return ScenarioBuilder.buildQvexOperationalStress(query, market);
      case 'macro_pressure':
        return ScenarioBuilder.buildMacroPressure(query, market);
      case 'social_sentiment_shift':
        return ScenarioBuilder.buildSocialSentimentShift(query, market);
      case 'operational_risk':
        return ScenarioBuilder.buildOperationalRisk(query, market);
      case 'liquidity_stress':
        return ScenarioBuilder.buildLiquidityStress(query, market);
      default:
        return ScenarioBuilder.buildGeneric(graph, market);
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
      timeframe: '1-3 meses',
      narrative:
        `Escenario educativo: despues de una caida simulada de ${dropPct}% puede aparecer ` +
        `una absorcion parcial de liquidez cerca de ${references.optimistReference.toFixed(0)}.`,
      keyRisks: [
        'La recuperacion pierde fuerza si la liquidez sigue debil',
        'Un shock macro modifica los supuestos del modelo local',
        'El sentimiento simulado puede no reflejar el mercado real',
      ],
      triggers: [
        'Mejora de liquidez en el contexto ficticio',
        'Menor presion de liquidaciones en el modelo',
        'Sentimiento local acercandose a neutral',
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
      timeframe: '3-6 meses',
      narrative:
        `Educational scenario: el estres simulado alcanza ${references.stressReference.toFixed(0)} ` +
        `y entra en una fase de revision lateral. Contexto de liquidaciones: ${liquidationContext}. ` +
        `Indice simulado de sentimiento: ${projectedFearGreed}.`,
      keyRisks: [
        `El contexto de liquidaciones sigue ${liquidationContext}`,
        'La presion cruzada entre activos amplifica la incertidumbre',
        'La liquidez asumida por el modelo puede ser insuficiente',
      ],
      triggers: [
        'Estabilizacion gradual en el modelo local',
        'Menor lectura de estres en varias ventanas',
        'Sentimiento simulado retornando a neutral',
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
      timeframe: '6-18 meses',
      narrative:
        `Escenario de estres educativo: la referencia simulada ${references.stressReference.toFixed(0)} ` +
        `no logra estabilizarse y se extiende hacia ${references.extendedStressReference.toFixed(0)}.`,
      keyRisks: [
        'Persistencia de tension en sentimiento y liquidez',
        `El contexto de liquidaciones permanece ${liquidationContext}`,
        'Menor liquidez en mercados simulados',
        'Shock regulatorio o macro dentro de los supuestos del escenario',
      ],
      triggers: [
        'Deterioro de liquidez en el modelo',
        'Lecturas prolongadas de miedo simulado',
        'Shock de aversion al riesgo dentro del escenario',
      ],
      technicalLevels: {
        support: references.extendedStressReference * 0.9,
        resistance: references.stressReference,
      },
    };

    return { optimist, base, stress };
  }

  private static buildSolExposure(query: ParsedQuery, market: MarketContext): ScenarioTriple {
    const asset = query.asset ?? 'SOL';
    const referenceAnchor = resolveReferenceAnchor(query, market);

    return buildScenarioTriple(
      {
        probabilities: { optimist: 0.3, base: 0.5, stress: 0.2 },
        priceChange: { optimist: 18, base: -4, stress: -22 },
        timeframe: { optimist: '1-3 meses', base: '3-6 meses', stress: '6-12 meses' },
        narrative: {
          optimist:
            `Escenario educativo: ${asset} mantiene interes simulado y absorbe volatilidad sin ampliar el riesgo de cartera.`,
          base:
            `Escenario educativo: la exposicion a ${asset} se mantiene sensible a volatilidad y rotacion de liquidez.`,
          stress:
            `Escenario de estres educativo: la exposicion a ${asset} amplifica la sensibilidad del portafolio en un contexto ficticio.`,
        },
        keyRisks: {
          optimist: [
            'La liquidez simulada puede ser menos profunda de lo esperado',
            'La confianza del modelo depende de supuestos locales',
            'El rebote puede perder impulso con menor volumen ficticio',
          ],
          base: [
            'Volatilidad de altcoins por encima del escenario central',
            'Dependencia alta de sentimiento de mercado',
            'Rotacion de capital hacia activos mas defensivos',
          ],
          stress: [
            'Correccion profunda en activos de beta alta',
            'Mayor presion sobre liquidez del portafolio',
            'Sensibilidad a choques macro dentro del modelo',
          ],
        },
        triggers: {
          optimist: [
            'Mejora del tono de mercado simulado',
            'Menor presion de liquidez en altcoins',
            'Mayor confianza local del modelo',
          ],
          base: [
            'Volatilidad estable con sesgo lateral',
            'Liquidez selectiva en activos de riesgo',
            'Confianza mixta entre agentes simulados',
          ],
          stress: [
            'Salida de liquidez del segmento altcoin',
            'Mayor incertidumbre en el modelo local',
            'Aumento del riesgo agregado de cartera',
          ],
        },
      },
      referenceAnchor,
    );
  }

  private static buildMemecoinLaunch(query: ParsedQuery, market: MarketContext): ScenarioTriple {
    const referenceAnchor = resolveReferenceAnchor(query, market) * 0.35;

    return buildScenarioTriple(
      {
        probabilities: { optimist: 0.22, base: 0.43, stress: 0.35 },
        priceChange: { optimist: 34, base: -10, stress: -45 },
        timeframe: { optimist: '2-4 semanas', base: '1-3 meses', stress: '3-6 meses' },
        narrative: {
          optimist:
            'Escenario educativo: la narrativa viral impulsa traccion temporal, pero sigue siendo un contexto altamente especulativo.',
          base:
            'Escenario educativo: la atencion inicial se disipa y deja una revision mas prudente del riesgo asumido.',
          stress:
            'Escenario de estres educativo: la liquidez se seca rapido y la confianza simulada cae con fuerza.',
        },
        keyRisks: {
          optimist: [
            'El entusiasmo social puede revertirse rapido',
            'La liquidez simulada puede concentrarse en pocos participantes',
            'Alta dependencia del ruido narrativo',
          ],
          base: [
            'Permanencia limitada de usuarios interesados',
            'Volatilidad extrema por narrativa',
            'Disminucion rapida de atencion y confianza',
          ],
          stress: [
            'Caida abrupta de liquidez en el escenario',
            'Deterioro de confianza por fatiga social',
            'Mayor dispersion de resultados entre agentes simulados',
          ],
        },
        triggers: {
          optimist: [
            'Mayor visibilidad social local',
            'Mantenimiento temporal de liquidez ficticia',
            'Interes sostenido dentro del escenario',
          ],
          base: [
            'Desaceleracion natural del impulso social',
            'Reevaluacion del riesgo por agentes',
            'Liquidez menos estable con el tiempo',
          ],
          stress: [
            'Narrativa negativa dominante',
            'Retiro rapido de liquidez simulada',
            'Fuerte aumento de incertidumbre local',
          ],
        },
      },
      referenceAnchor,
    );
  }

  private static buildPortfolioStress(
    _query: ParsedQuery,
    graph: CausalGraph,
    market: MarketContext,
  ): ScenarioTriple {
    const sentiment = graphSentiment(graph);
    const referenceAnchor = market.btcCurrentPrice * 0.72;

    return buildScenarioTriple(
      {
        probabilities: { optimist: 0.24, base: 0.52, stress: 0.24 },
        priceChange: {
          optimist: 12,
          base: sentiment > 0 ? -6 : -12,
          stress: -26,
        },
        timeframe: { optimist: '1-3 meses', base: '3-6 meses', stress: '6-12 meses' },
        narrative: {
          optimist:
            'Escenario educativo: el portafolio absorbe volatilidad con una mejora gradual del equilibrio entre riesgo y liquidez.',
          base:
            'Escenario educativo: la cartera sigue sensible a volatilidad y concentracion de riesgo en el contexto local.',
          stress:
            'Escenario de estres educativo: la correlacion entre activos aumenta y la presion de riesgo afecta toda la cartera.',
        },
        keyRisks: {
          optimist: [
            'El rebalanceo simulado puede no sostenerse',
            'Persisten focos de volatilidad de mercado',
            'La mejora depende de liquidez suficiente',
          ],
          base: [
            'Concentracion de riesgo en pocos activos',
            'Alta sensibilidad a cambios de contexto',
            'Liquidez desigual entre segmentos del portafolio',
          ],
          stress: [
            'Caida sincronizada de activos de riesgo',
            'Deterioro acelerado de liquidez y confianza',
            'Horizonte temporal presionado por volatilidad persistente',
          ],
        },
        triggers: {
          optimist: [
            'Mejor reparto simulado del riesgo',
            'Recuperacion moderada de confianza',
            'Liquidez local menos tensionada',
          ],
          base: [
            'Volatilidad alta pero estable',
            'Sentimiento mixto en agentes simulados',
            'Necesidad de revisar concentracion de activos',
          ],
          stress: [
            'Shock agregado de volatilidad',
            'Correlacion alta entre posiciones',
            'Mayor incertidumbre de liquidez',
          ],
        },
      },
      referenceAnchor,
    );
  }

  private static buildExchangeGrowth(_query: ParsedQuery, market: MarketContext): ScenarioTriple {
    const referenceAnchor = market.btcCurrentPrice * 1.04;

    return buildScenarioTriple(
      {
        probabilities: { optimist: 0.31, base: 0.49, stress: 0.2 },
        priceChange: { optimist: 20, base: 8, stress: -14 },
        timeframe: { optimist: '3-6 meses', base: '6-12 meses', stress: '6-12 meses' },
        narrative: {
          optimist:
            'Escenario educativo: la plataforma sostiene crecimiento con demanda estable y buena capacidad operativa simulada.',
          base:
            'Escenario educativo: el crecimiento existe, pero exige disciplina operativa y gestion de liquidez en el modelo.',
          stress:
            'Escenario de estres educativo: la expansion acelera la complejidad operativa y reduce el margen de maniobra.',
        },
        keyRisks: {
          optimist: [
            'La demanda simulada puede superar el ritmo operativo esperado',
            'Dependencia de confianza sostenida en la plataforma',
            'Necesidad de liquidez operacional constante',
          ],
          base: [
            'Cuellos de botella por adopcion gradual',
            'Desfase entre crecimiento y capacidad interna',
            'Mayor sensibilidad a cambios de confianza',
          ],
          stress: [
            'Sobrecarga operativa por expansion rapida',
            'Caida de confianza si la experiencia empeora',
            'Presion de liquidez y continuidad de servicio',
          ],
        },
        triggers: {
          optimist: [
            'Mayor adopcion sin deterioro de servicio',
            'Capacidad operativa respondiendo a la demanda',
            'Confianza local sostenida en la plataforma',
          ],
          base: [
            'Crecimiento gradual con ajustes continuos',
            'Demanda estable pero exigente',
            'Necesidad de ordenar operaciones y soporte',
          ],
          stress: [
            'Aceleracion de usuarios mas alla de la capacidad',
            'Mayor friccion operativa',
            'Reduccion de confianza en escenarios exigentes',
          ],
        },
      },
      referenceAnchor,
    );
  }

  private static buildQvexGrowth(_query: ParsedQuery, market: MarketContext): ScenarioTriple {
    const referenceAnchor = market.btcCurrentPrice * 1.1;

    return buildScenarioTriple(
      {
        probabilities: { optimist: 0.34, base: 0.46, stress: 0.2 },
        priceChange: { optimist: 24, base: 10, stress: -12 },
        timeframe: { optimist: '3-6 meses', base: '6-9 meses', stress: '9-12 meses' },
        narrative: {
          optimist:
            'Escenario educativo: QVEX acelera adopcion sin comprometer experiencia ni capacidad operativa local.',
          base:
            'Escenario educativo: QVEX crece con buen ritmo, pero necesita ordenar soporte, liquidez y continuidad.',
          stress:
            'Escenario de estres educativo: el crecimiento supera la capacidad operativa y aumenta la sensibilidad del negocio.',
        },
        keyRisks: {
          optimist: [
            'El crecimiento simulado exige respuesta operativa consistente',
            'La confianza debe sostenerse con buena ejecucion',
            'La liquidez operacional sigue siendo clave',
          ],
          base: [
            'Desfase entre adopcion y capacidad del equipo',
            'Dependencia alta de confianza y continuidad',
            'Presion sobre soporte, operaciones y monitoreo',
          ],
          stress: [
            'Crecimiento demasiado rapido para la capacidad disponible',
            'Deterioro de experiencia de usuario en el modelo',
            'Riesgo de continuidad y reputacion simulada',
          ],
        },
        triggers: {
          optimist: [
            'Adopcion sostenida con operaciones ordenadas',
            'Capacidad interna escalando a tiempo',
            'Confianza positiva en el contexto local',
          ],
          base: [
            'Crecimiento relevante pero controlado',
            'Necesidad de priorizar operaciones y soporte',
            'Seguimiento continuo de capacidad y liquidez',
          ],
          stress: [
            'Picos de crecimiento mal absorbidos',
            'Mayor presion operativa en servicios clave',
            'Debilitamiento de confianza si el ritmo no se sostiene',
          ],
        },
      },
      referenceAnchor,
    );
  }

  private static buildQvexOperationalStress(
    _query: ParsedQuery,
    market: MarketContext,
  ): ScenarioTriple {
    const referenceAnchor = market.btcCurrentPrice * 0.93;

    return buildScenarioTriple(
      {
        probabilities: { optimist: 0.2, base: 0.5, stress: 0.3 },
        priceChange: { optimist: 8, base: -8, stress: -25 },
        timeframe: { optimist: '1-3 meses', base: '3-6 meses', stress: '6-9 meses' },
        narrative: {
          optimist:
            'Escenario educativo: QVEX corrige tensiones internas y recupera confianza operativa en el corto plazo.',
          base:
            'Escenario educativo: la presion operativa sigue presente y obliga a revisar continuidad, soporte y capacidad.',
          stress:
            'Escenario de estres educativo: la tension operativa erosiona confianza, continuidad y margen de respuesta.',
        },
        keyRisks: {
          optimist: [
            'La mejora depende de reaccion operativa consistente',
            'Persisten focos de presion sobre continuidad',
            'La confianza simulada sigue fragil',
          ],
          base: [
            'Capacidad operativa ajustada frente a la demanda',
            'Mayor sensibilidad a errores y demoras',
            'Confianza condicionada por la ejecucion local',
          ],
          stress: [
            'Deterioro de continuidad y soporte',
            'Perdida rapida de confianza del ecosistema',
            'Escalada de riesgo operativo y reputacional',
          ],
        },
        triggers: {
          optimist: [
            'Correccion temprana de cuellos de botella',
            'Mejora visible de continuidad operativa',
            'Recuperacion de confianza en el modelo',
          ],
          base: [
            'Presion estable sobre capacidad y soporte',
            'Necesidad de priorizar continuidad',
            'Seguimiento fino de riesgo operativo',
          ],
          stress: [
            'Demoras persistentes y errores acumulados',
            'Caida de confianza en procesos internos',
            'Mayor friccion operativa en escenarios exigentes',
          ],
        },
      },
      referenceAnchor,
    );
  }

  private static buildMacroPressure(_query: ParsedQuery, market: MarketContext): ScenarioTriple {
    const referenceAnchor = market.btcCurrentPrice * 0.95;

    return buildScenarioTriple(
      {
        probabilities: { optimist: 0.18, base: 0.54, stress: 0.28 },
        priceChange: { optimist: 6, base: -10, stress: -24 },
        timeframe: { optimist: '3-6 meses', base: '6-12 meses', stress: '6-18 meses' },
        narrative: {
          optimist:
            'Escenario educativo: la presion macro se modera y permite una estabilizacion gradual del contexto de riesgo.',
          base:
            'Escenario educativo: inflacion, tasas y dolar fuerte mantienen una presion sostenida sobre liquidez y confianza.',
          stress:
            'Escenario de estres educativo: la aversion global al riesgo acelera volatilidad y debilita el contexto local.',
        },
        keyRisks: {
          optimist: [
            'La mejora macro puede ser mas lenta de lo previsto',
            'La liquidez global sigue condicionada por tasas altas',
            'El modelo local depende de supuestos conservadores',
          ],
          base: [
            'Tasas elevadas por mas tiempo',
            'Dolar fuerte drenando apetito por riesgo',
            'Liquidez mas selectiva en mercados simulados',
          ],
          stress: [
            'Choque macro que amplifica aversion al riesgo',
            'Mayor deterioro de liquidez y confianza',
            'Presion prolongada sobre activos y crecimiento',
          ],
        },
        triggers: {
          optimist: [
            'Menor presion inflacionaria simulada',
            'Tasas dejando de subir en el modelo',
            'Confianza recuperandose en el contexto local',
          ],
          base: [
            'Dolar firme y costo de capital elevado',
            'Mercado global mas defensivo',
            'Seguimiento constante de liquidez y volatilidad',
          ],
          stress: [
            'Nueva ola de aversion al riesgo',
            'Shock simultaneo de inflacion y tasas',
            'Contraccion fuerte de liquidez en el escenario',
          ],
        },
      },
      referenceAnchor,
    );
  }

  private static buildSocialSentimentShift(
    _query: ParsedQuery,
    market: MarketContext,
  ): ScenarioTriple {
    const referenceAnchor = market.btcCurrentPrice * 1.01;

    return buildScenarioTriple(
      {
        probabilities: { optimist: 0.27, base: 0.45, stress: 0.28 },
        priceChange: { optimist: 16, base: -3, stress: -19 },
        timeframe: { optimist: '2-6 semanas', base: '1-3 meses', stress: '3-6 meses' },
        narrative: {
          optimist:
            'Escenario educativo: la narrativa social impulsa confianza temporal sin perder control del riesgo local.',
          base:
            'Escenario educativo: el sentimiento social genera ruido mixto y deja una lectura ambigua del contexto.',
          stress:
            'Escenario de estres educativo: la narrativa negativa amplifica volatilidad y deteriora confianza simulada.',
        },
        keyRisks: {
          optimist: [
            'El impulso social puede agotarse con rapidez',
            'La confianza depende de narrativa mas que de fundamentos',
            'La liquidez ficticia puede concentrarse en picos cortos',
          ],
          base: [
            'Ruido social elevando dispersion de escenarios',
            'Volatilidad adicional por menciones y narrativa',
            'Confianza cambiante entre agentes simulados',
          ],
          stress: [
            'Cambio brusco de sentimiento colectivo',
            'Mayor deterioro de confianza por ruido social',
            'Liquidez afectada por narrativa negativa persistente',
          ],
        },
        triggers: {
          optimist: [
            'Narrativa positiva sostenida por tiempo limitado',
            'Comunidad activa sin deterioro de confianza',
            'Volatilidad manejable en el modelo local',
          ],
          base: [
            'Menciones altas con lectura ambigua',
            'Alternancia entre entusiasmo y cautela',
            'Mayor necesidad de revisar el ruido social',
          ],
          stress: [
            'Narrativa viral negativa',
            'Retroceso rapido de confianza',
            'Incremento de incertidumbre por menciones adversas',
          ],
        },
      },
      referenceAnchor,
    );
  }

  private static buildOperationalRisk(_query: ParsedQuery, market: MarketContext): ScenarioTriple {
    const referenceAnchor = market.btcCurrentPrice * 0.91;

    return buildScenarioTriple(
      {
        probabilities: { optimist: 0.22, base: 0.48, stress: 0.3 },
        priceChange: { optimist: 5, base: -9, stress: -23 },
        timeframe: { optimist: '1-3 meses', base: '3-6 meses', stress: '6-12 meses' },
        narrative: {
          optimist:
            'Escenario educativo: el riesgo operativo se contiene con ajustes tempranos y mejor disciplina de continuidad.',
          base:
            'Escenario educativo: el riesgo operativo sigue presente y obliga a revisar procesos, capacidad y confianza.',
          stress:
            'Escenario de estres educativo: una cadena de fallas operativas deteriora continuidad, liquidez y reputacion.',
        },
        keyRisks: {
          optimist: [
            'Persisten fragilidades operativas de fondo',
            'La mejora depende de ejecucion consistente',
            'La confianza tarda en normalizarse',
          ],
          base: [
            'Proceso operativo sensible a errores',
            'Capacidad interna insuficiente ante picos de demanda',
            'Confianza condicionada por continuidad del servicio',
          ],
          stress: [
            'Fallas recurrentes afectando continuidad',
            'Perdida acelerada de confianza del entorno',
            'Presion simultanea sobre soporte y liquidez',
          ],
        },
        triggers: {
          optimist: [
            'Correccion temprana de debilidades',
            'Mejoras en continuidad y soporte',
            'Disminucion de friccion operativa',
          ],
          base: [
            'Necesidad de seguimiento de capacidad',
            'Revision continua de procesos criticos',
            'Tension operativa estable pero controlada',
          ],
          stress: [
            'Errores acumulados en procesos sensibles',
            'Caida de confianza en la continuidad',
            'Mayor presion por incidentes operativos',
          ],
        },
      },
      referenceAnchor,
    );
  }

  private static buildLiquidityStress(_query: ParsedQuery, market: MarketContext): ScenarioTriple {
    const referenceAnchor = market.btcCurrentPrice * 0.89;

    return buildScenarioTriple(
      {
        probabilities: { optimist: 0.16, base: 0.5, stress: 0.34 },
        priceChange: { optimist: 4, base: -11, stress: -27 },
        timeframe: { optimist: '1-2 meses', base: '3-6 meses', stress: '6-12 meses' },
        narrative: {
          optimist:
            'Escenario educativo: la liquidez mejora parcialmente y reduce la sensibilidad inmediata del sistema.',
          base:
            'Escenario educativo: la liquidez sigue ajustada y amplifica la volatilidad del contexto simulado.',
          stress:
            'Escenario de estres educativo: la caida de liquidez aumenta dispersion, volatilidad y fragilidad operativa.',
        },
        keyRisks: {
          optimist: [
            'La liquidez puede seguir fragmentada aunque mejore',
            'La volatilidad no desaparece de inmediato',
            'La confianza sigue condicionada por profundidad de mercado',
          ],
          base: [
            'Liquidez insuficiente para absorber volatilidad',
            'Mayor sensibilidad a movimientos bruscos',
            'Confianza moderada por profundidad limitada',
          ],
          stress: [
            'Desaparicion rapida de liquidez util',
            'Volatilidad extrema con baja capacidad de absorcion',
            'Mayor riesgo de continuidad y deterioro de confianza',
          ],
        },
        triggers: {
          optimist: [
            'Recuperacion parcial de profundidad simulada',
            'Menor tension sobre demanda y oferta',
            'Contexto local menos fragil',
          ],
          base: [
            'Liquidez selectiva y volatilidad alta',
            'Mercado con margen de absorcion limitado',
            'Necesidad de revisar sensibilidad al riesgo',
          ],
          stress: [
            'Nueva contraccion de liquidez',
            'Volatilidad disparada por baja profundidad',
            'Fragilidad creciente de confianza y continuidad',
          ],
        },
      },
      referenceAnchor,
    );
  }

  private static buildGeneric(graph: CausalGraph, market: MarketContext): ScenarioTriple {
    const sentiment = graphSentiment(graph);
    const referenceAnchor = market.btcCurrentPrice;

    return buildScenarioTriple(
      {
        probabilities: { optimist: 0.25, base: 0.55, stress: 0.2 },
        priceChange: {
          optimist: 20,
          base: sentiment > 0 ? 8 : -8,
          stress: -28,
        },
        timeframe: { optimist: '3-6 meses', base: '3-6 meses', stress: '6-12 meses' },
        narrative: {
          optimist: 'Escenario educativo favorable con mejora parcial del contexto local.',
          base: 'Escenario educativo central basado en los supuestos actuales del modelo.',
          stress: 'Escenario educativo adverso con mayor presion de riesgo y liquidez.',
        },
        keyRisks: {
          optimist: [
            'Incertidumbre del escenario local',
            'Liquidez simulada menos estable de lo esperado',
            'Cambios de contexto fuera de los supuestos actuales',
          ],
          base: [
            'Incertidumbre del escenario educativo',
            'Liquidez dependiente de supuestos del modelo',
            'Contexto regulatorio o macro cambiante',
          ],
          stress: [
            'Mayor incertidumbre del escenario',
            'Liquidez y confianza mas fragiles',
            'Shock adverso dentro del contexto simulado',
          ],
        },
        triggers: {
          optimist: [
            'Mejora del contexto local',
            'Menor lectura de estres',
            'Confianza simulada mas estable',
          ],
          base: [
            'Contexto mixto con sesgo prudente',
            'Liquidez sin mejora clara',
            'Necesidad de revisar varios caminos',
          ],
          stress: [
            'Deterioro del contexto local',
            'Volatilidad y liquidez mas tensionadas',
            'Mayor aversion al riesgo del modelo',
          ],
        },
      },
      referenceAnchor,
    );
  }
}
