import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { MiniSparkline } from './MiniSparkline';

interface BalanceHeroProps {
  amountLabel: string;
  deltaLabel: string;
  positive?: boolean;
  rangeLabel?: string;
  hidden?: boolean;
  series: number[];
  loading?: boolean;
  cacheLabel?: string | null;
  onToggleVisibility: () => void;
  onViewAnalysis: () => void;
}

export function BalanceHero({
  amountLabel,
  deltaLabel,
  positive = true,
  rangeLabel = '24h',
  hidden = false,
  series,
  loading = false,
  cacheLabel,
  onToggleVisibility,
  onViewAnalysis,
}: BalanceHeroProps) {
  const accent = positive ? '#1EDC8B' : '#FF5A67';
  const displayAmount = hidden ? '••••••' : amountLabel;
  const displayDelta = hidden ? '••••••' : deltaLabel;

  return (
    <LinearGradient
      colors={['#11131A', '#0E1118']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <Text style={styles.title}>Balance total</Text>
          <Pressable onPress={onToggleVisibility} style={styles.eyeButton}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={15}
              color="#9AA4B2"
            />
          </Pressable>
        </View>

        <Pressable onPress={onViewAnalysis} style={styles.analysisButton}>
          <Text style={styles.analysisLabel}>Ver analisis</Text>
          <Ionicons name="chevron-forward" size={14} color="#F5F7FA" />
        </Pressable>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.copyBlock}>
          {loading ? (
            <>
              <View style={styles.amountSkeleton} />
              <View style={styles.deltaSkeleton} />
            </>
          ) : (
            <>
              <Text style={styles.amount}>{displayAmount}</Text>
              <View style={styles.deltaRow}>
                <Text style={[styles.delta, { color: accent }]}>{displayDelta}</Text>
                <Text style={styles.rangeLabel}>{rangeLabel}</Text>
              </View>
            </>
          )}

          {cacheLabel ? <Text style={styles.cacheLabel}>{cacheLabel}</Text> : null}
        </View>

        <View style={styles.chartWrap}>
          {loading ? (
            <View style={styles.chartSkeleton} />
          ) : (
            <MiniSparkline
              data={series}
              width={140}
              height={74}
              color="#1EDC8B"
              negativeColor="#FF5A67"
              positive={positive}
              barWidth={4}
              barGap={2}
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: '#232634',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#F5F7FA',
    fontFamily: FONT.medium,
    fontSize: 15,
  },
  eyeButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisButton: {
    minHeight: 32,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    backgroundColor: withOpacity('#F5F7FA', 0.04),
    borderWidth: 1,
    borderColor: '#232634',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  analysisLabel: {
    color: '#F5F7FA',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  copyBlock: {
    flex: 1,
    gap: 10,
  },
  amount: {
    color: '#F5F7FA',
    fontFamily: FONT.bold,
    fontSize: 42,
    letterSpacing: -1.2,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  delta: {
    fontFamily: FONT.semibold,
    fontSize: 18,
  },
  rangeLabel: {
    color: '#9AA4B2',
    fontFamily: FONT.medium,
    fontSize: 15,
  },
  cacheLabel: {
    color: '#9AA4B2',
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  chartWrap: {
    paddingBottom: 6,
  },
  amountSkeleton: {
    width: 166,
    height: 42,
    borderRadius: 14,
    backgroundColor: withOpacity('#F5F7FA', 0.08),
  },
  deltaSkeleton: {
    width: 148,
    height: 18,
    borderRadius: 999,
    backgroundColor: withOpacity('#F5F7FA', 0.08),
  },
  chartSkeleton: {
    width: 140,
    height: 74,
    borderRadius: 16,
    backgroundColor: withOpacity('#1EDC8B', 0.08),
    borderWidth: 1,
    borderColor: withOpacity('#1EDC8B', 0.14),
  },
});
