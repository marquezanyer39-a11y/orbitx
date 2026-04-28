import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { MiniSparkline } from './MiniSparkline';
import { ORBITX_THEME } from './orbitxTheme';

interface BalanceHeroProps {
  amountLabel: string;
  deltaLabel: string;
  positive?: boolean;
  rangeLabel?: string;
  hidden?: boolean;
  series: number[];
  loading?: boolean;
  cacheLabel?: string | null;
  contentWidth: number;
  isSmallPhone?: boolean;
  onToggleVisibility: () => void;
  onViewAnalysis: () => void;
}

function compactBalance(value: string) {
  const clean = (value || 'USD 0.00').replace(/\s+/g, ' ').trim();
  return clean.replace(/(\d)\.\s+(\d+)/g, '$1.$2');
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
  contentWidth,
  isSmallPhone = false,
  onToggleVisibility,
  onViewAnalysis,
}: BalanceHeroProps) {
  const chartWidth = Math.min(isSmallPhone ? 104 : 118, Math.floor(contentWidth * 0.34));
  const accent = positive
    ? ORBITX_THEME.colors.primaryGreen
    : ORBITX_THEME.colors.lossRed;
  const displayAmount = hidden ? '••••••' : compactBalance(amountLabel);
  const displayDelta = hidden ? '••••••' : deltaLabel;

  return (
    <View style={[styles.card, isSmallPhone ? styles.cardSmall : null]}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>Balance total</Text>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.copyColumn}>
          {loading ? (
            <>
              <View style={[styles.amountSkeleton, isSmallPhone ? styles.amountSkeletonSmall : null]} />
              <View style={styles.deltaSkeleton} />
            </>
          ) : (
            <>
              <Pressable onPress={onToggleVisibility} style={({ pressed }) => (pressed ? styles.pressed : null)}>
                <Text
                  style={[styles.amount, isSmallPhone ? styles.amountSmall : null]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.74}
                >
                  {displayAmount}
                </Text>
              </Pressable>

              <View style={styles.deltaRow}>
                <Ionicons name="trending-up" size={14} color={accent} />
                <Text
                  style={[styles.deltaLabel, { color: accent }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayDelta}
                </Text>
              </View>
              <Text style={styles.rangeLabel}>{rangeLabel}</Text>
            </>
          )}

          <Pressable
            onPress={onViewAnalysis}
            style={({ pressed }) => [
              styles.analysisButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={styles.analysisLabel} numberOfLines={1}>
              Ver analisis
            </Text>
            <Ionicons name="analytics-outline" size={13} color={withOpacity('#FAFAFA', 0.42)} />
          </Pressable>

          {cacheLabel ? (
            <Text style={styles.cacheLabel} numberOfLines={1} ellipsizeMode="tail">
              {cacheLabel}
            </Text>
          ) : null}
        </View>

        <View style={[styles.chartWrap, { width: chartWidth }]}>
          <MiniSparkline
            data={series}
            width={chartWidth}
            height={26}
            color={ORBITX_THEME.colors.primaryGreen}
            negativeColor={ORBITX_THEME.colors.lossRed}
            positive={positive}
            subtle
            variant="line"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 178,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.6),
    backgroundColor: ORBITX_THEME.colors.background,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  cardSmall: {
    minHeight: 170,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
  },
  copyColumn: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  amount: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.regular,
    fontSize: 35,
    letterSpacing: -0.8,
  },
  amountSmall: {
    fontSize: 31,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  deltaLabel: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    flexShrink: 1,
  },
  rangeLabel: {
    color: '#71717A',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  analysisButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: withOpacity('#FFFFFF', 0.04),
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.08),
  },
  analysisLabel: {
    color: withOpacity(ORBITX_THEME.colors.textPrimary, 0.82),
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  chartWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  cacheLabel: {
    marginTop: 6,
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  amountSkeleton: {
    width: 182,
    height: 38,
    borderRadius: 14,
    backgroundColor: withOpacity('#FAFAFA', 0.08),
  },
  amountSkeletonSmall: {
    width: 158,
    height: 34,
  },
  deltaSkeleton: {
    width: 116,
    height: 14,
    borderRadius: RADII.pill,
    backgroundColor: withOpacity('#FAFAFA', 0.07),
  },
  pressed: {
    opacity: 0.8,
  },
});
