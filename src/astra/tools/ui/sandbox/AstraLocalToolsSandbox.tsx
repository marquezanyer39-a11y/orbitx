import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../../ui/theme/astraUiTheme';
import type { AstraToolExecutionResult } from '../../astraTool.types';
import type { AstraLocalToolSandboxFixture } from './astraLocalToolSandboxFixtures';
import { AstraLocalToolCard } from './AstraLocalToolCard';
import { AstraToolAuditPreview } from './AstraToolAuditPreview';
import { AstraToolResultPanel } from './AstraToolResultPanel';
import {
  ASTRA_LOCAL_TOOL_SANDBOX_FIXTURES,
  createAstraSandboxAuditPreviewModel,
  createAstraLocalToolSandboxRequest,
  runAstraLocalToolSandboxFixture,
  type AstraToolSandboxAuditPreviewModel,
} from './astraLocalToolSandboxFixtures';

export interface AstraLocalToolsSandboxProps {
  fixtures?: AstraLocalToolSandboxFixture[];
}

interface SandboxState {
  result: AstraToolExecutionResult | null;
  audit: AstraToolSandboxAuditPreviewModel | null;
  selectedToolId: string | null;
}

export function AstraLocalToolsSandbox({
  fixtures = ASTRA_LOCAL_TOOL_SANDBOX_FIXTURES,
}: AstraLocalToolsSandboxProps) {
  const [simulateFlagsDisabled, setSimulateFlagsDisabled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [state, setState] = useState<SandboxState>({
    result: null,
    audit: null,
    selectedToolId: null,
  });

  const fixtureCount = useMemo(() => fixtures.length, [fixtures.length]);

  async function handleRun(fixture: AstraLocalToolSandboxFixture) {
    setIsRunning(true);
    try {
      const request = createAstraLocalToolSandboxRequest(fixture);
      const result = await runAstraLocalToolSandboxFixture(fixture, {
        simulateFlagsDisabled,
      });
      setState({
        result,
        audit: createAstraSandboxAuditPreviewModel(fixture.toolId, request.params, result),
        selectedToolId: fixture.toolId,
      });
    } catch {
      const result: AstraToolExecutionResult = {
        status: 'failed',
        toolId: fixture.toolId,
        message: 'Sandbox local falló de forma segura.',
        errorCode: 'ASTRA_SANDBOX_ERROR',
      };
      setState({
        result,
        audit: createAstraSandboxAuditPreviewModel(fixture.toolId, fixture.safePayload, result),
        selectedToolId: fixture.toolId,
      });
    } finally {
      setIsRunning(false);
    }
  }

  function handlePendingPreview() {
    const fixture = fixtures[0];
    if (!fixture) {
      return;
    }

    const result: AstraToolExecutionResult = {
      status: 'pending_confirmation',
      toolId: fixture.toolId,
      message: 'Vista visual de confirmación pendiente. No ejecuta acciones reales.',
      confirmationToken: 'sandbox_preview_token',
      errorCode: 'ASTRA_TOOL_CONFIRMATION_REQUIRED',
    };

    setState({
      result,
      audit: createAstraSandboxAuditPreviewModel(fixture.toolId, fixture.safePayload, result),
      selectedToolId: fixture.toolId,
    });
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.container}
      testID="astra-local-tools-sandbox"
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Solo prueba local</Text>
        </View>
        <Text style={styles.title}>ASTRA Local Tools Sandbox</Text>
        <Text style={styles.subtitle}>
          QA manual de {fixtureCount} tools locales. No monta navegación, no toca fondos y no ejecuta firmas.
        </Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: simulateFlagsDisabled }}
          onPress={() => setSimulateFlagsDisabled((value) => !value)}
          style={[styles.controlButton, simulateFlagsDisabled ? styles.controlButtonActive : null]}
          testID="astra-local-tools-toggle-disabled-flags"
        >
          <Text style={styles.controlText}>
            {simulateFlagsDisabled ? 'Flags apagadas simuladas' : 'Flags sandbox habilitadas'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={handlePendingPreview}
          style={styles.controlButton}
          testID="astra-local-tools-pending-preview"
        >
          <Text style={styles.controlText}>Vista pending_confirmation</Text>
        </Pressable>
      </View>

      <AstraToolResultPanel result={state.result} />
      <AstraToolAuditPreview audit={state.audit} />

      {state.selectedToolId ? (
        <Text style={styles.selectedText}>Última tool probada: {state.selectedToolId}</Text>
      ) : null}

      <View style={styles.list}>
        {fixtures.map((fixture) => (
          <AstraLocalToolCard
            key={fixture.toolId}
            disabled={isRunning}
            fixture={fixture}
            onRun={handleRun}
          />
        ))}
      </View>
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
  controlButton: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: astraUiTheme.spacing.sm,
  },
  controlButtonActive: {
    borderColor: astraUiTheme.colors.warning,
  },
  controlText: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: astraUiTheme.spacing.sm,
  },
  header: {
    gap: astraUiTheme.spacing.sm,
  },
  list: {
    gap: astraUiTheme.spacing.md,
  },
  selectedText: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
  subtitle: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 22,
  },
});
