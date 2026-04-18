import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  onForceClose: () => void;
}

export function CommandEmergencyBlock({ onForceClose }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: colors.text }]}>Bloque de Emergencia</Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: withOpacity(colors.card, 0.98),
            borderColor: withOpacity(colors.loss, 0.22),
          },
        ]}
      >
        <Text style={[styles.headline, { color: colors.loss }]}>CERRAR TODO Y DETENER</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          Salida de contencion y pausa inmediata
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={onForceClose}
          style={[
            styles.button,
            {
              backgroundColor: withOpacity(colors.loss, 0.06),
              borderColor: withOpacity(colors.loss, 0.28),
            },
          ]}
        >
          <Text style={[styles.buttonLabel, { color: colors.loss }]}>
            FORZAR CIERRE DE EMERGENCIA
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 16,
    lineHeight: 20,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  headline: {
    fontFamily: FONT.bold,
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  button: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  buttonLabel: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'center',
  },
});
