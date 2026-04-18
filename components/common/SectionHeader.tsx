import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

export function SectionHeader({ title, subtitle, rightSlot }: SectionHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {rightSlot ? <View>{rightSlot}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
});
