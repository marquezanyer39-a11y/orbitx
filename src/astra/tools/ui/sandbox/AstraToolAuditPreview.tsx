import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../../ui/theme/astraUiTheme';
import type { AstraToolSandboxAuditPreviewModel } from './astraLocalToolSandboxFixtures';

export interface AstraToolAuditPreviewProps {
  audit: AstraToolSandboxAuditPreviewModel | null;
}

export function AstraToolAuditPreview({ audit }: AstraToolAuditPreviewProps) {
  if (!audit) {
    return null;
  }

  const metadataEntries = Object.entries(audit.metadata);

  return (
    <View style={styles.container} testID="astra-tool-audit-preview">
      <Text style={styles.eyebrow}>Auditoría sanitizada</Text>
      <Text style={styles.line}>toolId: {audit.toolId}</Text>
      <Text style={styles.line}>timestamp: {audit.timestamp}</Text>
      <Text style={styles.line}>status: {audit.status}</Text>
      <Text style={styles.line}>source: {audit.source}</Text>
      <Text style={styles.line}>surface: {audit.surface}</Text>
      <Text style={styles.line}>paramsHash: {audit.paramsHash}</Text>
      {metadataEntries.map(([key, value]) => (
        <Text key={key} style={styles.line}>
          {key}: {value}
        </Text>
      ))}
      <Text style={styles.line}>
        redactedKeys: {audit.redactedKeys.length > 0 ? audit.redactedKeys.join(', ') : 'none'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.lg,
    borderWidth: 1,
    gap: 4,
    padding: astraUiTheme.spacing.md,
  },
  eyebrow: {
    color: astraUiTheme.colors.accent,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  line: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 12,
  },
});
