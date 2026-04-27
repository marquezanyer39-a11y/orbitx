import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useI18n } from '../../../hooks/useI18n';

interface Props {
  totalBalanceLabel: string;
  subtitle: string;
  onRefresh: () => void;
  onInfo?: () => void;
}

export function WalletHeader({ totalBalanceLabel, subtitle, onRefresh, onInfo }: Props) {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{t('walletView.headerTitle')}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{totalBalanceLabel}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>

      <View style={styles.actions}>
        {onInfo ? (
          <Pressable onPress={onInfo} hitSlop={8} style={styles.icon}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
        <Pressable onPress={onRefresh} hitSlop={8} style={styles.icon}>
          <Ionicons name="refresh-outline" size={19} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  copy: {
    flex: 1,
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 34,
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  value: {
    fontFamily: FONT.bold,
    fontSize: 45,
    lineHeight: 50,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 228,
  },
});
