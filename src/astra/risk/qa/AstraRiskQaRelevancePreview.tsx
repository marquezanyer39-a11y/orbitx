import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';
import type { AstraRiskUiDisplayMode } from '../relevance/astraRiskDisplayMapper';
import type { AstraRiskRelevanceResult } from '../relevance/astraRiskRelevanceRules';

export interface AstraRiskQaRelevancePreviewProps {
  relevance: AstraRiskRelevanceResult | null;
  uiDisplayMode: AstraRiskUiDisplayMode;
}

export function AstraRiskQaRelevancePreview({
  relevance,
  uiDisplayMode,
}: AstraRiskQaRelevancePreviewProps) {
  if (!relevance) {
    return null;
  }

  return (
    <View style={styles.container} testID="astra-risk-qa-relevance-preview">
      <Text style={styles.title}>Relevance preview</Text>
      <Text style={styles.body}>core displayMode: {relevance.displayMode}</Text>
      <Text style={styles.body}>UI mode: {uiDisplayMode}</Text>
      <Text style={styles.body}>score: {relevance.score}</Text>
      <Text style={styles.body}>reason: {relevance.reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 12,
    lineHeight: 17,
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
    color: astraUiTheme.colors.accent,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 13,
    textTransform: 'uppercase',
  },
});
