import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import type { RewardsPoolCopy, RewardsPoolStatus } from '../../types/rewardsPool';

interface Props {
  status: RewardsPoolStatus;
  copy: RewardsPoolCopy;
}

export function PoolStateBanner({ status, copy }: Props) {
  if (status === 'open') {
    return null;
  }

  const message =
    status === 'full'
      ? copy.fullBanner
      : status === 'expired'
        ? copy.expiredBanner
        : status === 'distributing'
          ? copy.distributingBanner
          : copy.finalizedBanner;
  const colors =
    status === 'finalized'
      ? (['rgba(0, 255, 163, 0.16)', 'rgba(16, 39, 33, 0.95)'] as [string, string])
      : status === 'distributing'
        ? (['rgba(34, 232, 255, 0.16)', 'rgba(15, 32, 42, 0.95)'] as [string, string])
        : (['rgba(255, 196, 102, 0.16)', 'rgba(46, 34, 20, 0.95)'] as [string, string]);

  return (
    <LinearGradient colors={colors} style={styles.banner}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={status === 'finalized' ? 'checkmark-circle' : 'information-circle'}
          size={16}
          color={status === 'finalized' ? '#00FFA3' : '#FFCF80'}
        />
      </View>
      <Text style={styles.message}>{message}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: withOpacity('#22E8FF', 0.14),
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  message: {
    flex: 1,
    color: '#F2F7FF',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 15,
  },
});
