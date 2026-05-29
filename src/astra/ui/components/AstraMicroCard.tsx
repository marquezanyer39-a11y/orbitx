import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AstraMicroCardProps } from '../types/astraUi.types';
import { astraUiTheme, getAstraUiToneColors } from '../theme/astraUiTheme';

export function AstraMicroCard({ insight, accessoryLabel, onPress }: AstraMicroCardProps) {
  const toneColors = getAstraUiToneColors(insight.tone);

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: toneColors.borderColor,
          backgroundColor: astraUiTheme.colors.surfaceElevated,
        },
        onPress && pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: toneColors.backgroundColor }]}>
        <Ionicons name="sparkles-outline" size={16} color={toneColors.iconColor} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.body}>{insight.body}</Text>
        {insight.caption ? <Text style={styles.caption}>{insight.caption}</Text> : null}
      </View>
      {accessoryLabel ? <Text style={styles.accessory}>{accessoryLabel}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    borderRadius: astraUiTheme.radii.md,
    borderWidth: 1,
    paddingHorizontal: astraUiTheme.spacing.md,
    paddingVertical: astraUiTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: astraUiTheme.spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 14,
  },
  body: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  caption: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 11,
    lineHeight: 16,
  },
  accessory: {
    color: astraUiTheme.colors.accent,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
