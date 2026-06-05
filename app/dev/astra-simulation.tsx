import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SimulationEngine } from '../../src/astra/simulation';
import { QVEX_RUNTIME_MODE } from '../../src/config/runtimeMode';
import type {
  AgentSnapshot,
  RiskLevel,
  ScenarioLabel,
  SimulationPressureLabel,
  SimulationResult,
} from '../../src/astra/simulation';

type SimulationCategoryId = 'cripto' | 'portafolio' | 'qvex' | 'macro' | 'social' | 'riesgo';

interface SimulationCategory {
  id: SimulationCategoryId;
  label: string;
  subtitle: string;
  examples: string[];
}

interface ImpactMetric {
  id: string;
  label: string;
  value: number;
  tint: string;
}

const SIMULATION_CATEGORIES: SimulationCategory[] = [
  {
    id: 'cripto',
    label: 'Cripto',
    subtitle: 'Caidas, rebotes y movimientos amplios de mercado.',
    examples: ['BTC cae 30%', 'SOL sube 200%', 'Memecoin en alta volatilidad'],
  },
  {
    id: 'portafolio',
    label: 'Portafolio',
    subtitle: 'Sensibilidad de cartera y concentracion de riesgo.',
    examples: [
      'Portafolio en alta volatilidad',
      'Mi cartera cae 25% en una semana',
      'Exposicion alta a cripto de riesgo',
    ],
  },
  {
    id: 'qvex',
    label: 'QVEX',
    subtitle: 'Escenarios de crecimiento, adopcion y tension operativa.',
    examples: [
      'Proyecto QVEX crece rapido',
      'QVEX llega a 1 millon de usuarios',
      'QVEX enfrenta tension operativa',
    ],
  },
  {
    id: 'macro',
    label: 'Macro',
    subtitle: 'Tasas, inflacion y cambios globales de contexto.',
    examples: [
      'Inflacion alta y tasas elevadas',
      'Dolar fuerte presiona mercados',
      'Mercado global entra en aversion al riesgo',
    ],
  },
  {
    id: 'social',
    label: 'Social',
    subtitle: 'Sentimiento, narrativa y dinamica de comunidad.',
    examples: [
      'Sentimiento social negativo en cripto',
      'FOMO social impulsa QVEX',
      'Narrativa viral aumenta las menciones',
    ],
  },
  {
    id: 'riesgo',
    label: 'Riesgo',
    subtitle: 'Liquidez, operacion y deterioro de confianza.',
    examples: [
      'Riesgo operativo en exchange',
      'Caida de liquidez en mercado',
      'Aumento de incertidumbre operativa',
    ],
  },
];

const SAFE_MARKET_CONTEXT = {
  btcCurrentPrice: 67_000,
  fearGreedIndex: 62,
  marketTrend: 'bullish' as const,
  btcDominance: 52,
  isSimulated: true,
  sourceLabel: 'dev_sandbox_simulated_context',
};

const SCENARIO_ACCENT: Record<ScenarioLabel, string> = {
  optimist: '#22C55E',
  base: '#00E5FF',
  stress: '#F97316',
};

const RISK_LEVEL_SCORE: Record<RiskLevel, number> = {
  low: 20,
  medium: 48,
  high: 72,
  critical: 88,
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function translatePressure(label: SimulationPressureLabel) {
  switch (label) {
    case 'bullish_pressure':
      return 'Presion alcista';
    case 'bearish_pressure':
      return 'Presion bajista';
    case 'neutral_pressure':
      return 'Neutral';
    case 'risk_alert':
      return 'Alerta de riesgo';
    default:
      return 'Neutral';
  }
}

function translateScenarioLabel(label: ScenarioLabel) {
  switch (label) {
    case 'optimist':
      return 'Optimista';
    case 'base':
      return 'Base';
    case 'stress':
      return 'Estr\u00e9s';
    default:
      return 'Base';
  }
}

function getScenarioDescription(label: ScenarioLabel) {
  switch (label) {
    case 'optimist':
      return 'Mejora parcial del contexto ficticio.';
    case 'base':
      return 'Escenario central del modelo local.';
    case 'stress':
      return 'Mayor tension de riesgo y liquidez.';
    default:
      return 'Escenario educativo.';
  }
}

function getCategoryTone(category: SimulationCategoryId) {
  switch (category) {
    case 'cripto':
      return 'movimiento amplio en activos digitales';
    case 'portafolio':
      return 'portafolio sensible a volatilidad';
    case 'qvex':
      return 'crecimiento acelerado de negocio QVEX';
    case 'macro':
      return 'presion macroeconomica sobre el contexto';
    case 'social':
      return 'ola de sentimiento y narrativa social';
    case 'riesgo':
      return 'tension operativa y de liquidez';
    default:
      return 'escenario educativo';
  }
}

function getEducationalRecommendation(category: SimulationCategoryId) {
  switch (category) {
    case 'cripto':
      return 'Recomendacion educativa: revisar exposicion y comparar escenarios antes de interpretar el contexto.';
    case 'portafolio':
      return 'Recomendacion educativa: evaluar concentracion y equilibrio del portafolio con datos ficticios.';
    case 'qvex':
      return 'Recomendacion educativa: revisar capacidad operativa y ritmo de crecimiento antes de extrapolar resultados.';
    case 'macro':
      return 'Recomendacion educativa: analizar escenarios macro sin asumir que uno sea definitivo.';
    case 'social':
      return 'Recomendacion educativa: evaluar el peso del sentimiento social sin tomarlo como instruccion.';
    case 'riesgo':
      return 'Recomendacion educativa: priorizar lectura de riesgos y tolerancia operativa antes de sacar conclusiones.';
    default:
      return 'Recomendacion educativa: revisar escenarios y considerar riesgos.';
  }
}

function buildAgentSummary(agent: AgentSnapshot) {
  switch (agent.role) {
    case 'bull':
      return 'Ve margen de absorcion si mejora la liquidez ficticia.';
    case 'bear':
      return 'Detecta presion bajista si aumenta el deterioro del contexto.';
    case 'neutral':
      return 'Plantea revisar varios caminos antes de concluir.';
    case 'risk':
      return 'Prioriza exposicion, sensibilidad y control de riesgo.';
    case 'market':
      return 'Resume el pulso simulado de volatilidad y confianza.';
    default:
      return 'Lectura educativa del escenario actual.';
  }
}

function buildSummary(category: SimulationCategoryId, result: SimulationResult) {
  const dominantScenario = Object.values(result.scenarios).sort(
    (left, right) => right.probability - left.probability,
  )[0];
  const dominantPressure = result.agents
    .slice()
    .sort((left, right) => right.output.confidence - left.output.confidence)[0]?.output.pressureLabel;

  return (
    `Escenario de ${getCategoryTone(category)}. ` +
    `El modelo local favorece ${translateScenarioLabel(dominantScenario.label).toLowerCase()} ` +
    `con ${Math.round(dominantScenario.probability * 100)}% y lectura ${translatePressure(
      dominantPressure ?? 'neutral_pressure',
    ).toLowerCase()}.`
  );
}

function buildKeyPoints(result: SimulationResult) {
  const scenarios = Object.values(result.scenarios).sort(
    (left, right) => right.probability - left.probability,
  );
  const averageConfidence =
    result.agents.reduce((sum, agent) => sum + agent.output.confidence, 0) / result.agents.length;
  const stressScenario = result.scenarios.stress;

  return [
    `${translateScenarioLabel(scenarios[0].label)} concentra ${Math.round(
      scenarios[0].probability * 100,
    )}% del peso del modelo.`,
    `Confianza promedio de agentes: ${clampPercent(averageConfidence * 100)}%.`,
    `Referencia de estres simulada: ${
      stressScenario.simulatedPriceReference?.toLocaleString('es-PE') ?? 'sin referencia numerica'
    }.`,
  ];
}

function buildRiskBullets(result: SimulationResult) {
  const scenarios = Object.values(result.scenarios);
  const volatility = clampPercent(
    Math.max(...scenarios.map((scenario) => Math.abs(scenario.priceChange))) * 2,
  );
  const riskScore = result.risks.length
    ? Math.max(...result.risks.map((risk) => RISK_LEVEL_SCORE[risk.level]))
    : 40;

  return [
    `Riesgo dominante estimado: ${riskScore}% en el contexto ficticio.`,
    `Volatilidad simulada: ${volatility}% con sensibilidad a liquidez.`,
    'La confianza del modelo depende de supuestos locales y datos ficticios.',
  ];
}

function buildImpactMetrics(result: SimulationResult): ImpactMetric[] {
  const scenarios = Object.values(result.scenarios);
  const averageConfidence =
    result.agents.reduce((sum, agent) => sum + agent.output.confidence, 0) / result.agents.length;
  const riskValue = result.risks.length
    ? Math.max(...result.risks.map((risk) => RISK_LEVEL_SCORE[risk.level]))
    : 40;
  const volatilityValue = clampPercent(
    Math.max(...scenarios.map((scenario) => Math.abs(scenario.priceChange))) * 2.4,
  );
  const confidenceValue = clampPercent(averageConfidence * 100);
  const liquidityValue = clampPercent(
    100 -
      Math.max(20, Math.abs(result.scenarios.stress.priceChange) * 1.5) +
      result.scenarios.base.probability * 18,
  );

  return [
    { id: 'risk', label: 'Riesgo', value: riskValue, tint: '#F97316' },
    { id: 'volatility', label: 'Volatilidad', value: volatilityValue, tint: '#FACC15' },
    { id: 'confidence', label: 'Confianza', value: confidenceValue, tint: '#00E5FF' },
    { id: 'liquidity', label: 'Liquidez', value: liquidityValue, tint: '#22C55E' },
  ];
}

function SafetyBanner() {
  return (
    <View style={styles.safetyBanner}>
      <Text style={styles.safetyTitle}>
        Simulacion local con datos ficticios. No es asesoria financiera.
      </Text>
    </View>
  );
}

function CategoryTabs({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: SimulationCategoryId;
  onSelectCategory: (category: SimulationCategory) => void;
}) {
  return (
    <View style={styles.tabsWrap}>
      {SIMULATION_CATEGORIES.map((category) => {
        const active = category.id === selectedCategory;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelectCategory(category)}
            style={[styles.tabChip, active && styles.tabChipActive]}
          >
            <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ScenarioChart({ result }: { result: SimulationResult }) {
  const scenarioList = [
    result.scenarios.optimist,
    result.scenarios.base,
    result.scenarios.stress,
  ];

  return (
    <View style={styles.chartCard}>
      <Text style={styles.cardTitle}>Grafico principal de escenarios</Text>
      {scenarioList.map((scenario) => (
        <View key={scenario.label} style={styles.chartRow}>
          <View style={styles.chartLabelRow}>
            <Text style={styles.chartLabel}>{translateScenarioLabel(scenario.label)}</Text>
            <Text style={styles.chartPercent}>{Math.round(scenario.probability * 100)}%</Text>
          </View>
          <View style={styles.chartTrack}>
            <View
              style={[
                styles.chartBar,
                {
                  width: `${clampPercent(scenario.probability * 100)}%`,
                  backgroundColor: SCENARIO_ACCENT[scenario.label],
                },
              ]}
            />
          </View>
          <Text style={styles.chartDescription}>{getScenarioDescription(scenario.label)}</Text>
        </View>
      ))}
    </View>
  );
}

function ImpactCard({ metrics }: { metrics: ImpactMetric[] }) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.cardTitle}>Impacto estimado</Text>
      {metrics.map((metric) => (
        <View key={metric.id} style={styles.metricRow}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}%</Text>
          </View>
          <View style={styles.metricTrack}>
            <View
              style={[
                styles.metricBar,
                {
                  width: `${metric.value}%`,
                  backgroundColor: metric.tint,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function AgentsGrid({ agents }: { agents: AgentSnapshot[] }) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.cardTitle}>Agentes simulados</Text>
      <View style={styles.agentGrid}>
        {agents.map((agent) => {
          const confidence = clampPercent(agent.output.confidence * 100);

          return (
            <View key={`${agent.role}-${agent.name}`} style={styles.agentCard}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentPosture}>{translatePressure(agent.output.pressureLabel)}</Text>
              <View style={styles.agentConfidenceRow}>
                <Text style={styles.agentConfidenceLabel}>Confianza</Text>
                <Text style={styles.agentConfidenceValue}>{confidence}%</Text>
              </View>
              <View style={styles.agentConfidenceTrack}>
                <View style={[styles.agentConfidenceBar, { width: `${confidence}%` }]} />
              </View>
              <Text numberOfLines={1} style={styles.agentSummary}>
                {buildAgentSummary(agent)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ResultSection({
  result,
  category,
}: {
  result: SimulationResult;
  category: SimulationCategoryId;
}) {
  const impactMetrics = buildImpactMetrics(result);
  const keyPoints = buildKeyPoints(result);
  const riskBullets = buildRiskBullets(result);
  const summary = buildSummary(category, result);

  return (
    <View style={styles.resultWrap}>
      <View style={styles.resultCard}>
        <Text style={styles.cardTitle}>Resultado resumido</Text>
        <Text style={styles.summaryText} numberOfLines={2}>
          {summary}
        </Text>
        <Text style={styles.contextLabel}>Contexto local con datos ficticios. Sin precios reales.</Text>

        <Text style={styles.miniSectionTitle}>3 puntos clave</Text>
        {keyPoints.map((point) => (
          <Text key={point} style={styles.listBullet}>
            - {point}
          </Text>
        ))}

        <Text style={styles.miniSectionTitle}>3 riesgos</Text>
        {riskBullets.map((risk) => (
          <Text key={risk} style={styles.listBullet}>
            - {risk}
          </Text>
        ))}

        <Text style={styles.miniSectionTitle}>Recomendacion educativa</Text>
        <Text style={styles.recommendation}>{getEducationalRecommendation(category)}</Text>
      </View>

      <ScenarioChart result={result} />
      <ImpactCard metrics={impactMetrics} />
      <AgentsGrid agents={result.agents} />
    </View>
  );
}

export default function AstraSimulationDevRoute() {
  const initialCategory = SIMULATION_CATEGORIES[0];
  const engine = useMemo(() => new SimulationEngine({ market: SAFE_MARKET_CONTEXT }), []);
  const [selectedCategory, setSelectedCategory] = useState<SimulationCategoryId>(initialCategory.id);
  const [query, setQuery] = useState(initialCategory.examples[0]);
  const [result, setResult] = useState<SimulationResult | null>(() =>
    new SimulationEngine({ market: SAFE_MARKET_CONTEXT }).run(initialCategory.examples[0]),
  );
  const simulationAccessEnabled = __DEV__ || QVEX_RUNTIME_MODE.enableAstraSimulationAccess;

  if (!simulationAccessEnabled) {
    return (
      <View style={styles.unavailableContainer}>
        <Text style={styles.unavailableText}>Sandbox de simulacion no disponible</Text>
      </View>
    );
  }

  const currentCategory =
    SIMULATION_CATEGORIES.find((category) => category.id === selectedCategory) ?? initialCategory;

  const runSimulation = (nextQuery = query) => {
    setQuery(nextQuery);
    setResult(engine.run(nextQuery));
  };

  const handleSelectCategory = (category: SimulationCategory) => {
    setSelectedCategory(category.id);
    setQuery(category.examples[0]);
    setResult(engine.run(category.examples[0]));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.badge}>{__DEV__ ? 'Sandbox interno' : 'Sandbox controlado'}</Text>
        <Text style={styles.title}>Panel de Simulacion ASTRA</Text>
        <Text style={styles.subtitle}>
          Simulaciones multi-escenario con datos ficticios para cripto, portafolio, QVEX, macro,
          social y riesgo operativo.
        </Text>
      </View>

      <SafetyBanner />

      <View style={styles.selectorCard}>
        <Text style={styles.cardTitle}>Selector de tipo de simulacion</Text>
        <CategoryTabs selectedCategory={selectedCategory} onSelectCategory={handleSelectCategory} />
        <Text style={styles.categorySubtitle}>{currentCategory.subtitle}</Text>

        <Text style={styles.miniSectionTitle}>Escenario editable</Text>
        <TextInput value={query} onChangeText={setQuery} style={styles.input} />

        <View style={styles.exampleGrid}>
          {currentCategory.examples.map((scenario) => (
            <Pressable
              key={scenario}
              onPress={() => runSimulation(scenario)}
              style={styles.exampleButton}
            >
              <Text style={styles.exampleText}>{scenario}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => runSimulation()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Actualizar simulacion local</Text>
        </Pressable>
      </View>

      {result ? (
        <ResultSection result={result} category={selectedCategory} />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sin simulacion activa</Text>
          <Text style={styles.emptyText}>
            Elige un tipo de simulacion y usa ejemplos locales para poblar el panel.
          </Text>
        </View>
      )}

      <View style={styles.footerNotice}>
        <Text style={styles.footerNoticeText}>
          No usa precios reales. No ejecuta operaciones. No conecta wallet.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  agentCard: {
    backgroundColor: 'rgba(8, 13, 23, 0.96)',
    borderColor: 'rgba(103, 232, 249, 0.12)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    minWidth: 145,
    padding: 14,
  },
  agentConfidenceBar: {
    backgroundColor: '#00E5FF',
    borderRadius: 999,
    height: 6,
  },
  agentConfidenceLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  agentConfidenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  agentConfidenceTrack: {
    backgroundColor: 'rgba(148, 163, 184, 0.16)',
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
  },
  agentConfidenceValue: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
  },
  agentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  agentName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },
  agentPosture: {
    color: '#67E8F9',
    fontSize: 12,
    fontWeight: '700',
  },
  agentSummary: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderColor: 'rgba(0, 229, 255, 0.34)',
    borderRadius: 999,
    borderWidth: 1,
    color: '#67E8F9',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  categorySubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  chartBar: {
    borderRadius: 999,
    height: '100%',
  },
  chartCard: {
    backgroundColor: 'rgba(8, 13, 23, 0.92)',
    borderColor: 'rgba(0, 229, 255, 0.16)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  chartDescription: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  chartLabel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  chartLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartPercent: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
  },
  chartRow: {
    marginTop: 14,
  },
  chartTrack: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderRadius: 999,
    height: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  container: {
    backgroundColor: '#05070A',
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 48,
  },
  contextLabel: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 24,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  exampleButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(0, 229, 255, 0.18)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  exampleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  exampleText: {
    color: '#E0F2FE',
    fontSize: 12,
    fontWeight: '700',
  },
  footerNotice: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    borderColor: 'rgba(148, 163, 184, 0.16)',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  footerNoticeText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  header: {
    gap: 10,
    paddingTop: 12,
  },
  input: {
    backgroundColor: '#020617',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    color: '#F8FAFC',
    fontSize: 15,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  listBullet: {
    color: '#D8F3FF',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  metricBar: {
    borderRadius: 999,
    height: '100%',
  },
  metricHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  metricRow: {
    marginTop: 14,
  },
  metricTrack: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderRadius: 999,
    height: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  metricValue: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
  },
  miniSectionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#00E5FF',
    borderRadius: 16,
    marginTop: 14,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: '#031014',
    fontSize: 14,
    fontWeight: '900',
  },
  recommendation: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  resultCard: {
    backgroundColor: 'rgba(8, 13, 23, 0.92)',
    borderColor: 'rgba(0, 229, 255, 0.16)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  resultWrap: {
    gap: 16,
  },
  safetyBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.32)',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  safetyTitle: {
    color: '#FEF3C7',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  selectorCard: {
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  tabChip: {
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderColor: 'rgba(148, 163, 184, 0.14)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabChipActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.14)',
    borderColor: 'rgba(0, 229, 255, 0.34)',
  },
  tabChipText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
  },
  tabChipTextActive: {
    color: '#67E8F9',
  },
  tabsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  unavailableContainer: {
    alignItems: 'center',
    backgroundColor: '#05070A',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  unavailableText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
