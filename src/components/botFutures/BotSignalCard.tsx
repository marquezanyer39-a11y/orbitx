import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { ExchangeAvailabilityPill } from './ExchangeAvailabilityPill';

interface Props {
  title: string;
  action: string;
  summary: string;
  riskNote: string;
  executionPlan?: string;
}

export function BotSignalCard({
  title,
  action,
  summary,
  riskNote,
  executionPlan,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(colors.borderStrong, 0.18),
        },
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <ExchangeAvailabilityPill label={action} tone="planned" />
      </View>
      <Text style={[styles.summary, { color: colors.textSoft }]}>{summary}</Text>
      {executionPlan ? (
        <Text style={[styles.executionPlan, { color: colors.text }]}>{executionPlan}</Text>
      ) : null}
      <Text style={[styles.riskNote, { color: colors.warning }]}>{riskNote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 17,
  },
  summary: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  executionPlan: {
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  riskNote: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
});
