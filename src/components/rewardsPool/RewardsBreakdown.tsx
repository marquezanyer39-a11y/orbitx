import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import type { RewardsPoolCopy } from '../../types/rewardsPool';
import { POOL_THEME } from './poolVisualTheme';

const REWARDS = [
  { key: 'rank1', label: 'TOP 1', percent: '30%', color: POOL_THEME.colors.accentGold },
  { key: 'rank2', label: 'TOP 2', percent: '12%', color: POOL_THEME.colors.accentSilver },
  { key: 'rank3', label: 'TOP 3', percent: '6%', color: POOL_THEME.colors.accentBronze },
  { key: 'rank4', label: '4° PUESTO', percent: '2%', color: POOL_THEME.colors.textSecondary },
];

interface Props {
  copy: RewardsPoolCopy;
}

export function RewardsBreakdown({ copy }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>
        {copy.rewardsTitle}
      </Text>
      <View style={styles.row}>
        {REWARDS.map((item) => (
          <View key={item.key} style={styles.item}>
            <Text style={[styles.rankLabel, { color: item.color }]}>{item.label}</Text>
            <Text style={styles.percent}>{item.percent}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.extra}>
        {copy.rewardsExtra}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  title: {
    color: POOL_THEME.colors.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  item: {
    width: '23%',
    minHeight: 70,
    borderRadius: POOL_THEME.radius.cardInner,
    borderWidth: 1,
    borderColor: POOL_THEME.colors.border,
    backgroundColor: POOL_THEME.colors.cardPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  rankLabel: {
    fontFamily: FONT.bold,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  percent: {
    color: POOL_THEME.colors.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 19,
    lineHeight: 23,
  },
  extra: {
    color: POOL_THEME.colors.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
