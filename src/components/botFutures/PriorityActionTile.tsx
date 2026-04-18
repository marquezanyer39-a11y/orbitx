import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  featured?: boolean;
  compact?: boolean;
  badgeLabel?: string;
}

const ACTION_BLUE = '#39B8F2';

export function PriorityActionTile({
  label,
  icon,
  onPress,
  featured = false,
  compact = false,
  badgeLabel,
}: Props) {
  const { colors } = useAppTheme();
  const accent = featured ? ACTION_BLUE : colors.textSoft;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        compact ? styles.compactCard : styles.standardCard,
        {
          backgroundColor: featured
            ? withOpacity(colors.surfaceElevated, 0.88)
            : withOpacity(colors.surfaceElevated, 0.82),
          borderColor: featured
            ? withOpacity(ACTION_BLUE, 0.34)
            : withOpacity(colors.borderStrong, 0.18),
        },
        ]}
      >
      <View style={[styles.iconRow, compact ? styles.compactIconRow : null, featured ? styles.featuredRow : null]}>
        <View
          style={[
            styles.iconWrap,
            compact ? styles.compactIconWrap : null,
            {
              backgroundColor: withOpacity(accent, featured ? 0.14 : 0.1),
            },
          ]}
        >
          <Ionicons name={icon} size={compact ? 13 : 16} color={accent} />
        </View>
        {badgeLabel ? (
          <Text style={[styles.badgeLabel, { color: featured ? ACTION_BLUE : colors.textMuted }]}>
            {badgeLabel}
          </Text>
        ) : null}
      </View>

      <Text
        style={[
          compact ? styles.compactLabel : styles.label,
          featured ? styles.featuredLabel : null,
          { color: featured ? ACTION_BLUE : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
  },
  standardCard: {
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  compactCard: {
    minHeight: 48,
    paddingHorizontal: 6,
    paddingVertical: 8,
    gap: 6,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredRow: {
    justifyContent: 'center',
  },
  compactIconRow: {
    justifyContent: 'center',
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  badgeLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 16,
  },
  featuredLabel: {
    textAlign: 'center',
  },
  compactLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
});
