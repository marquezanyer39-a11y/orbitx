import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { astraUiTheme } from '../ui/theme/astraUiTheme';
import type { AstraQaHubTabDefinition, AstraQaHubTabId } from './astraQaHub.types';

export interface AstraQaHubTabBarProps {
  activeTab: AstraQaHubTabId;
  tabs: AstraQaHubTabDefinition[];
  onChangeTab: (tab: AstraQaHubTabId) => void;
}

export function AstraQaHubTabBar({ activeTab, tabs, onChangeTab }: AstraQaHubTabBarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {tabs.map((tab) => {
        const active = tab.id === activeTab;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChangeTab(tab.id)}
            style={({ pressed }) => [
              styles.tab,
              active ? styles.tabActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={[styles.label, active ? styles.labelActive : null]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: astraUiTheme.spacing.sm,
    paddingRight: astraUiTheme.spacing.lg,
  },
  label: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
  },
  labelActive: {
    color: astraUiTheme.colors.text,
  },
  pressed: {
    opacity: 0.82,
  },
  tab: {
    alignItems: 'center',
    backgroundColor: astraUiTheme.colors.surfaceElevated,
    borderColor: astraUiTheme.colors.borderStrong,
    borderRadius: astraUiTheme.radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: astraUiTheme.spacing.md,
  },
  tabActive: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.accent,
  },
});
