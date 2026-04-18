import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  body: string;
}

export function EmptyState({ title, body }: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
