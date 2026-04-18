import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { FONT } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { radii } from '../../constants/spacing';

interface Props extends Omit<ComponentProps<typeof Pressable>, 'children' | 'style'> {
  label: string;
  tone?: 'primary' | 'secondary' | 'buy' | 'sell' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({ label, tone = 'primary', icon, style, ...props }: Props) {
  const { colors } = useAppTheme();

  const palette =
    tone === 'buy'
      ? { backgroundColor: colors.profit, borderColor: colors.profit, textColor: colors.background }
      : tone === 'sell'
        ? { backgroundColor: colors.loss, borderColor: colors.loss, textColor: colors.background }
        : tone === 'secondary'
          ? {
              backgroundColor: colors.fieldBackground,
              borderColor: colors.border,
              textColor: colors.text,
            }
          : tone === 'ghost'
            ? {
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                textColor: colors.textMuted,
              }
            : { backgroundColor: colors.primary, borderColor: colors.primary, textColor: colors.background };

  return (
    <Pressable
      {...props}
      style={[
        styles.button,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: props.disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Ionicons name={icon} size={16} color={palette.textColor} /> : null}
        <Text style={[styles.label, { color: palette.textColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
});
