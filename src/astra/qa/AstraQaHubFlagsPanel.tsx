import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../ui/theme/astraUiTheme';
import type { AstraQaHubFlagRow } from './astraQaHub.types';

export interface AstraQaHubFlagsPanelProps {
  rows: AstraQaHubFlagRow[];
}

export function AstraQaHubFlagsPanel({ rows }: AstraQaHubFlagsPanelProps) {
  return (
    <View style={styles.panel} testID="astra-qa-hub-flags-panel">
      <Text style={styles.title}>Flags read-only</Text>
      <Text style={styles.subtitle}>
        Solo se muestran booleanos seguros. No se exponen secrets, tokens, sesiones ni payloads.
      </Text>

      <View style={styles.list}>
        {rows.map((row) => (
          <View key={row.key} style={styles.row}>
            <View style={styles.rowCopy}>
              <Text style={styles.flagName}>{row.key}</Text>
              <Text style={styles.category}>{row.category}</Text>
            </View>
            <Text style={[styles.value, row.value ? styles.valueOn : styles.valueOff]}>
              {row.value ? 'true' : 'false'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  category: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  flagName: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
  list: {
    gap: astraUiTheme.spacing.xs,
  },
  panel: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.borderStrong,
    borderRadius: astraUiTheme.radii.lg,
    borderWidth: 1,
    gap: astraUiTheme.spacing.md,
    padding: astraUiTheme.spacing.md,
  },
  row: {
    alignItems: 'center',
    backgroundColor: astraUiTheme.colors.surfaceElevated,
    borderRadius: astraUiTheme.radii.md,
    flexDirection: 'row',
    gap: astraUiTheme.spacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: astraUiTheme.spacing.sm,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 18,
  },
  value: {
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
  },
  valueOff: {
    color: astraUiTheme.colors.textMuted,
  },
  valueOn: {
    color: astraUiTheme.colors.accent,
  },
});
