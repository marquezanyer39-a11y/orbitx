import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

export function LoadingState({
  title = 'Actualizando',
  body = 'OrbitX esta sincronizando la informacion.',
}: {
  title?: string;
  body?: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 140,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 12,
    textAlign: 'center',
  },
});
