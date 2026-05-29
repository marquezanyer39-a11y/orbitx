import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';
import { AstraRiskInsightHost } from '../insights/AstraRiskInsightHost';
import { ASTRA_RISK_QA_SCENARIOS } from './astraRiskQaFixtures';
import type { AstraRiskQaScenarioId } from './astraRiskQaFixtures';
import { AstraRiskQaControls } from './AstraRiskQaControls';
import { AstraRiskQaEventPreview } from './AstraRiskQaEventPreview';
import { AstraRiskQaPipelineStatus } from './AstraRiskQaPipelineStatus';
import { AstraRiskQaRelevancePreview } from './AstraRiskQaRelevancePreview';
import { AstraRiskQaScenarioPanel } from './AstraRiskQaScenarioPanel';
import {
  ASTRA_RISK_QA_INITIAL_STATE,
  runRiskQaPipeline,
  type AstraRiskQaPipelineResult,
  type AstraRiskQaState,
} from './astraRiskQaPipeline';

export function AstraRiskQaSandbox() {
  const [scenarioId, setScenarioId] = useState<AstraRiskQaScenarioId>('low_token');
  const [qaState, setQaState] = useState<AstraRiskQaState>(ASTRA_RISK_QA_INITIAL_STATE);
  const [result, setResult] = useState<AstraRiskQaPipelineResult | null>(null);

  async function runScenario(nextScenarioId: AstraRiskQaScenarioId = scenarioId) {
    const nextResult = await runRiskQaPipeline({
      scenarioId: nextScenarioId,
      state: qaState,
    });
    setQaState(nextResult.nextState);
    setResult(nextResult);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.container}
      testID="astra-risk-qa-sandbox"
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>QA Sandbox read-only</Text>
        </View>
        <Text style={styles.title}>ASTRA Risk QA Pipeline</Text>
        <Text style={styles.subtitle}>Pipeline mock/offline. No ejecuta acciones.</Text>
      </View>

      <AstraRiskQaScenarioPanel
        onSelectScenario={setScenarioId}
        scenarios={ASTRA_RISK_QA_SCENARIOS}
        selectedScenarioId={scenarioId}
      />

      <AstraRiskQaControls
        onEmitDuplicate={() => runScenario('dedup_repeated_event')}
        onEmitOnce={() => runScenario(scenarioId)}
        onReset={() => {
          setQaState(ASTRA_RISK_QA_INITIAL_STATE);
          setResult(null);
        }}
        onSimulateCooldownActive={() => runScenario('cooldown_active')}
        onSimulateCooldownExpired={() => runScenario('cooldown_expired')}
      />

      <AstraRiskQaPipelineStatus status={result?.status ?? null} />
      <AstraRiskQaEventPreview event={result?.event ?? null} />
      <AstraRiskQaRelevancePreview
        relevance={result?.relevance ?? null}
        uiDisplayMode={result?.uiDisplayMode ?? 'none'}
      />

      <AstraRiskInsightHost
        enabled={!!result?.insight}
        event={result?.event}
        flags={{
          ASTRA_RISK_RELEVANCE_ENABLED: true,
          ASTRA_RISK_INSIGHT_HOST_ENABLED: true,
          ASTRA_RISK_INSIGHT_CARDS_ENABLED: true,
          ASTRA_RISK_INSIGHT_BANNERS_ENABLED: true,
          ASTRA_RISK_INSIGHT_CRITICAL_ENABLED: true,
          ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
        }}
        relevance={result?.relevance}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: astraUiTheme.colors.accentSoft,
    borderColor: astraUiTheme.colors.accent,
    borderRadius: astraUiTheme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: 6,
  },
  badgeText: {
    color: astraUiTheme.colors.accent,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
  },
  container: {
    backgroundColor: astraUiTheme.colors.background,
  },
  content: {
    gap: astraUiTheme.spacing.md,
    padding: astraUiTheme.spacing.lg,
  },
  header: {
    gap: astraUiTheme.spacing.sm,
  },
  subtitle: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 14,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 22,
  },
});
