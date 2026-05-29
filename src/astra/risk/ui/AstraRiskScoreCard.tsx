import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';
import type { AstraRiskEngineResult } from '../astraRisk.types';
import {
  formatRiskAction,
  formatRiskConfidence,
  formatRiskScore,
  getRiskLevelAccent,
} from './astraRiskUiFormatters';

export interface AstraRiskScoreCardProps {
  result: AstraRiskEngineResult | null;
}

function getAccentColor(result: AstraRiskEngineResult): string {
  const accent = getRiskLevelAccent(result.riskLevel);

  if (accent === 'success') {
    return astraUiTheme.colors.accent;
  }

  if (accent === 'warning') {
    return astraUiTheme.colors.warning;
  }

  return astraUiTheme.colors.danger;
}

export function AstraRiskScoreCard({ result }: AstraRiskScoreCardProps) {
  if (!result) {
    return (
      <View style={styles.card} testID="astra-risk-score-empty">
        <Text style={styles.title}>Sin scan todavía</Text>
        <Text style={styles.body}>Selecciona un escenario y usa el scan mock read-only.</Text>
      </View>
    );
  }

  const accentColor = getAccentColor(result);

  return (
    <View style={[styles.card, { borderColor: accentColor }]} testID="astra-risk-score-card">
      <View style={styles.header}>
        <Text style={styles.title}>Risk score</Text>
        <Text style={[styles.level, { color: accentColor }]}>{result.riskLevel}</Text>
      </View>
      <Text style={[styles.score, { color: accentColor }]}>{formatRiskScore(result.riskScore)}</Text>
      <Text style={styles.body}>confidence: {formatRiskConfidence(result.confidence)}</Text>
      <Text style={styles.body}>source: {result.source}</Text>
      <Text style={styles.body}>scannedAt: {result.scannedAt}</Text>
      <Text style={styles.body}>recommendedAction: {formatRiskAction(result.recommendedAction)}</Text>
      {result.blocked ? <Text style={styles.warning}>Estado bloqueado por flags read-only.</Text> : null}
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
  card: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.xl,
    borderWidth: 1,
    gap: astraUiTheme.spacing.xs,
    padding: astraUiTheme.spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  level: {
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  score: {
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 34,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 16,
  },
  warning: {
    color: astraUiTheme.colors.warning,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 13,
  },
});
