import { StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../ui/theme/astraUiTheme';
import { AstraQaModuleHealthCard } from './AstraQaModuleHealthCard';
import type { AstraQaModuleHealthItem } from './astraQaHub.types';
import type { AstraQaHubModuleStatusItem } from './astraQaHub.types';

export interface AstraQaHubStatusPanelProps {
  items: AstraQaHubModuleStatusItem[];
  moduleHealth?: AstraQaModuleHealthItem[];
}

const STATUS_LABELS: Record<AstraQaHubModuleStatusItem['status'], string> = {
  enabled: 'Activo',
  disabled: 'Apagado',
  blocked: 'Bloqueado',
};

export function AstraQaHubStatusPanel({ items, moduleHealth = [] }: AstraQaHubStatusPanelProps) {
  return (
    <View style={styles.panel} testID="astra-qa-hub-status-panel">
      <Text style={styles.title}>Estado general ASTRA</Text>
      <Text style={styles.subtitle}>
        Vista read-only. No inicia backend, eventos, scans, tools ni delivery.
      </Text>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{item.label}</Text>
              <Text style={styles.rowDetail}>{item.detail}</Text>
            </View>
            <View style={[styles.badge, styles[`badge_${item.status}`]]}>
              <Text style={styles.badgeText}>{STATUS_LABELS[item.status]}</Text>
            </View>
          </View>
        ))}
      </View>

      {moduleHealth.length > 0 ? (
        <View style={styles.healthGrid}>
          <Text style={styles.sectionTitle}>Module health cards</Text>
          {moduleHealth.map((item) => (
            <AstraQaModuleHealthCard key={item.id} item={item} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: astraUiTheme.radii.pill,
    paddingHorizontal: astraUiTheme.spacing.sm,
    paddingVertical: 5,
  },
  badge_blocked: {
    backgroundColor: astraUiTheme.colors.dangerSoft,
  },
  badge_disabled: {
    backgroundColor: astraUiTheme.colors.surfaceElevated,
  },
  badge_enabled: {
    backgroundColor: astraUiTheme.colors.accentSoft,
  },
  badgeText: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 11,
  },
  list: {
    gap: astraUiTheme.spacing.sm,
  },
  healthGrid: {
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
    gap: astraUiTheme.spacing.md,
    justifyContent: 'space-between',
    padding: astraUiTheme.spacing.md,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowDetail: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  rowTitle: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 14,
  },
  sectionTitle: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 16,
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
});
