import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface SettingRowProps {
  title: string;
  description?: string;
  trailing?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export function SettingRow({
  title,
  description,
  trailing,
  icon = 'chevron-forward',
  onPress,
}: SettingRowProps) {
  const { colors } = useAppTheme();

  const content = (
    <>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {description ? (
          <Text numberOfLines={2} style={[styles.description, { color: colors.textMuted }]}>
            {description}
          </Text>
        ) : null}
      </View>
      <View style={styles.trailingWrap}>
        {trailing ? <Text style={[styles.trailing, { color: colors.textSoft }]}>{trailing}</Text> : null}
        <Ionicons name={icon} size={16} color={colors.textMuted} />
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.row, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    minHeight: 54,
    borderRadius: RADII.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  trailingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trailing: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
});
