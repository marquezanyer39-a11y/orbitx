import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { BotControlBar } from './BotControlBar';

interface Props {
  stance: string;
  action: string;
  context: string;
  entryGuide?: string;
  managementGuide?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export function AstraLivePanel({
  stance,
  action,
  context,
  entryGuide,
  managementGuide,
  onPrimary,
  onSecondary,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(colors.primary, 0.2),
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.orb, { backgroundColor: withOpacity(colors.primary, 0.14) }]} />
        <View style={styles.copy}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Astra Live Desk</Text>
          <Text style={[styles.stance, { color: colors.text }]}>{stance}</Text>
        </View>
      </View>

      <Text style={[styles.action, { color: colors.primary }]}>{action}</Text>
      <Text style={[styles.context, { color: colors.textSoft }]}>{context}</Text>

      {entryGuide ? (
        <View
          style={[
            styles.planCard,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.84),
              borderColor: withOpacity(colors.borderStrong, 0.16),
            },
          ]}
        >
          <Text style={[styles.planLabel, { color: colors.textMuted }]}>Zona e invalidacion</Text>
          <Text style={[styles.planText, { color: colors.textSoft }]}>{entryGuide}</Text>
        </View>
      ) : null}

      {managementGuide ? (
        <View
          style={[
            styles.planCard,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.84),
              borderColor: withOpacity(colors.borderStrong, 0.16),
            },
          ]}
        >
          <Text style={[styles.planLabel, { color: colors.textMuted }]}>Gestion sugerida</Text>
          <Text style={[styles.planText, { color: colors.textSoft }]}>{managementGuide}</Text>
        </View>
      ) : null}

      {onPrimary && onSecondary ? (
        <BotControlBar
          primaryLabel="Ver senales"
          secondaryLabel="Ver actividad"
          onPrimary={onPrimary}
          onSecondary={onSecondary}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orb: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  stance: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  action: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  context: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  planCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  planLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  planText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
});
