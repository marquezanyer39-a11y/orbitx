import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  hint: string;
  tone?: 'watch' | 'action' | 'risk';
}

export function AstraLiveHintCard({ title, hint, tone = 'watch' }: Props) {
  const { colors } = useAppTheme();
  const accent =
    tone === 'risk' ? colors.warning : tone === 'action' ? colors.primary : colors.textMuted;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(accent, tone === 'risk' ? 0.08 : 0.06),
          borderColor: withOpacity(accent, tone === 'risk' ? 0.18 : 0.14),
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>Astra tactical note</Text>
      <Text style={[styles.title, { color: accent }]}>{title}</Text>
      <Text style={[styles.hint, { color: colors.textSoft }]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  hint: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
});
