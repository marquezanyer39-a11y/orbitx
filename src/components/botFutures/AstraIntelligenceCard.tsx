import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  marketState: string;
  suggestedAction: string;
  estimatedRisk: string;
  optimalZone: string;
  confirmation: string;
  invalidation: string;
}

const ACTION_BLUE = '#39B8F2';

function DataRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.dataRow}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

export function AstraIntelligenceCard({
  marketState,
  suggestedAction,
  estimatedRisk,
  optimalZone,
  confirmation,
  invalidation,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(colors.borderStrong, 0.16),
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Astra Intelligence Panel</Text>

      <View
        style={[
          styles.innerPanel,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.8),
            borderColor: withOpacity(colors.borderStrong, 0.16),
          },
        ]}
      >
        <View style={styles.liveRow}>
          <Ionicons name="flash" size={14} color={ACTION_BLUE} />
          <Text style={[styles.liveLabel, { color: ACTION_BLUE }]}>ASTRA LIVE</Text>
          <View style={[styles.liveDot, { backgroundColor: ACTION_BLUE }]} />
        </View>

        <Text style={[styles.headline, { color: colors.text }]}>ANALISIS DE MERCADO</Text>

        <View style={styles.grid}>
          <DataRow label="Estado Mercado" value={marketState} accent={colors.textSoft} />
          <DataRow label="Accion Sugerida" value={suggestedAction} accent={colors.warning} />
          <DataRow label="Riesgo Estimado" value={estimatedRisk} accent={colors.textSoft} />
          <DataRow label="Zona OPTIMA" value={optimalZone} accent={colors.text} />
          <DataRow label="Confirmacion" value={confirmation} accent={colors.textSoft} />
          <DataRow label="Invalidacion" value={invalidation} accent={colors.textSoft} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 17,
    lineHeight: 21,
  },
  innerPanel: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headline: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 17,
  },
  grid: {
    gap: 6,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldLabel: {
    fontFamily: FONT.regular,
    fontSize: 10,
    lineHeight: 13,
  },
  fieldValue: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    textAlign: 'right',
  },
});
