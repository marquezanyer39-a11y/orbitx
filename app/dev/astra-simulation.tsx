import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import {
  AGENT_DISPLAY_NAMES,
  SimulationEngine,
  applyUserFeedback,
  createInitialLearningMap,
  createSimulationMemory,
  deriveCoreMetrics,
} from '../../src/astra/simulation';
import { QVEX_RUNTIME_MODE } from '../../src/config/runtimeMode';
import type {
  AgentLearningMap,
  AgentSnapshot,
  CoreSimulationMetrics,
  FeedbackType,
  ScenarioLabel,
  SimulationHistoryEntry,
  SimulationResult,
} from '../../src/astra/simulation';
import type { AgentRole } from '../../src/astra/simulation';
import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { ThemeColors } from '../../src/core/theme/theme';

type SimulationCategoryId = 'cripto' | 'portafolio' | 'qvex' | 'macro' | 'social' | 'riesgo';

interface SimulationCategory {
  id: SimulationCategoryId;
  label: string;
  subtitle: string;
  examples: string[];
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
    examples: ['Proyecto QVEX crece rapido', 'QVEX llega a 1 millon de usuarios', 'QVEX enfrenta tension operativa'],
  },
  {
    id: 'macro',
    label: 'Macro',
    subtitle: 'Tasas, inflacion y cambios globales de contexto.',
    examples: ['Inflacion alta y tasas elevadas', 'Dolar fuerte presiona mercados', 'Mercado global entra en aversion al riesgo'],
  },
  {
    id: 'social',
    label: 'Social',
    subtitle: 'Sentimiento, narrativa y dinamica de comunidad.',
    examples: ['Sentimiento social negativo en cripto', 'FOMO social impulsa QVEX', 'Narrativa viral aumenta las menciones'],
  },
  {
    id: 'riesgo',
    label: 'Riesgo',
    subtitle: 'Liquidez, operacion y deterioro de confianza.',
    examples: ['Riesgo operativo en exchange', 'Caida de liquidez en mercado', 'Aumento de incertidumbre operativa'],
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

const AGENT_TAGLINE: Record<AgentRole, string> = {
  bear: 'Ve peligro',
  bull: 'Ve rebote posible',
  risk: 'Advierte riesgo',
  neutral: 'Evalua ambos lados',
  market: 'Resume el escenario',
};

const AGENT_ICON: Record<AgentRole, keyof typeof Ionicons.glyphMap> = {
  bear: 'trending-down',
  bull: 'trending-up',
  risk: 'warning-outline',
  neutral: 'git-compare-outline',
  market: 'pulse-outline',
};

const FEEDBACK_OPTIONS: { type: FeedbackType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'useful', label: 'Util', icon: 'thumbs-up-outline' },
  { type: 'confusing', label: 'No entendi', icon: 'help-circle-outline' },
  { type: 'too_bullish', label: 'Muy optimista', icon: 'trending-up-outline' },
  { type: 'too_bearish', label: 'Muy pesimista', icon: 'trending-down-outline' },
  { type: 'too_risky', label: 'Muy riesgoso', icon: 'alert-circle-outline' },
];

const PATH_SUBTITLE: Record<ScenarioLabel, string> = {
  optimist: 'Rebote parcial',
  base: 'Mercado lateral',
  stress: 'Caida en cascada',
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function translateScenarioLabel(label: ScenarioLabel) {
  if (label === 'optimist') return 'Optimista';
  if (label === 'stress') return 'Caso critico';
  return 'Base';
}

function scenarioColor(label: ScenarioLabel, colors: ThemeColors) {
  if (label === 'optimist') return colors.profit;
  if (label === 'stress') return colors.loss;
  return colors.primary;
}

function levelWord(value: number) {
  if (value >= 75) return 'Alto';
  if (value >= 55) return 'Elevado';
  if (value >= 35) return 'Moderado';
  return 'Bajo';
}

function confidenceWord(value: number) {
  if (value >= 66) return 'Alta';
  if (value >= 40) return 'Media';
  return 'Baja';
}

function agentColor(role: AgentRole, colors: ThemeColors) {
  switch (role) {
    case 'bull':
      return colors.profit;
    case 'bear':
      return colors.loss;
    case 'risk':
      return colors.warning;
    case 'neutral':
      return colors.primary;
    default:
      return colors.textSoft;
  }
}

interface CornerNode {
  key: keyof CoreSimulationMetrics;
  label: string;
  word: string;
  color: string;
  position: 'tl' | 'tr' | 'bl' | 'br';
}

function buildCornerNodes(metrics: CoreSimulationMetrics, colors: ThemeColors): CornerNode[] {
  return [
    { key: 'risk', label: 'Riesgo', word: levelWord(metrics.risk), color: colors.loss, position: 'tl' },
    { key: 'volatility', label: 'Volatilidad', word: levelWord(metrics.volatility), color: colors.warning, position: 'tr' },
    { key: 'confidence', label: 'Confianza', word: confidenceWord(metrics.confidence), color: colors.primary, position: 'bl' },
    { key: 'liquidity', label: 'Liquidez', word: levelWord(metrics.liquidity), color: colors.profit, position: 'br' },
  ];
}

const CORNER_STYLE = {
  tl: { top: 14, left: 14 },
  tr: { top: 14, right: 14 },
  bl: { bottom: 14, left: 14 },
  br: { bottom: 14, right: 14 },
} as const;

function buildSimpleInterpretation(result: SimulationResult, metrics: CoreSimulationMetrics) {
  const items: { icon: keyof typeof Ionicons.glyphMap; text: string; tone: 'risk' | 'warning' | 'neutral' }[] = [];
  if (metrics.risk >= 60) {
    items.push({ icon: 'alert-circle-outline', text: 'Riesgo alto', tone: 'risk' });
  }
  if (metrics.volatility >= 55) {
    items.push({ icon: 'flash-outline', text: 'Mucha volatilidad', tone: 'warning' });
  }
  const bullish = result.agents.some((a) => a.output.pressureLabel === 'bullish_pressure');
  const bearish = result.agents.some((a) => a.output.pressureLabel === 'bearish_pressure');
  if (bullish && bearish) {
    items.push({ icon: 'people-outline', text: 'Agentes divididos', tone: 'neutral' });
  }
  if (metrics.confidence < 45) {
    items.push({ icon: 'help-circle-outline', text: 'Confianza baja del modelo', tone: 'neutral' });
  }
  if (!items.length) {
    items.push({ icon: 'checkmark-circle-outline', text: 'Escenario equilibrado', tone: 'neutral' });
  }
  return items;
}

function SandboxChip({ colors }: { colors: ThemeColors }) {
  return (
    <View style={[styles.sandboxChip, { backgroundColor: colors.profitSoft, borderColor: colors.profit }]}>
      <Ionicons name="shield-checkmark-outline" size={13} color={colors.profit} />
      <Text style={[styles.sandboxChipText, { color: colors.profit }]}>Educacion simulada</Text>
    </View>
  );
}

function ScenarioHero({
  result,
  metrics,
  colors,
}: {
  result: SimulationResult;
  metrics: CoreSimulationMetrics;
  colors: ThemeColors;
}) {
  const nodes = buildCornerNodes(metrics, colors);
  const isDown = /cae|baja|down|drop|panic|panico|critic|caida/i.test(result.query.raw);
  const accent = metrics.risk >= 60 ? colors.loss : colors.primary;

  return (
    <View style={[styles.mapCanvas, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Line x1="50%" y1="50%" x2="20%" y2="20%" stroke={withOpacity(colors.loss, 0.4)} strokeWidth={1.5} strokeDasharray="5 5" />
        <Line x1="50%" y1="50%" x2="80%" y2="20%" stroke={withOpacity(colors.warning, 0.4)} strokeWidth={1.5} strokeDasharray="5 5" />
        <Line x1="50%" y1="50%" x2="20%" y2="80%" stroke={withOpacity(colors.primary, 0.4)} strokeWidth={1.5} strokeDasharray="5 5" />
        <Line x1="50%" y1="50%" x2="80%" y2="80%" stroke={withOpacity(colors.profit, 0.4)} strokeWidth={1.5} strokeDasharray="5 5" />
      </Svg>

      <View
        style={[
          styles.centerNode,
          { backgroundColor: colors.background, borderColor: accent, shadowColor: accent },
        ]}
      >
        <Ionicons name={isDown ? 'trending-down' : 'trending-up'} size={28} color={accent} />
        <Text style={[styles.centerNodeText, { color: accent }]} numberOfLines={2}>
          {result.query.raw}
        </Text>
      </View>

      {nodes.map((node) => (
        <View
          key={node.key}
          style={[
            styles.cornerNode,
            CORNER_STYLE[node.position],
            { backgroundColor: colors.surfaceElevated, borderColor: withOpacity(node.color, 0.4) },
          ]}
        >
          <Text style={[styles.cornerLabel, { color: node.color }]}>{node.label}</Text>
          <Text style={[styles.cornerWord, { color: colors.text }]}>{node.word}</Text>
        </View>
      ))}
    </View>
  );
}

function ScenarioPaths({ result, colors }: { result: SimulationResult; colors: ThemeColors }) {
  const paths = [result.scenarios.optimist, result.scenarios.base, result.scenarios.stress];
  return (
    <View>
      <SectionTitle icon="git-network-outline" text="3 caminos posibles" colors={colors} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pathsRow}>
        {paths.map((path) => {
          const color = scenarioColor(path.label, colors);
          const sign = path.priceChange > 0 ? '+' : '';
          return (
            <View
              key={path.label}
              style={[styles.pathCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.pathTopBar, { backgroundColor: color }]} />
              <Text style={[styles.pathLabel, { color: colors.textMuted }]}>{translateScenarioLabel(path.label)}</Text>
              <Text style={[styles.pathChange, { color }]}>
                {sign}
                {Math.round(path.priceChange)}%
              </Text>
              <Text style={[styles.pathSubtitle, { color: colors.text }]}>{PATH_SUBTITLE[path.label]}</Text>
              <Text style={[styles.pathProb, { color: colors.textMuted }]}>
                {Math.round(path.probability * 100)}% probable
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function AgentsTeam({ agents, colors }: { agents: AgentSnapshot[]; colors: ThemeColors }) {
  return (
    <View>
      <SectionTitle icon="people-outline" text="Equipo ASTRA analiza" colors={colors} />
      <View style={styles.agentGrid}>
        {agents.map((agent) => {
          const color = agentColor(agent.role, colors);
          const confidence = clampPercent(agent.output.confidence * 100);
          return (
            <View
              key={`${agent.role}-${agent.name}`}
              style={[styles.agentCard, { backgroundColor: colors.card, borderColor: color }]}
            >
              <View style={styles.agentHeader}>
                <Ionicons name={AGENT_ICON[agent.role]} size={16} color={color} />
                <Text style={[styles.agentName, { color: colors.text }]} numberOfLines={1}>
                  {AGENT_DISPLAY_NAMES[agent.role] ?? agent.name}
                </Text>
              </View>
              <Text style={[styles.agentTagline, { color }]}>{AGENT_TAGLINE[agent.role]}</Text>
              <View style={[styles.agentTrack, { backgroundColor: colors.fieldBackground }]}>
                <View style={[styles.agentBar, { width: `${confidence}%`, backgroundColor: color }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SimpleInterpretation({
  result,
  metrics,
  colors,
}: {
  result: SimulationResult;
  metrics: CoreSimulationMetrics;
  colors: ThemeColors;
}) {
  const items = buildSimpleInterpretation(result, metrics);
  const toneColor = (tone: 'risk' | 'warning' | 'neutral') =>
    tone === 'risk' ? colors.loss : tone === 'warning' ? colors.warning : colors.textSoft;

  return (
    <View style={[styles.interpretCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <SectionTitle icon="bulb-outline" text="Interpretacion simple" colors={colors} />
      {items.map((item) => (
        <View
          key={item.text}
          style={[styles.interpretRow, { backgroundColor: colors.fieldBackground }]}
        >
          <Ionicons name={item.icon} size={16} color={toneColor(item.tone)} />
          <Text style={[styles.interpretText, { color: colors.text }]}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionTitle({
  icon,
  text,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={[styles.sectionTitleText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

function FeedbackCard({
  onFeedback,
  feedbackGiven,
  colors,
}: {
  onFeedback: (feedbackType: FeedbackType) => void;
  feedbackGiven: FeedbackType | null;
  colors: ThemeColors;
}) {
  return (
    <View style={[styles.blockCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <SectionTitle icon="construct-outline" text="Tu feedback calibra a ASTRA" colors={colors} />
      <Text style={[styles.helperText, { color: colors.textMuted }]}>
        Ajusta el simulador local. No envia datos y no es asesoria financiera.
      </Text>
      <View style={styles.feedbackRow}>
        {FEEDBACK_OPTIONS.map((option) => {
          const active = feedbackGiven === option.type;
          return (
            <Pressable
              key={option.type}
              onPress={() => onFeedback(option.type)}
              style={[
                styles.feedbackChip,
                { backgroundColor: colors.fieldBackground, borderColor: active ? colors.primary : colors.border },
              ]}
            >
              <Ionicons
                name={option.icon}
                size={13}
                color={active ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.feedbackChipText, { color: active ? colors.primary : colors.textSoft }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {feedbackGiven ? (
        <Text style={[styles.feedbackConfirm, { color: colors.profit }]}>
          Gracias. El simulador ajusto su calibracion local.
        </Text>
      ) : null}
    </View>
  );
}

function HistoryCard({
  history,
  onClear,
  colors,
}: {
  history: SimulationHistoryEntry[];
  onClear: () => void;
  colors: ThemeColors;
}) {
  if (!history.length) {
    return null;
  }
  return (
    <View style={[styles.blockCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.historyHeader}>
        <SectionTitle icon="time-outline" text="Historial local" colors={colors} />
        <Pressable onPress={onClear} style={[styles.clearButton, { backgroundColor: colors.lossSoft }]}>
          <Text style={[styles.clearButtonText, { color: colors.loss }]}>Limpiar</Text>
        </Pressable>
      </View>
      {history.slice(0, 8).map((entry) => (
        <View key={entry.id} style={[styles.historyRow, { borderTopColor: colors.border }]}>
          <Text numberOfLines={1} style={[styles.historyQuery, { color: colors.text }]}>
            {entry.rawQuery}
          </Text>
          <Text style={[styles.historyMeta, { color: colors.textMuted }]}>
            R {entry.metrics.risk} · V {entry.metrics.volatility} · C {entry.metrics.confidence}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function AstraSimulationDevRoute() {
  const { colors } = useAppTheme();
  const initialCategory = SIMULATION_CATEGORIES[0];
  const engine = useMemo(() => new SimulationEngine({ market: SAFE_MARKET_CONTEXT }), []);
  const memory = useMemo(() => createSimulationMemory(), []);
  const learningRef = useRef<AgentLearningMap>(createInitialLearningMap());

  const [selectedCategory, setSelectedCategory] = useState<SimulationCategoryId>(initialCategory.id);
  const [query, setQuery] = useState(initialCategory.examples[0]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [metrics, setMetrics] = useState<CoreSimulationMetrics | null>(null);
  const [history, setHistory] = useState<SimulationHistoryEntry[]>([]);
  const [feedbackGiven, setFeedbackGiven] = useState<FeedbackType | null>(null);

  const simulationAccessEnabled = __DEV__ || QVEX_RUNTIME_MODE.enableAstraSimulationAccess;

  const applyResult = useCallback(
    (nextQuery: string) => {
      const nextResult = engine.run(nextQuery, { learningState: learningRef.current });
      const nextMetrics = deriveCoreMetrics(nextResult);
      setResult(nextResult);
      setMetrics(nextMetrics);
      setFeedbackGiven(null);

      const entry: SimulationHistoryEntry = {
        id: nextResult.id,
        rawQuery: nextResult.query.raw,
        intent: nextResult.query.intent,
        summary: nextResult.summary,
        metrics: nextMetrics,
        createdAt: nextResult.createdAt,
      };
      void memory.saveSimulation(entry).then(setHistory);
    },
    [engine, memory],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [learning, storedHistory] = await Promise.all([
        memory.getAgentLearningState(),
        memory.getSimulationHistory(),
      ]);
      if (cancelled) {
        return;
      }
      learningRef.current = learning;
      setHistory(storedHistory);
      applyResult(initialCategory.examples[0]);
    })();
    return () => {
      cancelled = true;
    };
  }, [applyResult, initialCategory.examples, memory]);

  const handleFeedback = useCallback(
    (feedbackType: FeedbackType) => {
      if (!result) {
        return;
      }
      const nextLearning = applyUserFeedback({
        result,
        feedbackType,
        currentLearning: learningRef.current,
      });
      learningRef.current = nextLearning;
      setFeedbackGiven(feedbackType);
      void memory.saveAgentLearningState(nextLearning);
      void memory.saveFeedback({ resultId: result.id, feedbackType, createdAt: Date.now() });
    },
    [memory, result],
  );

  const handleClearHistory = useCallback(() => {
    void memory.clearSimulationHistory().then(() => setHistory([]));
  }, [memory]);

  if (!simulationAccessEnabled) {
    return (
      <View style={[styles.unavailableContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.unavailableText, { color: colors.textMuted }]}>
          Sandbox de simulacion no disponible
        </Text>
      </View>
    );
  }

  const currentCategory =
    SIMULATION_CATEGORIES.find((category) => category.id === selectedCategory) ?? initialCategory;

  const runSimulation = (nextQuery = query) => {
    setQuery(nextQuery);
    applyResult(nextQuery);
  };

  const pickAnotherScenario = () => {
    const list = currentCategory.examples;
    const currentIndex = list.indexOf(query);
    const next = list[(currentIndex + 1 + list.length) % list.length] ?? list[0];
    runSimulation(next);
  };

  const handleSelectCategory = (category: SimulationCategory) => {
    setSelectedCategory(category.id);
    setQuery(category.examples[0]);
    applyResult(category.examples[0]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <SandboxChip colors={colors} />
        <Text style={[styles.title, { color: colors.text }]}>Simulador ASTRA</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Explora escenarios y entiende que podria pasar.
        </Text>
      </View>

      <View style={[styles.selectorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.tabsWrap}>
          {SIMULATION_CATEGORIES.map((category) => {
            const active = category.id === selectedCategory;
            return (
              <Pressable
                key={category.id}
                onPress={() => handleSelectCategory(category)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: active ? colors.primarySoft : colors.fieldBackground,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.tabChipText, { color: active ? colors.primary : colors.textMuted }]}>
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Escribe un escenario..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.fieldBackground, borderColor: colors.border, color: colors.text }]}
        />

        <View style={styles.exampleGrid}>
          {currentCategory.examples.map((scenario) => (
            <Pressable
              key={scenario}
              onPress={() => runSimulation(scenario)}
              style={[styles.exampleButton, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}
            >
              <Text style={[styles.exampleText, { color: colors.textSoft }]}>{scenario}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {result && metrics ? (
        <>
          <ScenarioHero result={result} metrics={metrics} colors={colors} />
          <ScenarioPaths result={result} colors={colors} />
          <AgentsTeam agents={result.agents} colors={colors} />
          <SimpleInterpretation result={result} metrics={metrics} colors={colors} />
          <FeedbackCard onFeedback={handleFeedback} feedbackGiven={feedbackGiven} colors={colors} />
        </>
      ) : (
        <View style={[styles.emptyState, { borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin simulacion activa</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Elige un tipo y usa un ejemplo para poblar el panel.
          </Text>
        </View>
      )}

      <View style={styles.ctaStack}>
        <Pressable onPress={() => runSimulation()} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="git-compare-outline" size={16} color={colors.background} />
          <Text style={[styles.primaryButtonText, { color: colors.background }]}>Comparar escenarios</Text>
        </Pressable>
        <Pressable
          onPress={pickAnotherScenario}
          style={[styles.secondaryButton, { borderColor: colors.primary }]}
        >
          <Ionicons name="shuffle-outline" size={16} color={colors.primary} />
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Probar otro escenario</Text>
        </Pressable>
      </View>

      <HistoryCard history={history} onClear={handleClearHistory} colors={colors} />

      <View style={[styles.footerNotice, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
        <Text style={[styles.footerNoticeText, { color: colors.textMuted }]}>
          No usa precios reales. No ejecuta operaciones. No conecta wallet.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: SPACING.md,
    padding: SPACING.lg,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  sandboxChip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sandboxChipText: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 26,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  selectorCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  tabsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabChip: {
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabChipText: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  input: {
    borderRadius: RADII.md,
    borderWidth: 1,
    fontFamily: FONT.medium,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  exampleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleButton: {
    borderRadius: RADII.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  exampleText: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  mapCanvas: {
    alignItems: 'center',
    borderRadius: RADII.lg,
    borderWidth: 1,
    height: 340,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  centerNode: {
    alignItems: 'center',
    borderRadius: RADII.md,
    borderWidth: 1.5,
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 18,
    width: 176,
    zIndex: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  centerNodeText: {
    fontFamily: FONT.bold,
    fontSize: 18,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  cornerNode: {
    alignItems: 'center',
    borderRadius: RADII.sm,
    borderWidth: 1,
    gap: 2,
    minWidth: 104,
    paddingHorizontal: 10,
    paddingVertical: 10,
    position: 'absolute',
    zIndex: 10,
  },
  cornerLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  cornerWord: {
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontFamily: FONT.bold,
    fontSize: 17,
  },
  pathsRow: {
    gap: 12,
    paddingRight: 4,
  },
  pathCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    gap: 6,
    minWidth: 150,
    overflow: 'hidden',
    padding: 14,
    paddingTop: 18,
  },
  pathTopBar: {
    height: 4,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  pathLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  pathChange: {
    fontFamily: FONT.bold,
    fontSize: 24,
    letterSpacing: -0.6,
  },
  pathSubtitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  pathProb: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  agentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  agentCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    gap: 8,
    padding: 14,
    width: '47.5%',
  },
  agentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  agentName: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  agentTagline: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  agentTrack: {
    borderRadius: RADII.pill,
    height: 5,
    overflow: 'hidden',
  },
  agentBar: {
    borderRadius: RADII.pill,
    height: '100%',
  },
  interpretCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
  },
  interpretRow: {
    alignItems: 'center',
    borderRadius: RADII.pill,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  interpretText: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  blockCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
  },
  helperText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  feedbackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feedbackChip: {
    alignItems: 'center',
    borderRadius: RADII.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  feedbackChipText: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  feedbackConfirm: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    marginTop: 12,
  },
  historyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    borderRadius: RADII.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontFamily: FONT.bold,
    fontSize: 11,
  },
  historyRow: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  historyQuery: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  historyMeta: {
    fontFamily: FONT.medium,
    fontSize: 11,
    marginTop: 4,
  },
  ctaStack: {
    gap: 10,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: RADII.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  primaryButtonText: {
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: RADII.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: RADII.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 24,
  },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    textAlign: 'center',
  },
  footerNotice: {
    alignItems: 'center',
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  footerNoticeText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    textAlign: 'center',
  },
  unavailableContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  unavailableText: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    textAlign: 'center',
  },
});
