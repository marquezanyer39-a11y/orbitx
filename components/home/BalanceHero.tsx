import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { MiniSparkline } from './MiniSparkline';
import { CARD_RADIUS, ORBITX_THEME } from './orbitxTheme';

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

function extractNumericValue(value: string) {
  const normalized = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
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
  const chartWidth = Math.min(isSmallPhone ? 138 : 168, Math.floor(contentWidth * 0.46));
  const parsedAmount = extractNumericValue(amountLabel);
  const hasReliableDelta = (parsedAmount ?? 0) > 0 && extractNumericValue(deltaLabel) !== null;
  const accent = positive ? ORBITX_THEME.colors.primaryGreen : ORBITX_THEME.colors.lossRed;
  const hiddenMask = '\u2022\u2022\u2022\u2022\u2022\u2022';
  const displayAmount = hidden ? hiddenMask : compactBalance(amountLabel);
  const displayDelta = hidden
    ? hiddenMask
    : hasReliableDelta
      ? deltaLabel
      : 'Sin variación disponible';

  return (
    <View style={[styles.card, isSmallPhone ? styles.cardSmall : null]}>
      <View style={styles.glow} />

      <Text style={styles.eyebrow}>Balance total</Text>

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
                  minimumFontScale={0.72}
                >
                  {displayAmount}
                </Text>
              </Pressable>

              <View style={styles.deltaRow}>
                {hasReliableDelta ? <Ionicons name="trending-up" size={13} color={accent} /> : null}
                <Text
                  style={[
                    styles.deltaLabel,
                    {
                      color: hasReliableDelta ? accent : ORBITX_THEME.colors.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {displayDelta}
                </Text>
                {hasReliableDelta ? <Text style={styles.rangePill}>{rangeLabel}</Text> : null}
              </View>
            </>
          )}

          <Pressable
            onPress={onViewAnalysis}
            style={({ pressed }) => [styles.analysisButton, pressed ? styles.pressed : null]}
          >
            <Ionicons name="analytics-outline" size={12} color={withOpacity('#FAFAFA', 0.58)} />
            <Text style={styles.analysisLabel} numberOfLines={1}>
              Ver análisis
            </Text>
            <Ionicons name="chevron-forward" size={12} color={withOpacity('#FAFAFA', 0.46)} />
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
            height={42}
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
    width: '100%',
    minHeight: 156,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.12),
    backgroundColor: '#0B100D',
    paddingHorizontal: 14,
    paddingVertical: 15,
    overflow: 'hidden',
  },
  cardSmall: {
    minHeight: 150,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  glow: {
    position: 'absolute',
    right: -12,
    top: -8,
    width: 170,
    height: 132,
    borderRadius: 80,
    backgroundColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.08),
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
    gap: 8,
    marginTop: 9,
  },
  copyColumn: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  amount: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.regular,
    fontSize: 34,
    letterSpacing: 0,
  },
  amountSmall: {
    fontSize: 30,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
    minHeight: 19,
  },
  deltaLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12.5,
    flexShrink: 1,
  },
  rangePill: {
    color: withOpacity('#FAFAFA', 0.72),
    fontFamily: FONT.medium,
    fontSize: 11,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADII.pill,
    backgroundColor: withOpacity('#FFFFFF', 0.08),
    overflow: 'hidden',
  },
  analysisButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: withOpacity('#FFFFFF', 0.045),
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.16),
  },
  analysisLabel: {
    color: withOpacity(ORBITX_THEME.colors.textPrimary, 0.86),
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  chartWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 18,
  },
  cacheLabel: {
    marginTop: 4,
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 10.5,
  },
  amountSkeleton: {
    width: 182,
    height: 36,
    borderRadius: 14,
    backgroundColor: withOpacity('#FAFAFA', 0.08),
  },
  amountSkeletonSmall: {
    width: 158,
    height: 32,
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
