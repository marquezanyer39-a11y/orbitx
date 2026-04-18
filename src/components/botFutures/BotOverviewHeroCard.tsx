import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { ExchangeAvailabilityPill } from './ExchangeAvailabilityPill';

interface Props {
  title: string;
  subtitle: string;
  exchangeLabel: string;
  modeLabel: string;
}

export function BotOverviewHeroCard({
  title,
  subtitle,
  exchangeLabel,
  modeLabel,
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
        <ExchangeAvailabilityPill label={exchangeLabel} tone="featured" />
        <ExchangeAvailabilityPill label={modeLabel} tone="planned" />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSoft }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
});
