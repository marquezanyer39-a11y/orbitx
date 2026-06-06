import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { formatUsdCents } from '../../services/rewardsPool/poolCopy';
import type {
  RewardsPoolCopy,
  RewardsPoolLeaderboardRow,
  RewardsPoolResult,
} from '../../types/rewardsPool';
import { POOL_THEME } from './poolVisualTheme';

interface Props {
  copy: RewardsPoolCopy;
  language: RewardsPoolCopy['language'];
  row: RewardsPoolLeaderboardRow | null;
  result: RewardsPoolResult | null;
}

function DataPoint({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.dataPoint}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

export function UserPoolPositionCard({ copy, language, row, result }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>
        {copy.positionTitle}
      </Text>

      <View style={styles.grid}>
        <DataPoint
          label={copy.realContribution}
          value={row ? formatUsdCents(language, row.aporteUsdCents) : '--'}
        />
        <DataPoint
          label={copy.rankingContribution}
          value={row ? formatUsdCents(language, row.aporteRankingUsdCents) : '--'}
        />
        <DataPoint label={copy.positionLabel} value={row ? `#${row.position}` : '--'} />
        <DataPoint
          label={copy.estimatedReward}
          value={result ? formatUsdCents(language, result.totalRewardCents) : '--'}
        />
      </View>

      <View style={styles.noteWrap}>
        <Ionicons name="information-circle-outline" size={15} color={POOL_THEME.colors.textMuted} />
        <Text style={styles.noteText}>
          {copy.rankingNote}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: POOL_THEME.colors.border,
    backgroundColor: POOL_THEME.colors.cardPrimary,
    padding: 12,
    gap: 12,
  },
  heading: {
    color: POOL_THEME.colors.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    columnGap: 10,
  },
  dataPoint: {
    width: '48%',
    minHeight: 64,
    borderRadius: POOL_THEME.radius.cardInner,
    borderWidth: 1,
    borderColor: POOL_THEME.colors.border,
    backgroundColor: POOL_THEME.colors.cardSecondary,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 4,
  },
  dataLabel: {
    color: POOL_THEME.colors.textSecondary,
    fontFamily: FONT.semibold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dataValue: {
    color: POOL_THEME.colors.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 15,
    lineHeight: 19,
  },
  noteWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteText: {
    flex: 1,
    color: POOL_THEME.colors.textMuted,
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
});
