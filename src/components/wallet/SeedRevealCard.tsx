import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { PrimaryButton } from '../common/PrimaryButton';

interface Props {
  body: string;
  onReveal: () => void;
}

export function SeedRevealCard({ body, onReveal }: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Ver frase semilla</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
      <PrimaryButton label="Reautenticar y ver" tone="secondary" onPress={onReveal} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
});
