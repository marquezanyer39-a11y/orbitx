import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';
import type { AstraRiskLevel } from '../astraRisk.types';
import { sanitizeRiskUiText } from './astraRiskUiFormatters';

export interface AstraRiskWarningListProps {
  warnings: string[];
  riskLevel: AstraRiskLevel;
}

export function AstraRiskWarningList({ warnings, riskLevel }: AstraRiskWarningListProps) {
  const normalizedWarnings =
    riskLevel === 'critical'
      ? [...warnings, 'No firmes ni interactúes hasta revisar manualmente.']
      : warnings;

  return (
    <View style={styles.container} testID="astra-risk-warning-list">
      <Text style={styles.title}>Warnings</Text>
      {normalizedWarnings.length === 0 ? (
        <Text style={styles.body}>Sin warnings activos.</Text>
      ) : (
        normalizedWarnings.map((warning) => (
          <Text key={warning} style={styles.body}>
            {sanitizeRiskUiText(warning)}
          </Text>
        ))
      )}
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
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 15,
  },
});
