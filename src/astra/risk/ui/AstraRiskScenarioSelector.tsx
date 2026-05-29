import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';
import type { AstraRiskSandboxScenario, AstraRiskSandboxScenarioId } from './astraRiskSandboxFixtures';

export interface AstraRiskScenarioSelectorProps {
  scenarios: AstraRiskSandboxScenario[];
  selectedScenarioId: AstraRiskSandboxScenarioId;
  onSelectScenario: (scenarioId: AstraRiskSandboxScenarioId) => void;
}

export function AstraRiskScenarioSelector({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
}: AstraRiskScenarioSelectorProps) {
  return (
    <View style={styles.container} testID="astra-risk-scenario-selector">
      {scenarios.map((scenario) => {
        const selected = scenario.id === selectedScenarioId;
        return (
          <Pressable
            accessibilityRole="button"
            key={scenario.id}
            onPress={() => onSelectScenario(scenario.id)}
            style={[styles.chip, selected ? styles.chipSelected : null]}
            testID={`astra-risk-scenario-${scenario.id}`}
          >
            <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>
              {scenario.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: astraUiTheme.spacing.sm,
  },
  chipSelected: {
    borderColor: astraUiTheme.colors.accent,
  },
  chipText: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
  chipTextSelected: {
    color: astraUiTheme.colors.accent,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: astraUiTheme.spacing.sm,
  },
});
