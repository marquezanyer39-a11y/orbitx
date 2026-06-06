import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { POOL_THEME } from './poolVisualTheme';

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
      <View style={styles.barTrack}>
        <LinearGradient
          colors={[POOL_THEME.colors.accentCyan, POOL_THEME.colors.accentTurquoise]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.barFill, { width: widthPercent }]}
        />
      </View>
      <View style={styles.percentRow}>
        <Text style={styles.percent}>{percentLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  amount: {
    color: POOL_THEME.colors.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 15,
    lineHeight: 20,
  },
  percent: {
    color: POOL_THEME.colors.accentTurquoise,
    fontFamily: FONT.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  barTrack: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: POOL_THEME.colors.progressBg,
    borderWidth: 1,
    borderColor: POOL_THEME.colors.border,
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
});
