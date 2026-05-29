import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AstraAlertBannerProps } from '../types/astraUi.types';
import { astraUiTheme, getAstraUiToneColors } from '../theme/astraUiTheme';

export function AstraAlertBanner({
  visible = true,
  title,
  message,
  tone = 'warning',
  actionLabel,
  onAction,
  onDismiss,
}: AstraAlertBannerProps) {
  if (!visible) {
    return null;
  }

  const toneColors = getAstraUiToneColors(tone);

  return (
    <View style={[styles.banner, { borderColor: toneColors.borderColor, backgroundColor: toneColors.backgroundColor }]}>
      <View style={styles.leading}>
        <Ionicons name="alert-circle-outline" size={18} color={toneColors.iconColor} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {onDismiss ? (
        <Pressable onPress={onDismiss} style={({ pressed }) => [styles.dismiss, pressed && styles.pressed]}>
          <Ionicons name="close" size={16} color={astraUiTheme.colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 64,
    borderRadius: astraUiTheme.radii.md,
    borderWidth: 1,
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: astraUiTheme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: astraUiTheme.spacing.sm,
  },
  leading: {
    marginTop: 2,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 13,
  },
  message: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  action: {
    minHeight: 34,
    borderRadius: astraUiTheme.radii.pill,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: astraUiTheme.colors.surfaceElevated,
  },
  actionText: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
  },
  dismiss: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
});
