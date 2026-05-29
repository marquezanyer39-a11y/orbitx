import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../ui/theme/astraUiTheme';
import type { AstraQaModuleHealthItem } from './astraQaHub.types';

export interface AstraQaModuleHealthCardProps {
  item: AstraQaModuleHealthItem;
}

const STATUS_LABELS: Record<AstraQaModuleHealthItem['status'], string> = {
  available: 'available',
  disabled_by_flag: 'disabled_by_flag',
  blocked: 'blocked',
  placeholder: 'placeholder',
};

export function AstraQaModuleHealthCard({ item }: AstraQaModuleHealthCardProps) {
  return (
    <View style={styles.card} testID={`astra-qa-module-health-${item.id}`}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
          <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>Safety: {item.safetyLevel}</Text>
        <Text style={styles.meta}>Flag: {item.relatedFlag}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: astraUiTheme.colors.surfaceElevated,
    borderColor: astraUiTheme.colors.borderStrong,
    borderRadius: astraUiTheme.radii.lg,
    borderWidth: 1,
    gap: astraUiTheme.spacing.sm,
    padding: astraUiTheme.spacing.md,
  },
  description: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: astraUiTheme.spacing.sm,
    justifyContent: 'space-between',
  },
  meta: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 11,
  },
  metaRow: {
    gap: 4,
  },
  status_available: {
    backgroundColor: astraUiTheme.colors.accentSoft,
  },
  status_blocked: {
    backgroundColor: astraUiTheme.colors.dangerSoft,
  },
  status_disabled_by_flag: {
    backgroundColor: astraUiTheme.colors.warningSoft,
  },
  status_placeholder: {
    backgroundColor: astraUiTheme.colors.surface,
  },
  statusBadge: {
    borderRadius: astraUiTheme.radii.pill,
    paddingHorizontal: astraUiTheme.spacing.sm,
    paddingVertical: 5,
  },
  statusText: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 10,
  },
  title: {
    color: astraUiTheme.colors.text,
    flex: 1,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 14,
  },
});
