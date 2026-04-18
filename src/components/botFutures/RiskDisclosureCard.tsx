import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  body: string;
  emphasis?: boolean;
}

export function RiskDisclosureCard({ title, body, emphasis = false }: Props) {
  const { colors } = useAppTheme();
  const accent = emphasis ? colors.warning : colors.borderStrong;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(accent, emphasis ? 0.28 : 0.18),
        },
      ]}
    >
      <Text style={[styles.title, { color: emphasis ? colors.warning : colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.body, { color: colors.textSoft }]}>{body}</Text>
      <Text style={[styles.note, { color: emphasis ? colors.warning : colors.textMuted }]}>
        OrbitX y Astra brindan analisis, senales y asistencia operativa. La responsabilidad final
        de entrada, salida y gestion del riesgo pertenece al usuario.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 16,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  note: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
});
