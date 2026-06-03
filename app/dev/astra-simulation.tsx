import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SimulationEngine } from '../../src/astra/simulation';
import type { SimulationResult } from '../../src/astra/simulation';

const EXAMPLE_SCENARIOS = [
  'BTC cae 30%',
  'SOL sube 200%',
  'Portafolio en alta volatilidad',
  'Proyecto QVEX crece rapido',
];

const SAFE_MARKET_CONTEXT = {
  btcCurrentPrice: 67_000,
  fearGreedIndex: 62,
  marketTrend: 'bullish' as const,
  btcDominance: 52,
  isSimulated: true,
  sourceLabel: 'dev_sandbox_simulated_context',
};

function SafetyBanner() {
  return (
    <View style={styles.safetyBanner}>
      <Text style={styles.safetyTitle}>Simulacion educativa</Text>
      <Text style={styles.safetyText}>No es asesoria financiera.</Text>
      <Text style={styles.safetyText}>No es predicción.</Text>
      <Text style={styles.safetyText}>No usa datos en tiempo real.</Text>
      <Text style={styles.safetyText}>No ejecuta operaciones.</Text>
    </View>
  );
}

function ResultSection({ result }: { result: SimulationResult }) {
  return (
    <View style={styles.resultCard}>
      <Text style={styles.sectionTitle}>Resultado local/offline</Text>
      <Text style={styles.summary}>{result.summary}</Text>
      <Text style={styles.contextLabel}>{result.contextLabel}</Text>

      <Text style={styles.sectionTitle}>Agentes simulados</Text>
      {result.agents.map((agent) => (
        <View key={`${agent.role}-${agent.name}`} style={styles.agentRow}>
          <Text style={styles.agentName}>{agent.name}</Text>
          <Text style={styles.agentMeta}>
            {agent.role} · {agent.output.pressureLabel} · {Math.round(agent.output.confidence * 100)}%
          </Text>
          <Text style={styles.agentText}>{agent.output.keyArgument}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Puntos de analisis</Text>
      {result.analysisPoints.map((point) => (
        <Text key={point} style={styles.bulletText}>- {point}</Text>
      ))}

      <Text style={styles.sectionTitle}>Notas educativas</Text>
      {result.educationalNotes.map((note) => (
        <Text key={note} style={styles.bulletText}>- {note}</Text>
      ))}

      <Text style={styles.sectionTitle}>Consideraciones</Text>
      {result.considerations.map((consideration) => (
        <Text key={consideration} style={styles.bulletText}>- {consideration}</Text>
      ))}

      <Text style={styles.sectionTitle}>Referencias simuladas</Text>
      <View style={styles.scenarioGrid}>
        {Object.values(result.scenarios).map((scenario) => (
          <View key={scenario.label} style={styles.scenarioCard}>
            <Text style={styles.scenarioLabel}>{scenario.label}</Text>
            <Text style={styles.scenarioText}>
              Probabilidad modelo: {Math.round(scenario.probability * 100)}%
            </Text>
            <Text style={styles.scenarioText}>
              Referencia simulada: {scenario.simulatedPriceReference?.toLocaleString('es-PE') ?? 'N/A'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AstraSimulationDevRoute() {
  const engine = useMemo(
    () => new SimulationEngine({ market: SAFE_MARKET_CONTEXT }),
    [],
  );
  const [query, setQuery] = useState(EXAMPLE_SCENARIOS[0]);
  const [result, setResult] = useState<SimulationResult | null>(null);

  if (!__DEV__) {
    return (
      <View style={styles.unavailableContainer}>
        <Text style={styles.unavailableText}>Simulation sandbox no disponible</Text>
      </View>
    );
  }

  const runSimulation = (nextQuery = query) => {
    setQuery(nextQuery);
    setResult(engine.run(nextQuery));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.badge}>Dev-only sandbox</Text>
        <Text style={styles.title}>Astra Simulation Engine</Text>
        <Text style={styles.subtitle}>
          Sandbox interno para QA tecnico. No esta montado en Home ni produccion.
        </Text>
      </View>

      <SafetyBanner />

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Escenario</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
        <View style={styles.exampleGrid}>
          {EXAMPLE_SCENARIOS.map((scenario) => (
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
          <Text style={styles.primaryButtonText}>Ejecutar simulacion local</Text>
        </Pressable>
      </View>

      {result ? (
        <ResultSection result={result} />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sin simulacion ejecutada</Text>
          <Text style={styles.emptyText}>
            Elige un escenario o escribe uno propio. Nada se ejecuta automaticamente.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  agentMeta: {
    color: '#67E8F9',
    fontSize: 12,
    marginTop: 4,
  },
  agentName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  agentRow: {
    backgroundColor: 'rgba(15, 23, 42, 0.86)',
    borderColor: 'rgba(103, 232, 249, 0.14)',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  agentText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
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
  bulletText: {
    color: '#D8F3FF',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  card: {
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
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
    marginTop: 12,
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
  resultCard: {
    backgroundColor: 'rgba(8, 13, 23, 0.92)',
    borderColor: 'rgba(0, 229, 255, 0.16)',
    borderRadius: 26,
    borderWidth: 1,
    padding: 16,
  },
  safetyBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.32)',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  safetyText: {
    color: '#FDE68A',
    fontSize: 13,
    lineHeight: 20,
  },
  safetyTitle: {
    color: '#FEF3C7',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 6,
  },
  scenarioCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderColor: 'rgba(148, 163, 184, 0.14)',
    borderRadius: 16,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 140,
    padding: 12,
  },
  scenarioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  scenarioLabel: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scenarioText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 16,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
  },
  summary: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
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
