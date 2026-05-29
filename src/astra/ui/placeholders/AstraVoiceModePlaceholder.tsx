import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AstraVoiceModePlaceholderProps } from '../types/astraUi.types';
import { astraUiTheme } from '../theme/astraUiTheme';

export function AstraVoiceModePlaceholder({
  title = 'Astra Voice Mode',
  subtitle = 'Placeholder UI listo para integracion lazy. La voz real sigue fuera de Fase 3.',
  primaryLabel = 'Entendido',
  onPrimaryAction,
}: AstraVoiceModePlaceholderProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="mic-outline" size={18} color={astraUiTheme.colors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {onPrimaryAction ? (
        <Pressable onPress={onPrimaryAction} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonLabel}>{primaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: astraUiTheme.radii.md,
    borderWidth: 1,
    borderColor: astraUiTheme.colors.borderStrong,
    backgroundColor: astraUiTheme.colors.surfaceElevated,
    paddingHorizontal: astraUiTheme.spacing.lg,
    paddingVertical: astraUiTheme.spacing.lg,
    gap: astraUiTheme.spacing.sm,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: astraUiTheme.colors.accentSoft,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 16,
  },
  subtitle: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  button: {
    minHeight: 42,
    borderRadius: astraUiTheme.radii.pill,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: astraUiTheme.colors.surface,
  },
  buttonLabel: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.84,
  },
});
