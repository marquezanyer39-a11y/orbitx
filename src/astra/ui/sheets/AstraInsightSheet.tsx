import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AstraInsightSheetProps } from '../types/astraUi.types';
import { astraUiTheme, getAstraUiToneColors } from '../theme/astraUiTheme';

export function AstraInsightSheet({
  visible,
  insight,
  primaryActionLabel,
  onPrimaryAction,
  onClose,
}: AstraInsightSheetProps) {
  const toneColors = getAstraUiToneColors(insight?.tone);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{insight?.title ?? 'Astra Insight'}</Text>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <Ionicons name="close" size={18} color={astraUiTheme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={[styles.badge, { backgroundColor: toneColors.backgroundColor, borderColor: toneColors.borderColor }]}>
              <Ionicons name="sparkles-outline" size={15} color={toneColors.iconColor} />
              <Text style={styles.badgeText}>Insight contextual</Text>
            </View>
            <Text style={styles.body}>{insight?.body ?? 'Sin contenido para mostrar.'}</Text>
            {insight?.bullets?.length ? (
              <View style={styles.bullets}>
                {insight.bullets.map((bullet) => (
                  <View key={bullet} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {insight?.caption ? <Text style={styles.caption}>{insight.caption}</Text> : null}
          </ScrollView>

          {primaryActionLabel && onPrimaryAction ? (
            <Pressable onPress={onPrimaryAction} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryLabel}>{primaryActionLabel}</Text>
            </Pressable>
          ) : null}
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
    paddingTop: astraUiTheme.spacing.sm,
    paddingBottom: astraUiTheme.spacing.xl,
    gap: astraUiTheme.spacing.md,
    maxHeight: '82%',
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: astraUiTheme.radii.pill,
    backgroundColor: astraUiTheme.colors.borderStrong,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: astraUiTheme.spacing.md,
  },
  title: {
    flex: 1,
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 18,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: astraUiTheme.colors.surfaceElevated,
  },
  content: {
    gap: astraUiTheme.spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: astraUiTheme.radii.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
  },
  body: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  bullets: {
    gap: astraUiTheme.spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: astraUiTheme.spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    backgroundColor: astraUiTheme.colors.accent,
  },
  bulletText: {
    flex: 1,
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  caption: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: astraUiTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: astraUiTheme.colors.accent,
  },
  primaryLabel: {
    color: astraUiTheme.colors.background,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
  },
});
