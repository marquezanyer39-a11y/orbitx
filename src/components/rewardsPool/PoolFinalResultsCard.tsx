import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatUsdCents } from '../../services/rewardsPool/poolCopy';
import type {
  RewardsPoolCopy,
  RewardsPoolFinalSummary,
  RewardsPoolLeaderboardRow,
  RewardsPoolResult,
} from '../../types/rewardsPool';
import { PrimaryButton } from '../common/PrimaryButton';

interface Props {
  copy: RewardsPoolCopy;
  language: RewardsPoolCopy['language'];
  summary: RewardsPoolFinalSummary | null;
  top4: RewardsPoolLeaderboardRow[];
  currentUserResult: RewardsPoolResult | null;
  onWallet: () => void;
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

export function PoolFinalResultsCard({
  copy,
  language,
  summary,
  top4,
  currentUserResult,
  onWallet,
}: Props) {
  const { colors } = useAppTheme();

  if (!summary) {
    return null;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.96),
          borderColor: withOpacity(colors.profit, 0.18),
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{copy.finalResultsTitle}</Text>

      <SummaryRow
        label={copy.totalRaised}
        value={formatUsdCents(language, summary.totalPoolUsdCents)}
      />
      <SummaryRow
        label={copy.houseFee}
        value={formatUsdCents(language, summary.houseFeeUsdCents)}
      />
      <SummaryRow
        label={copy.distributed}
        value={formatUsdCents(language, summary.distributableUsdCents)}
      />
      <SummaryRow
        label={copy.yourReward}
        value={
          currentUserResult
            ? formatUsdCents(language, currentUserResult.totalRewardCents)
            : '--'
        }
      />

      <View style={styles.top4Wrap}>
        {top4.map((row) => (
          <View key={`${row.entryId}-final`} style={styles.top4Row}>
            <Text style={[styles.top4Label, { color: colors.textMuted }]}>
              #{row.position} {row.maskedCode}
            </Text>
            <Text style={[styles.top4Value, { color: colors.text }]}>
              {formatUsdCents(language, row.aporteUsdCents)}
            </Text>
          </View>
        ))}
      </View>

      <PrimaryButton label={copy.walletCta} onPress={onWallet} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    padding: 16,
    gap: 12,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    color: '#9FA7B8',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  top4Wrap: {
    gap: 8,
    paddingTop: 4,
  },
  top4Row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  top4Label: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  top4Value: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
});
