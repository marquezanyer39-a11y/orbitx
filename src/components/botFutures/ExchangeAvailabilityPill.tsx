import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

type Tone = 'featured' | 'planned' | 'soon';

interface Props {
  label: string;
  tone?: Tone;
}

export function ExchangeAvailabilityPill({ label, tone = 'planned' }: Props) {
  const { colors } = useAppTheme();
  const tint =
    tone === 'featured'
      ? colors.primary
      : tone === 'soon'
        ? colors.textMuted
        : colors.warning;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: withOpacity(tint, 0.12),
          borderColor: withOpacity(tint, 0.22),
        },
      ]}
    >
      <Text style={[styles.label, { color: tint }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
