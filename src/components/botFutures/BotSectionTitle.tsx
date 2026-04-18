import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  subtitle?: string;
}

export function BotSectionTitle({ title, subtitle }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 18,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
});
