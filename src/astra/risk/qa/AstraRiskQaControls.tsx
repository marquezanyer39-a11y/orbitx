import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../ui/theme/astraUiTheme';

export interface AstraRiskQaControlsProps {
  onEmitOnce: () => void;
  onEmitDuplicate: () => void;
  onSimulateCooldownActive: () => void;
  onSimulateCooldownExpired: () => void;
  onReset: () => void;
}

const BUTTONS = [
  ['Emitir una vez', 'onEmitOnce'],
  ['Emitir duplicado', 'onEmitDuplicate'],
  ['Simular cooldown activo', 'onSimulateCooldownActive'],
  ['Simular cooldown expirado', 'onSimulateCooldownExpired'],
  ['Reset QA state', 'onReset'],
] as const;

export function AstraRiskQaControls(props: AstraRiskQaControlsProps) {
  return (
    <View style={styles.container} testID="astra-risk-qa-controls">
      {BUTTONS.map(([label, handlerKey]) => (
        <Pressable
          accessibilityRole="button"
          key={label}
          onPress={props[handlerKey]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: astraUiTheme.spacing.sm,
  },
  buttonText: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: astraUiTheme.spacing.sm,
  },
});
