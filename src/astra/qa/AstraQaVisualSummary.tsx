import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../ui/theme/astraUiTheme';
import { ASTRA_QA_SAFETY_BANNER_ITEMS, type AstraQaChecklistSummary } from './astraQaChecklistModel';
import type { AstraQaModuleHealthItem } from './astraQaHub.types';

export interface AstraQaVisualSummaryProps {
  checklistSummary: AstraQaChecklistSummary;
  moduleHealth: AstraQaModuleHealthItem[];
}

export function AstraQaVisualSummary({
  checklistSummary,
  moduleHealth,
}: AstraQaVisualSummaryProps) {
  const availableCount = moduleHealth.filter((item) => item.status === 'available').length;
  const blockedCount = moduleHealth.filter((item) => item.status === 'blocked').length;
  const disabledCount = moduleHealth.filter((item) => item.status === 'disabled_by_flag').length;

  return (
    <View style={styles.wrap} testID="astra-qa-visual-summary">
      <View style={styles.safetyBanner}>
        {ASTRA_QA_SAFETY_BANNER_ITEMS.map((item) => (
          <View key={item} style={styles.safetyPill}>
            <Text style={styles.safetyText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        <SummaryTile label="Checklist" value={`${checklistSummary.passed}/${checklistSummary.total}`} />
        <SummaryTile label="Available" value={String(availableCount)} />
        <SummaryTile label="Disabled" value={String(disabledCount)} />
        <SummaryTile label="Blocked" value={String(blockedCount)} />
      </View>
    </View>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: astraUiTheme.spacing.sm,
  },
  safetyBanner: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.accent,
    borderRadius: astraUiTheme.radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: astraUiTheme.spacing.sm,
    padding: astraUiTheme.spacing.md,
  },
  safetyPill: {
    backgroundColor: astraUiTheme.colors.accentSoft,
    borderRadius: astraUiTheme.radii.pill,
    paddingHorizontal: astraUiTheme.spacing.sm,
    paddingVertical: 6,
  },
  safetyText: {
    color: astraUiTheme.colors.accent,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 11,
  },
  tile: {
    backgroundColor: astraUiTheme.colors.surfaceElevated,
    borderColor: astraUiTheme.colors.borderStrong,
    borderRadius: astraUiTheme.radii.lg,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 132,
    padding: astraUiTheme.spacing.md,
  },
  tileLabel: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 11,
  },
  tileValue: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 20,
  },
  wrap: {
    gap: astraUiTheme.spacing.md,
  },
});
