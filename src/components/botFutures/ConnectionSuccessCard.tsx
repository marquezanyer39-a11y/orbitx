import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  exchange: string;
  mode: string;
  body: string;
}

export function ConnectionSuccessCard({ exchange, mode, body }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.86),
          borderColor: withOpacity(colors.profit, 0.22),
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: withOpacity(colors.profit, 0.12) }]}>
        <Ionicons name="checkmark-circle" size={34} color={colors.profit} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Conexion Exitosa</Text>
      <Text style={[styles.body, { color: colors.textSoft }]}>{body}</Text>

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: withOpacity(colors.backgroundAlt, 0.94),
            borderColor: withOpacity(colors.borderStrong, 0.16),
          },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: colors.textMuted }]}>Resumen</Text>
        <Text style={[styles.summaryLine, { color: colors.text }]}>Exchange: {exchange}</Text>
        <Text style={[styles.summaryLine, { color: colors.text }]}>Modo: {mode}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  summaryTitle: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 15,
  },
  summaryLine: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 17,
  },
});
