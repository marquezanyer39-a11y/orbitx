import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { formatUsdCents } from '../../services/rewardsPool/poolCopy';
import type {
  RewardsPoolCopy,
  RewardsPoolLeaderboardRow,
  RewardsPoolResult,
} from '../../types/rewardsPool';

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
  const { colors } = useAppTheme();

  return (
    <LinearGradient
      colors={['rgba(28, 40, 56, 0.98)', 'rgba(17, 23, 34, 0.98)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        {
          borderColor: withOpacity('#D5B26B', 0.72),
          shadowColor: '#D5B26B',
        },
      ]}
    >
      <Text style={styles.heading}>{copy.positionTitle}</Text>

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

      <View style={[styles.noteWrap, { borderTopColor: withOpacity(colors.borderStrong, 0.82) }]}>
        <View style={styles.noteIcon}>
          <Ionicons name="information-circle" size={16} color="#D5B26B" />
        </View>
        <Text style={styles.noteText}>{copy.rankingNote}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 12,
    gap: 10,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  heading: {
    color: '#F0CD87',
    fontFamily: FONT.bold,
    fontSize: 15,
    letterSpacing: 0.25,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
    columnGap: 12,
  },
  dataPoint: {
    width: '47%',
    gap: 2,
  },
  dataLabel: {
    color: '#B9C0CD',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  dataValue: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 17,
  },
  noteWrap: {
    borderTopWidth: 1,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  noteText: {
    flex: 1,
    color: '#CBD2DE',
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 14,
  },
});
