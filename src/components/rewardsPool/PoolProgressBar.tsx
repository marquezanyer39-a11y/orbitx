import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';

interface Props {
  amountLabel: string;
  percentLabel: string;
  progressPercent: number;
}

export function PoolProgressBar({ amountLabel, percentLabel, progressPercent }: Props) {
  const widthPercent = `${Math.min(Math.max(progressPercent, 0), 100)}%` as `${number}%`;

  return (
    <View style={styles.wrap}>
      <Text style={styles.amount}>{amountLabel}</Text>
      <View style={styles.progressRow}>
        <View style={styles.barTrack}>
          <LinearGradient
            colors={['#1EF1FF', '#37D6FF', '#67D8FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: widthPercent }]}
          />
        </View>
        <Text style={styles.percent}>{percentLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  amount: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 24,
    lineHeight: 28,
  },
  percent: {
    color: '#33E4FF',
    fontFamily: FONT.bold,
    fontSize: 16,
    lineHeight: 18,
  },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: RADII.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: withOpacity('#22E8FF', 0.14),
  },
  barFill: {
    height: '100%',
    borderRadius: RADII.pill,
    shadowColor: '#22E8FF',
    shadowOpacity: 0.26,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
