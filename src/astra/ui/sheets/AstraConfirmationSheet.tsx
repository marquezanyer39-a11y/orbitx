import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AstraConfirmationSheetProps } from '../types/astraUi.types';
import { astraUiTheme, getAstraUiToneColors } from '../theme/astraUiTheme';

export function AstraConfirmationSheet({
  visible,
  title,
  body,
  tone = 'neutral',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
}: AstraConfirmationSheetProps) {
  const toneColors = getAstraUiToneColors(tone);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.sheet}>
          <View style={[styles.toneBar, { backgroundColor: toneColors.iconColor }]} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
              <Text style={styles.secondaryLabel}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              disabled={isLoading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: toneColors.iconColor },
                isLoading && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={astraUiTheme.colors.background} />
              ) : (
                <Text style={styles.primaryLabel}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: astraUiTheme.colors.overlay,
  },
  sheet: {
    borderTopLeftRadius: astraUiTheme.radii.lg,
    borderTopRightRadius: astraUiTheme.radii.lg,
    backgroundColor: astraUiTheme.colors.surface,
    borderTopWidth: 1,
    borderColor: astraUiTheme.colors.borderStrong,
    paddingHorizontal: astraUiTheme.spacing.lg,
    paddingTop: astraUiTheme.spacing.lg,
    paddingBottom: astraUiTheme.spacing.xl,
    gap: astraUiTheme.spacing.md,
  },
  toneBar: {
    width: 42,
    height: 5,
    borderRadius: astraUiTheme.radii.pill,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 18,
  },
  body: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    gap: astraUiTheme.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: astraUiTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: astraUiTheme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: astraUiTheme.colors.borderStrong,
  },
  secondaryLabel: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 14,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: astraUiTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: astraUiTheme.colors.background,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 14,
  },
  disabled: {
    opacity: 0.65,
  },
  pressed: {
    opacity: 0.84,
  },
});
