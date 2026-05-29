import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';
import type { AstraRiskAuditRecord } from '../astraRisk.types';
import { sanitizeRiskAuditForUi, sanitizeRiskUiText } from './astraRiskUiFormatters';

export interface AstraRiskAuditPreviewProps {
  audit: AstraRiskAuditRecord | null;
  visible?: boolean;
}

export function AstraRiskAuditPreview({ audit, visible = false }: AstraRiskAuditPreviewProps) {
  if (!audit || !visible) {
    return null;
  }

  const safeAudit = sanitizeRiskAuditForUi(audit);

  return (
    <View style={styles.container} testID="astra-risk-audit-preview">
      <Text style={styles.title}>Auditoría sanitizada</Text>
      {safeAudit.toolId ? <Text style={styles.body}>toolId: {sanitizeRiskUiText(safeAudit.toolId)}</Text> : null}
      {safeAudit.eventId ? <Text style={styles.body}>eventId: {sanitizeRiskUiText(safeAudit.eventId)}</Text> : null}
      <Text style={styles.body}>timestamp: {safeAudit.timestamp}</Text>
      <Text style={styles.body}>chainId: {safeAudit.chainId}</Text>
      <Text style={styles.body}>tokenPreview: {safeAudit.tokenPreview}</Text>
      <Text style={styles.body}>riskLevel: {safeAudit.riskLevel}</Text>
      <Text style={styles.body}>riskScore: {safeAudit.riskScore}</Text>
      <Text style={styles.body}>reasons: {safeAudit.reasons.join(', ') || 'none'}</Text>
      <Text style={styles.body}>paramsHash: {safeAudit.paramsHash}</Text>
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
    borderRadius: astraUiTheme.radii.xl,
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
