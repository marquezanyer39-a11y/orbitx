import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useI18n } from '../../../hooks/useI18n';
import { PrimaryButton } from '../common/PrimaryButton';

interface Props {
  body: string;
  onReveal: () => void;
}

export function SeedRevealCard({ body, onReveal }: Props) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  return (
    <View style={[styles.card, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('seedReveal.title')}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
      <PrimaryButton label={t('seedReveal.button')} tone="secondary" onPress={onReveal} />
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
