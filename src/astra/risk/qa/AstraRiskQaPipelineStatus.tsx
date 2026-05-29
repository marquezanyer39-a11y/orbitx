import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';
import type { AstraRiskQaPipelineStatus as Status } from './astraRiskQaPipeline';

export interface AstraRiskQaPipelineStatusProps {
  status: Status | null;
}

export function AstraRiskQaPipelineStatus({ status }: AstraRiskQaPipelineStatusProps) {
  if (!status) {
    return (
      <View style={styles.container} testID="astra-risk-qa-pipeline-status-empty">
        <Text style={styles.title}>Pipeline status</Text>
        <Text style={styles.body}>Sin ejecucion QA todavia.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="astra-risk-qa-pipeline-status">
      <Text style={styles.title}>Pipeline status</Text>
      <Text style={styles.body}>scan: {status.scan}</Text>
      <Text style={styles.body}>event: {status.event}</Text>
      <Text style={styles.body}>relevance: {status.relevance}</Text>
      <Text style={styles.body}>insight: {status.insight}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
  },
  container: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.lg,
    borderWidth: 1,
    gap: 4,
    padding: astraUiTheme.spacing.md,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 15,
  },
});
