import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  subtitle: string;
  onBack: () => void;
}

export function BotFuturesWizardHeader({ title, subtitle, onBack }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backRow}>
        <Ionicons name="chevron-back" size={14} color={colors.textMuted} />
        <Text style={[styles.backLabel, { color: colors.textMuted }]}>Back</Text>
      </Pressable>

      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>

      <View
        style={[
          styles.divider,
          {
            backgroundColor: withOpacity(colors.borderStrong, 0.12),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 14,
  },
  copy: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 30,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
