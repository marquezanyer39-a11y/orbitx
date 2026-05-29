import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../../ui/theme/astraUiTheme';
import type { AstraToolExecutionResult } from '../../astraTool.types';
import { getAstraToolResultPanelMessage } from './astraLocalToolSandboxFixtures';

export interface AstraToolResultPanelProps {
  result: AstraToolExecutionResult | null;
}

function getStatusColor(status: AstraToolExecutionResult['status']): string {
  if (status === 'success_local' || status === 'success') {
    return astraUiTheme.colors.accent;
  }

  if (status === 'pending_confirmation') {
    return astraUiTheme.colors.warning;
  }

  if (status === 'blocked' || status === 'failed') {
    return astraUiTheme.colors.danger;
  }

  return astraUiTheme.colors.textMuted;
}

export function AstraToolResultPanel({ result }: AstraToolResultPanelProps) {
  if (!result) {
    return (
      <View style={styles.container} testID="astra-tool-result-empty">
        <Text style={styles.title}>Sin resultado todavía</Text>
        <Text style={styles.body}>Elige una tool local y usa “Ejecutar local” para probarla.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="astra-tool-result-panel">
      <View style={styles.header}>
        <Text style={styles.title}>Resultado</Text>
        <Text style={[styles.status, { color: getStatusColor(result.status) }]}>{result.status}</Text>
      </View>
      <Text style={styles.body}>toolId: {result.toolId}</Text>
      <Text style={styles.body}>mensaje: {result.message}</Text>
      <Text style={styles.body}>{getAstraToolResultPanelMessage(result)}</Text>
      {result.errorCode ? <Text style={styles.error}>errorCode: {result.errorCode}</Text> : null}
      {result.confirmationToken ? (
        <Text style={styles.body}>confirmationToken: {result.confirmationToken.slice(0, 12)}...</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  container: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.xl,
    borderWidth: 1,
    gap: astraUiTheme.spacing.xs,
    padding: astraUiTheme.spacing.md,
  },
  error: {
    color: astraUiTheme.colors.danger,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 13,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 15,
  },
});
