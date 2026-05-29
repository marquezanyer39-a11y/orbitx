import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';
import { createAstraRiskAuditRecord } from '../astraRiskAudit';
import { scanApprovalRisk, scanTokenRisk } from '../astraRiskEngine';
import type { AstraRiskAuditRecord, AstraRiskEngineResult } from '../astraRisk.types';
import { AstraRiskAuditPreview } from './AstraRiskAuditPreview';
import { AstraRiskReasonList } from './AstraRiskReasonList';
import { AstraRiskScenarioSelector } from './AstraRiskScenarioSelector';
import { AstraRiskScoreCard } from './AstraRiskScoreCard';
import { AstraRiskWarningList } from './AstraRiskWarningList';
import {
  ASTRA_RISK_SANDBOX_SCENARIOS,
  createAstraRiskSandboxFlags,
  type AstraRiskSandboxScenarioId,
} from './astraRiskSandboxFixtures';

export function AstraRiskSandbox() {
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<AstraRiskSandboxScenarioId>('safe_token');
  const [simulateFlagsDisabled, setSimulateFlagsDisabled] = useState(false);
  const [auditVisible, setAuditVisible] = useState(false);
  const [result, setResult] = useState<AstraRiskEngineResult | null>(null);
  const [audit, setAudit] = useState<AstraRiskAuditRecord | null>(null);

  const selectedScenario = useMemo(
    () => ASTRA_RISK_SANDBOX_SCENARIOS.find((scenario) => scenario.id === selectedScenarioId),
    [selectedScenarioId],
  );

  async function handleScan() {
    if (!selectedScenario) {
      return;
    }

    const flags = createAstraRiskSandboxFlags(simulateFlagsDisabled);
    const scanResult =
      selectedScenario.kind === 'approval' && selectedScenario.approvalInput
        ? await scanApprovalRisk(selectedScenario.approvalInput, { flags })
        : await scanTokenRisk(selectedScenario.tokenInput!, { flags });

    setResult(scanResult);
    setAudit(
      createAstraRiskAuditRecord(scanResult, {
        toolId:
          selectedScenario.kind === 'approval'
            ? 'web3.scan_approval_risk_readonly'
            : 'web3.scan_token_risk_readonly',
      }),
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.container}
      testID="astra-risk-sandbox"
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Sandbox read-only</Text>
        </View>
        <Text style={styles.title}>ASTRA Web3 Risk Sandbox</Text>
        <Text style={styles.subtitle}>Resultado mock/offline para QA técnico</Text>
      </View>

      <AstraRiskScenarioSelector
        onSelectScenario={setSelectedScenarioId}
        scenarios={ASTRA_RISK_SANDBOX_SCENARIOS}
        selectedScenarioId={selectedScenarioId}
      />

      {selectedScenario ? <Text style={styles.description}>{selectedScenario.description}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={handleScan}
          style={styles.actionButton}
          testID="astra-risk-scan-mock"
        >
          <Text style={styles.actionText}>Escanear mock</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setAuditVisible((value) => !value)}
          style={styles.actionButton}
          testID="astra-risk-toggle-audit"
        >
          <Text style={styles.actionText}>Ver auditoría</Text>
        </Pressable>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: simulateFlagsDisabled }}
          onPress={() => setSimulateFlagsDisabled((value) => !value)}
          style={[styles.actionButton, simulateFlagsDisabled ? styles.warningButton : null]}
          testID="astra-risk-toggle-disabled-flags"
        >
          <Text style={styles.actionText}>Simular flags apagadas</Text>
        </Pressable>
      </View>

      <AstraRiskScoreCard result={result} />
      {result ? (
        <>
          <AstraRiskReasonList reasons={result.reasons} />
          <AstraRiskWarningList riskLevel={result.riskLevel} warnings={result.warnings} />
          <AstraRiskAuditPreview audit={audit} visible={auditVisible} />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: astraUiTheme.spacing.sm,
  },
  actionText: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: astraUiTheme.spacing.sm,
  },
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
  description: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 19,
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
  warningButton: {
    borderColor: astraUiTheme.colors.warning,
  },
});
