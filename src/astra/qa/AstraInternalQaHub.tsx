import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { astraConfigService } from '../config/astraFlags';
import { AstraRiskQaSandbox } from '../risk/qa/AstraRiskQaSandbox';
import { AstraLocalToolsSandbox } from '../tools/ui/sandbox/AstraLocalToolsSandbox';
import { AstraUiSandbox } from '../ui/sandbox/AstraUiSandbox';
import { astraUiTheme } from '../ui/theme/astraUiTheme';
import { AstraQaConfirmationBridge } from './AstraQaConfirmationBridge';
import { AstraQaChecklistPanel } from './AstraQaChecklistPanel';
import { AstraQaHubFlagsPanel } from './AstraQaHubFlagsPanel';
import { AstraQaHubStatusPanel } from './AstraQaHubStatusPanel';
import { AstraQaHubTabBar } from './AstraQaHubTabBar';
import { AstraQaRemoteConfigPanel } from './AstraQaRemoteConfigPanel';
import { AstraQaVisualSummary } from './AstraQaVisualSummary';
import { buildAstraQaChecklist } from './astraQaChecklistModel';
import {
  getAstraQaHubFlagRows,
  getAstraQaHubModuleStatuses,
  getAstraQaModuleHealthItems,
  getAstraQaHubVisibleTabs,
  isAstraQaHubEnabled,
  resolveAstraQaHubFlags,
  resolveAstraQaHubInitialTab,
} from './astraQaHubModel';
import type { AstraInternalQaHubProps, AstraQaHubTabId } from './astraQaHub.types';

export function AstraInternalQaHub({
  enabled = true,
  flags,
  initialTab,
}: AstraInternalQaHubProps) {
  const resolvedFlags = useMemo(
    () => resolveAstraQaHubFlags(flags ?? astraConfigService.getFlags()),
    [flags],
  );
  const visibleTabs = useMemo(() => getAstraQaHubVisibleTabs(resolvedFlags), [resolvedFlags]);
  const checklist = useMemo(() => buildAstraQaChecklist(resolvedFlags), [resolvedFlags]);
  const moduleHealth = useMemo(() => getAstraQaModuleHealthItems(resolvedFlags), [resolvedFlags]);
  const firstTab = useMemo(
    () => resolveAstraQaHubInitialTab(resolvedFlags, initialTab),
    [initialTab, resolvedFlags],
  );
  const [activeTab, setActiveTab] = useState<AstraQaHubTabId | null>(firstTab);

  const selectedTab = visibleTabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : firstTab;

  if (!isAstraQaHubEnabled(resolvedFlags, enabled) || !selectedTab) {
    return null;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.container}
      testID="astra-internal-qa-hub"
    >
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Dev-only</Text>
          </View>
          <View style={styles.warningBadge}>
            <Text style={styles.warningBadgeText}>No production actions</Text>
          </View>
        </View>
        <Text style={styles.title}>Astra Internal QA Hub</Text>
        <Text style={styles.subtitle}>
          Superficie aislada y exportada. No monta navegacion, no publica eventos, no ejecuta scans ni
          tools automaticamente.
        </Text>
      </View>

      <AstraQaVisualSummary checklistSummary={checklist.summary} moduleHealth={moduleHealth} />

      <AstraQaHubTabBar
        activeTab={selectedTab}
        tabs={visibleTabs}
        onChangeTab={setActiveTab}
      />

      {renderQaHubTab(selectedTab, resolvedFlags, checklist, moduleHealth)}
    </ScrollView>
  );
}

function renderQaHubTab(
  tab: AstraQaHubTabId,
  flags: ReturnType<typeof resolveAstraQaHubFlags>,
  checklist: ReturnType<typeof buildAstraQaChecklist>,
  moduleHealth: ReturnType<typeof getAstraQaModuleHealthItems>,
) {
  if (tab === 'status') {
    return (
      <AstraQaHubStatusPanel
        items={getAstraQaHubModuleStatuses(flags)}
        moduleHealth={moduleHealth}
      />
    );
  }

  if (tab === 'risk') {
    return <AstraRiskQaSandbox />;
  }

  if (tab === 'tools') {
    return <AstraLocalToolsSandbox />;
  }

  if (tab === 'confirmation') {
    return <AstraQaConfirmationBridge />;
  }

  if (tab === 'remoteConfig') {
    return <AstraQaRemoteConfigPanel />;
  }

  if (tab === 'ui') {
    return <AstraUiSandbox />;
  }

  if (tab === 'checklist') {
    return <AstraQaChecklistPanel result={checklist} />;
  }

  return <AstraQaHubFlagsPanel rows={getAstraQaHubFlagRows(flags)} />;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: astraUiTheme.colors.accentSoft,
    borderColor: astraUiTheme.colors.accent,
    borderRadius: astraUiTheme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: 6,
  },
  badgeText: {
    color: astraUiTheme.colors.accent,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: astraUiTheme.spacing.sm,
  },
  container: {
    backgroundColor: astraUiTheme.colors.background,
  },
  content: {
    gap: astraUiTheme.spacing.lg,
    padding: astraUiTheme.spacing.lg,
  },
  header: {
    gap: astraUiTheme.spacing.sm,
  },
  subtitle: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 24,
  },
  warningBadge: {
    alignSelf: 'flex-start',
    backgroundColor: astraUiTheme.colors.warningSoft,
    borderColor: astraUiTheme.colors.warning,
    borderRadius: astraUiTheme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: 6,
  },
  warningBadgeText: {
    color: astraUiTheme.colors.warning,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
  },
});
