import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

export function PageHeader({ title, subtitle, rightSlot }: PageHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
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
  textBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 17,
  },
});
