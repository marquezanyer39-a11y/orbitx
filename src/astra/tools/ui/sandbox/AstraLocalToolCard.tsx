import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { astraUiTheme } from '../../../ui/theme/astraUiTheme';
import {
  ASTRA_LOCAL_TOOL_SANDBOX_BUTTON_LABEL,
  type AstraLocalToolSandboxFixture,
} from './astraLocalToolSandboxFixtures';

export interface AstraLocalToolCardProps {
  fixture: AstraLocalToolSandboxFixture;
  disabled?: boolean;
  onRun: (fixture: AstraLocalToolSandboxFixture) => void;
}

export function AstraLocalToolCard({ fixture, disabled = false, onRun }: AstraLocalToolCardProps) {
  const payloadPreview = JSON.stringify(fixture.safePayload, null, 2);

  return (
    <View style={styles.card} testID={`astra-local-tool-card-${fixture.toolId}`}>
      <Text style={styles.title}>{fixture.title}</Text>
      <Text style={styles.toolId}>{fixture.toolId}</Text>
      <Text style={styles.description}>{fixture.description}</Text>
      <View style={styles.payloadBox}>
        <Text style={styles.payloadLabel}>Payload seguro</Text>
        <Text style={styles.payloadText}>{payloadPreview}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => onRun(fixture)}
        style={({ pressed }) => [
          styles.button,
          disabled ? styles.buttonDisabled : null,
          pressed && !disabled ? styles.buttonPressed : null,
        ]}
        testID={`astra-local-tool-run-${fixture.toolId}`}
      >
        <Text style={styles.buttonText}>{ASTRA_LOCAL_TOOL_SANDBOX_BUTTON_LABEL}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: astraUiTheme.colors.accent,
    borderRadius: astraUiTheme.radii.pill,
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: astraUiTheme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.48,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: '#051008',
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 13,
  },
  card: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.xl,
    borderWidth: 1,
    gap: astraUiTheme.spacing.sm,
    padding: astraUiTheme.spacing.md,
  },
  description: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  payloadBox: {
    backgroundColor: astraUiTheme.colors.background,
    borderColor: astraUiTheme.colors.border,
    borderRadius: astraUiTheme.radii.lg,
    borderWidth: 1,
    padding: astraUiTheme.spacing.sm,
  },
  payloadLabel: {
    color: astraUiTheme.colors.accent,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  payloadText: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 16,
  },
  toolId: {
    color: astraUiTheme.colors.accent,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
});
