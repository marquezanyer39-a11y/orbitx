import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import type { RewardsPoolCopy } from '../../types/rewardsPool';

const REWARDS = [
  { key: 'rank1', label: '🥇', percent: '30%', color: '#E8C168' },
  { key: 'rank2', label: '🥈', percent: '12%', color: '#D0D8E4' },
  { key: 'rank3', label: '🥉', percent: '6%', color: '#C78958' },
  { key: 'rank4', label: '4°', percent: '2%', color: '#A8B5C7' },
];

interface Props {
  copy: RewardsPoolCopy;
}

export function RewardsBreakdown({ copy }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{copy.rewardsTitle}</Text>
      <View style={styles.row}>
        {REWARDS.map((item) => (
          <View key={item.key} style={styles.item}>
            <Text style={[styles.medal, { color: item.color }]}>{item.label}</Text>
            <Text style={styles.percent}>{item.percent}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.extra}>{copy.rewardsExtra}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  title: {
    color: '#C4CFDF',
    fontFamily: FONT.bold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  medal: {
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  percent: {
    color: '#FFFFFF',
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  extra: {
    color: '#9AA6B8',
    fontFamily: FONT.medium,
    fontSize: 11,
    textAlign: 'center',
  },
});
