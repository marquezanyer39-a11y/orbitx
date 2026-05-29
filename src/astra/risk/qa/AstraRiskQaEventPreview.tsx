import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';
import type { AstraRiskWeb3Event } from '../events/astraRiskEvents.types';
import { sanitizeRiskUiText } from '../ui/astraRiskUiFormatters';

export interface AstraRiskQaEventPreviewProps {
  event: AstraRiskWeb3Event | null;
}

export function AstraRiskQaEventPreview({ event }: AstraRiskQaEventPreviewProps) {
  if (!event) {
    return null;
  }

  return (
    <View style={styles.container} testID="astra-risk-qa-event-preview">
      <Text style={styles.title}>Event preview</Text>
      <Text style={styles.body}>event type: {event.type}</Text>
      <Text style={styles.body}>riskEventType: {event.payload.riskEventType}</Text>
      <Text style={styles.body}>chainId: {event.payload.chainId}</Text>
      <Text style={styles.body}>tokenPreview: {sanitizeRiskUiText(event.payload.tokenPreview)}</Text>
      <Text style={styles.body}>riskLevel: {event.payload.riskLevel}</Text>
      <Text style={styles.body}>riskScore: {event.payload.riskScore}</Text>
      <Text style={styles.body}>recommendedAction: {event.payload.recommendedAction}</Text>
      <Text style={styles.body}>dedupKey: {sanitizeRiskUiText(event.dedupKey ?? 'none')}</Text>
      <Text style={styles.body}>source: {event.payload.source}</Text>
      <Text style={styles.body}>scannedAt: {event.payload.scannedAt}</Text>
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
