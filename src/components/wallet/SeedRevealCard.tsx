import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { PrimaryButton } from '../common/PrimaryButton';

interface Props {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}

export function SeedRevealCard({
  title,
  body,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
      <View style={styles.actionsRow}>
        <PrimaryButton
          label={primaryLabel}
          tone={secondaryLabel ? 'secondary' : 'primary'}
          style={styles.actionButton}
          onPress={onPrimaryPress}
        />
        {secondaryLabel ? (
          <PrimaryButton
            label={secondaryLabel}
            tone="ghost"
            style={styles.actionButton}
            onPress={onSecondaryPress}
          />
        ) : null}
      </View>
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
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
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
