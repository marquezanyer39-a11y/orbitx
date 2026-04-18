import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/common/PrimaryButton';
import { Screen } from '../components/common/Screen';
import { FONT } from '../constants/theme';
import { useAppTheme } from '../hooks/useAppTheme';

export default function NotFoundScreen() {
  const { colors } = useAppTheme();

  return (
    <Screen scrollable={false} contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>No encontramos esta pantalla</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Vuelve al inicio para continuar con OrbitX sin salir del flujo principal.
        </Text>
        <PrimaryButton label="Ir al inicio" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    gap: 16,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});
