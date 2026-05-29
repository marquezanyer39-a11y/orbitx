import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';
import type { AstraRiskReason } from '../astraRisk.types';
import { sanitizeRiskUiText } from './astraRiskUiFormatters';

export interface AstraRiskReasonListProps {
  reasons: AstraRiskReason[];
}

export function AstraRiskReasonList({ reasons }: AstraRiskReasonListProps) {
  if (reasons.length === 0) {
    return (
      <View style={styles.container} testID="astra-risk-reasons-empty">
        <Text style={styles.title}>Reasons</Text>
        <Text style={styles.body}>Sin señales activas en este fixture.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="astra-risk-reason-list">
      <Text style={styles.title}>Reasons</Text>
      {reasons.map((reason) => (
        <View key={reason.code} style={styles.reasonRow}>
          <Text style={styles.code}>{sanitizeRiskUiText(reason.code)}</Text>
          <Text style={styles.body}>{sanitizeRiskUiText(reason.label)}</Text>
          <Text style={styles.severity}>severity: {reason.severity}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
  },
  code: {
    color: astraUiTheme.colors.accent,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
  container: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.xl,
    borderWidth: 1,
    gap: astraUiTheme.spacing.sm,
    padding: astraUiTheme.spacing.md,
  },
  reasonRow: {
    gap: 3,
  },
  severity: {
    color: astraUiTheme.colors.warning,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 15,
  },
});
