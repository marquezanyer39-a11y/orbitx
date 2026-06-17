import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  modeLabel: string;
}

export function ApiKeysFormCard({ modeLabel }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.86),
          borderColor: withOpacity(colors.borderStrong, 0.18),
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Paso 4: Conexion segura pendiente</Text>

      <Text style={[styles.description, { color: colors.textMuted }]}>
        La conexion de bots con exchanges estara disponible cuando QVEX habilite backend
        seguro. Nunca ingreses API Secret directamente en la app.
      </Text>

      <View
        style={[
          styles.securityBlock,
          {
            backgroundColor: withOpacity(colors.warning, 0.08),
            borderColor: withOpacity(colors.warning, 0.22),
          },
        ]}
      >
        <Text style={[styles.securityTitle, { color: colors.text }]}>Requisitos de seguridad</Text>
        <Text style={[styles.securityNote, { color: colors.textMuted }]}>
          La autorizacion futura debe pasar por backend QVEX con permisos minimos y sin firmar
          requests privadas desde la app.
        </Text>
      </View>

      <View
        style={[
          styles.modePill,
          {
            backgroundColor: withOpacity(colors.primary, 0.08),
            borderColor: withOpacity(colors.primary, 0.2),
          },
        ]}
      >
        <Text style={[styles.modePillLabel, { color: colors.textMuted }]}>Modo Activo</Text>
        <Text style={[styles.modePillValue, { color: colors.primary }]}>{modeLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  fieldGroup: {
    gap: 8,
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  securityBlock: {
    borderRadius: RADII.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  securityTitle: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 16,
  },
  securityNote: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  modePill: {
    alignSelf: 'flex-start',
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  modePillLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modePillValue: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 16,
  },
});
