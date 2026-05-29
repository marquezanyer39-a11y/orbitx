import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../ui/theme/astraUiTheme';
import type { AstraQaChecklistResult } from './astraQaChecklistModel';

export interface AstraQaChecklistPanelProps {
  result: AstraQaChecklistResult;
}

export function AstraQaChecklistPanel({ result }: AstraQaChecklistPanelProps) {
  return (
    <View style={styles.panel} testID="astra-qa-checklist-panel">
      <View style={styles.header}>
        <Text style={styles.title}>Checklist técnico</Text>
        <Text style={styles.subtitle}>
          {result.summary.passed}/{result.summary.total} checks seguros completados.
        </Text>
      </View>

      <View style={styles.list}>
        {result.items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={[styles.indicator, item.passed ? styles.indicatorPass : styles.indicatorFail]}>
              <Text style={styles.indicatorText}>{item.passed ? 'OK' : 'NO'}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
            </View>
            <Text style={styles.severity}>{item.severity}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 3,
  },
  detail: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  header: {
    gap: astraUiTheme.spacing.xs,
  },
  indicator: {
    alignItems: 'center',
    borderRadius: astraUiTheme.radii.pill,
    height: 28,
    justifyContent: 'center',
    width: 42,
  },
  indicatorFail: {
    backgroundColor: astraUiTheme.colors.dangerSoft,
  },
  indicatorPass: {
    backgroundColor: astraUiTheme.colors.accentSoft,
  },
  indicatorText: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 10,
  },
  label: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 13,
  },
  list: {
    gap: astraUiTheme.spacing.sm,
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
    gap: astraUiTheme.spacing.sm,
    padding: astraUiTheme.spacing.md,
  },
  severity: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 18,
  },
});
