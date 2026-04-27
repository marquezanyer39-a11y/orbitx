import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';

interface RewardsPoolCardProps {
  currentAmountLabel: string;
  targetAmountLabel: string;
  progressPercent: number;
  progressLabel: string;
  remainingLabel: string;
  onParticipate: () => void;
}

function RewardsIllustration() {
  return (
    <View style={styles.illustrationWrap}>
      <View style={styles.orbitRingOuter} />
      <View style={styles.orbitRingInner} />
      <LinearGradient
        colors={['rgba(30,220,139,0.26)', 'rgba(30,220,139,0.06)']}
        style={styles.cubeGlow}
      />
      <LinearGradient colors={['#21F29B', '#13A962']} style={styles.cubeFront} />
      <View style={styles.cubeTop} />
      <View style={styles.cubeSide} />
      <View style={[styles.coin, styles.coinLeft]} />
      <View style={[styles.coin, styles.coinRight]} />
    </View>
  );
}

export function RewardsPoolCard({
  currentAmountLabel,
  targetAmountLabel,
  progressPercent,
  progressLabel,
  remainingLabel,
  onParticipate,
}: RewardsPoolCardProps) {
  return (
    <LinearGradient
      colors={['#121720', '#0F141B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.copyColumn}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pozo mensual</Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>Pozo de recompensas</Text>
          <Ionicons name="information-circle-outline" size={16} color="#9AA4B2" />
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amount}>{currentAmountLabel}</Text>
          <Text style={styles.target}>{targetAmountLabel}</Text>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(progressPercent, 100))}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{progressLabel}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.remainingRow}>
            <Ionicons name="time-outline" size={14} color="#9AA4B2" />
            <Text style={styles.remainingLabel}>{remainingLabel}</Text>
          </View>

          <Pressable onPress={onParticipate} style={styles.ctaButton}>
            <Text style={styles.ctaLabel}>Participar</Text>
          </Pressable>
        </View>
      </View>

      <RewardsIllustration />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 182,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#232634',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  copyColumn: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    minHeight: 24,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
    backgroundColor: withOpacity('#1EDC8B', 0.12),
    justifyContent: 'center',
  },
  badgeText: {
    color: '#1EDC8B',
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  title: {
    color: '#F5F7FA',
    fontFamily: FONT.semibold,
    fontSize: 24,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 8,
  },
  amount: {
    color: '#F5F7FA',
    fontFamily: FONT.bold,
    fontSize: 34,
    letterSpacing: -0.8,
  },
  target: {
    color: '#9AA4B2',
    fontFamily: FONT.medium,
    fontSize: 18,
  },
  progressRow: {
    marginTop: 12,
    gap: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: RADII.pill,
    backgroundColor: '#232634',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADII.pill,
    backgroundColor: '#1EDC8B',
  },
  progressLabel: {
    color: '#1EDC8B',
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  footerRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  remainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  remainingLabel: {
    color: '#9AA4B2',
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  ctaButton: {
    minWidth: 118,
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: '#1EDC8B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  ctaLabel: {
    color: '#07130E',
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  illustrationWrap: {
    width: 132,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbitRingOuter: {
    position: 'absolute',
    bottom: 22,
    width: 112,
    height: 22,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: withOpacity('#1EDC8B', 0.32),
    backgroundColor: withOpacity('#1EDC8B', 0.05),
  },
  orbitRingInner: {
    position: 'absolute',
    bottom: 28,
    width: 86,
    height: 16,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: withOpacity('#1EDC8B', 0.22),
  },
  cubeGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 28,
  },
  cubeFront: {
    width: 58,
    height: 58,
    borderRadius: 16,
    transform: [{ rotate: '12deg' }],
    borderWidth: 1,
    borderColor: withOpacity('#F5F7FA', 0.22),
  },
  cubeTop: {
    position: 'absolute',
    top: 26,
    width: 42,
    height: 42,
    borderRadius: 12,
    transform: [{ rotate: '45deg' }],
    borderWidth: 1,
    borderColor: withOpacity('#F5F7FA', 0.18),
    backgroundColor: withOpacity('#1EDC8B', 0.12),
  },
  cubeSide: {
    position: 'absolute',
    top: 44,
    right: 36,
    width: 26,
    height: 38,
    borderRadius: 10,
    transform: [{ skewY: '-16deg' }],
    backgroundColor: withOpacity('#0F5E39', 0.68),
  },
  coin: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#F3C66F',
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.3),
  },
  coinLeft: {
    left: 12,
    top: 48,
  },
  coinRight: {
    right: 8,
    top: 42,
  },
});
