import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useI18n } from '../../hooks/useI18n';
import { formatCurrency, formatPercent } from '../../utils/format';
import { GlassCard } from '../common/GlassCard';
import { PrimaryButton } from '../common/PrimaryButton';
import { ProfitBadge } from '../common/ProfitBadge';

interface BalanceHeroCardProps {
  balanceUsd: number;
  dailyPnlUsd: number;
  dailyPnlPct: number;
  modeLabel?: string;
  onDeposit: () => void;
  onWithdraw: () => void;
  onSend: () => void;
}

export function BalanceHeroCard({
  balanceUsd,
  dailyPnlUsd,
  dailyPnlPct,
  modeLabel,
  onDeposit,
  onWithdraw,
  onSend,
}: BalanceHeroCardProps) {
  const { t } = useI18n();
  const { colors, isDark } = useAppTheme();
  const positive = dailyPnlUsd >= 0;

  return (
    <GlassCard highlighted delay={40}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{t('common.totalBalance')}</Text>
          <Text style={[styles.balance, { color: colors.text }]}>{formatCurrency(balanceUsd)}</Text>
        </View>
        {modeLabel ? <ProfitBadge value={modeLabel} positive /> : null}
      </View>

      <View style={styles.pnlRow}>
        <Text style={[styles.pnl, { color: positive ? colors.profit : colors.loss }]}>
          {formatCurrency(dailyPnlUsd)} {t('common.today')}
        </Text>
        <ProfitBadge value={formatPercent(dailyPnlPct)} positive={positive} />
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label={t('common.deposit')}
          icon={<Ionicons name="arrow-down-circle-outline" size={16} color={isDark ? colors.background : colors.backgroundAlt} />}
          onPress={onDeposit}
          style={styles.action}
        />
        <PrimaryButton
          label={t('common.withdraw')}
          icon={<Ionicons name="arrow-up-circle-outline" size={16} color={colors.textSoft} />}
          variant="secondary"
          onPress={onWithdraw}
          style={styles.action}
        />
        <PrimaryButton
          label={t('common.send')}
          icon={<Ionicons name="paper-plane-outline" size={16} color={colors.textSoft} />}
          variant="secondary"
          onPress={onSend}
          style={styles.action}
        />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  eyebrow: {
    fontFamily: FONT.medium,
    fontSize: 13,
    marginBottom: 4,
  },
  balance: {
    fontFamily: FONT.bold,
    fontSize: 34,
  },
  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  pnl: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  action: {
    flex: 1,
  },
});
