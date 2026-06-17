import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { FONT, RADII, SPACING } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'compact' | 'glass';
}

export function EmptyState({
  title,
  body,
  icon,
  actionLabel,
  onAction,
  variant = 'default',
}: Props) {
  const { colors } = useAppTheme();

  const isGlass = variant === 'glass';
  const isCompact = variant === 'compact';

  return (
    <View
      style={[
        styles.container,
        isCompact && styles.containerCompact,
        isGlass && [
          styles.containerGlass,
          { backgroundColor: colors.fieldBackground, borderColor: colors.border },
        ],
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name={icon} size={isCompact ? 18 : 22} color={colors.primary} />
        </View>
      ) : null}
      <Text style={[styles.title, { color: colors.text }, isCompact && styles.titleCompact]}>
        {title}
      </Text>
      <Text style={[styles.body, { color: colors.textMuted }, isCompact && styles.bodyCompact]}>
        {body}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={[styles.action, { borderColor: colors.borderStrong }]}
        >
          <Text style={[styles.actionLabel, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  containerCompact: {
    minHeight: 72,
    paddingVertical: SPACING.md,
    gap: 4,
  },
  containerGlass: {
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 13,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  bodyCompact: {
    fontSize: 11,
    lineHeight: 16,
  },
  action: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: RADII.sm,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  actionLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
});
