import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

export function SectionHeader({ title, subtitle, rightSlot }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {rightSlot}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
});
