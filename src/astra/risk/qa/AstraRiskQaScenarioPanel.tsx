import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';
import type { AstraRiskQaScenario, AstraRiskQaScenarioId } from './astraRiskQaFixtures';

export interface AstraRiskQaScenarioPanelProps {
  scenarios: AstraRiskQaScenario[];
  selectedScenarioId: AstraRiskQaScenarioId;
  onSelectScenario: (scenarioId: AstraRiskQaScenarioId) => void;
}

export function AstraRiskQaScenarioPanel({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
}: AstraRiskQaScenarioPanelProps) {
  return (
    <View style={styles.container} testID="astra-risk-qa-scenario-panel">
      {scenarios.map((scenario) => {
        const selected = scenario.id === selectedScenarioId;
        return (
          <Pressable
            accessibilityRole="button"
            key={scenario.id}
            onPress={() => onSelectScenario(scenario.id)}
            style={[styles.item, selected ? styles.itemSelected : null]}
          >
            <Text style={[styles.title, selected ? styles.titleSelected : null]}>{scenario.title}</Text>
            <Text style={styles.body}>{scenario.description}</Text>
          </Pressable>
        );
      })}
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
    gap: astraUiTheme.spacing.sm,
  },
  item: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.lg,
    borderWidth: 1,
    gap: 4,
    padding: astraUiTheme.spacing.md,
  },
  itemSelected: {
    borderColor: astraUiTheme.colors.accent,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 14,
  },
  titleSelected: {
    color: astraUiTheme.colors.accent,
  },
});
