import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useI18n } from '../../../hooks/useI18n';
import { PrimaryButton } from '../common/PrimaryButton';

interface Props {
  network: string;
  address?: string;
  onCopy: () => void;
}

export function AddressCard({ network, address, onCopy }: Props) {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.fieldBackground,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.network, { color: colors.text }]}>{network}</Text>
      <Text style={[styles.address, { color: colors.textMuted }]}>
        {address || t('addressCard.empty')}
      </Text>
      <PrimaryButton label={t('addressCard.copy')} tone="secondary" onPress={onCopy} />
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
  network: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  address: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
});
