import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../../constants/theme';
import { PoolCountdownPill } from '../../../components/rewardsPool/PoolCountdownPill';
import { PoolProgressBar } from '../../../components/rewardsPool/PoolProgressBar';
import { POOL_THEME } from '../../../components/rewardsPool/poolVisualTheme';

interface Props {
  title: string;
  subtitle: string;
  countdownLabel: string;
  amountLabel: string;
  percentLabel: string;
  progressPercent: number;
}

export function PoolHeroCard({
  title,
  subtitle,
  countdownLabel,
  amountLabel,
  percentLabel,
  progressPercent,
}: Props) {
  return (
    <LinearGradient
      colors={['rgba(18,19,26,0.98)', 'rgba(21,23,36,0.96)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroTop}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.heroBody} numberOfLines={2}>{subtitle}</Text>
        </View>
        <PoolCountdownPill label={countdownLabel} />
      </View>

      <PoolProgressBar
        amountLabel={amountLabel}
        percentLabel={percentLabel}
        progressPercent={progressPercent}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: POOL_THEME.colors.border,
    padding: 16,
    gap: 18,
    overflow: 'hidden',
  },
  heroTop: {
    gap: 10,
  },
  heroCopy: {
    minWidth: 0,
    gap: 4,
  },
  heroTitle: {
    color: POOL_THEME.colors.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 19,
    lineHeight: 24,
    flexShrink: 1,
  },
  heroBody: {
    color: POOL_THEME.colors.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 18,
  },
});
