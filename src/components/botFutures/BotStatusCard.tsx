import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  statusLabel: string;
  modeLabel: string;
  exchangeLabel: string;
  summary: string;
}

export function BotStatusCard({
  statusLabel,
  modeLabel,
  exchangeLabel,
  summary,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(colors.borderStrong, 0.2),
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.statusWrap}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: withOpacity(colors.warning, 0.94) },
            ]}
          />
          <Text style={[styles.statusLabel, { color: colors.warning }]}>{statusLabel}</Text>
        </View>

        <View
          style={[
            styles.modeBadge,
            {
              backgroundColor: withOpacity(colors.primary, 0.08),
              borderColor: withOpacity(colors.primary, 0.2),
            },
          ]}
        >
          <Ionicons name="pulse-outline" size={14} color={colors.primary} />
          <Text style={[styles.modeText, { color: colors.primary }]}>{modeLabel}</Text>
        </View>
      </View>

      <Text style={[styles.exchangeLabel, { color: colors.text }]}>
        {exchangeLabel}
      </Text>
      <Text style={[styles.summary, { color: colors.textSoft }]}>{summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusLabel: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  modeText: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  exchangeLabel: {
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  summary: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
});
