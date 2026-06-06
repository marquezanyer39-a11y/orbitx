import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { CARD_RADIUS, ORBITX_THEME } from './orbitxTheme';

interface RewardsPoolCardProps {
  currentAmountLabel: string;
  targetAmountLabel: string;
  progressPercent: number;
  progressLabel: string;
  remainingLabel: string;
  contentWidth: number;
  isSmallPhone?: boolean;
  onParticipate: () => void;
}

function keepTogether(value: string) {
  return value.replace(/\s+/g, ' ').trim().replace(/ /g, '\u00A0');
}

function compactTargetLabel(value: string) {
  const safe = value.replace(/^\/\s*/, '').trim();
  const numeric = Number.parseFloat(safe.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(numeric) || numeric < 1000) {
    return keepTogether(`/ ${safe}`);
  }

  return keepTogether(`/ $${Math.round(numeric / 1000)}k`);
}

function normalizeRemainingLabel(value: string) {
  return keepTogether(
    value
      .replace(/\bremaining\b/gi, 'restantes')
      .replace(/\bremain\b/gi, 'restantes')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function RewardsArt({ isSmallPhone = false }: { isSmallPhone?: boolean }) {
  return (
    <View style={[styles.artWrap, isSmallPhone ? styles.artWrapSmall : null]}>
      <View style={[styles.artTrail, styles.artTrailA]} />
      <View style={[styles.artTrail, styles.artTrailB]} />
      <View style={[styles.artCore, isSmallPhone ? styles.artCoreSmall : null]}>
        <Ionicons
          name="planet-outline"
          size={isSmallPhone ? 15 : 17}
          color={withOpacity(ORBITX_THEME.colors.textPrimary, 0.88)}
        />
      </View>
    </View>
  );
}

export function RewardsPoolCard({
  currentAmountLabel,
  targetAmountLabel,
  progressPercent,
  progressLabel,
  remainingLabel,
  contentWidth,
  isSmallPhone = false,
  onParticipate,
}: RewardsPoolCardProps) {
  const rightColumnWidth = Math.min(isSmallPhone ? 76 : 86, Math.floor(contentWidth * 0.2));
  const currentAmount = keepTogether(currentAmountLabel);
  const targetAmount = compactTargetLabel(targetAmountLabel);
  const compactRemaining = normalizeRemainingLabel(remainingLabel);

  return (
    <LinearGradient
      colors={[ORBITX_THEME.colors.surfaceSoft, ORBITX_THEME.colors.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, isSmallPhone ? styles.cardSmall : null]}
    >
      <LinearGradient
        colors={[ORBITX_THEME.colors.accentGlow, withOpacity(ORBITX_THEME.colors.primaryGreen, 0)]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topGlow}
      />

      <View style={styles.leftColumn}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isSmallPhone ? styles.titleSmall : null]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.9}
          >
            Pozo de recompensas
          </Text>
          <Ionicons
            name="information-circle-outline"
            size={15}
            color={withOpacity(ORBITX_THEME.colors.textPrimary, 0.5)}
          />
        </View>

        <View style={styles.amountRow}>
          <Text
            style={[styles.amount, isSmallPhone ? styles.amountSmall : null]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.86}
          >
            {currentAmount}
          </Text>
          <Text style={styles.target} numberOfLines={1}>
            {targetAmount}
          </Text>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(0, Math.min(progressPercent, 100))}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressLabel} numberOfLines={1}>
            {progressLabel}
          </Text>
        </View>

        <View style={styles.timeRow}>
          <Ionicons
            name="time-outline"
            size={13}
            color={withOpacity(ORBITX_THEME.colors.textPrimary, 0.42)}
          />
          <Text
            style={[styles.remainingLabel, isSmallPhone ? styles.remainingLabelSmall : null]}
            numberOfLines={1}
          >
            {compactRemaining}
          </Text>
        </View>
      </View>

      <View style={[styles.rightColumn, { width: rightColumnWidth }]}>
        <RewardsArt isSmallPhone={isSmallPhone} />
        <Pressable
          onPress={onParticipate}
          style={({ pressed }) => [
            styles.ctaButton,
            isSmallPhone ? styles.ctaButtonSmall : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.ctaLabel} numberOfLines={1}>
            Participar
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 150,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.08),
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    gap: 8,
  },
  cardSmall: {
    minHeight: 146,
    padding: 11,
  },
  topGlow: {
    position: 'absolute',
    top: 28,
    right: -18,
    width: 152,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: '-18deg' }],
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
  },
  title: {
    flexShrink: 1,
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 16,
  },
  titleSmall: {
    fontSize: 15,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 8,
    minWidth: 0,
  },
  amount: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 22,
    letterSpacing: 0,
    flexShrink: 1,
  },
  amountSmall: {
    fontSize: 21,
  },
  target: {
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    flexShrink: 0,
  },
  progressRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: RADII.pill,
    overflow: 'hidden',
    backgroundColor: withOpacity(ORBITX_THEME.colors.textPrimary, 0.1),
  },
  progressFill: {
    height: '100%',
    borderRadius: RADII.pill,
    backgroundColor: ORBITX_THEME.colors.primaryGreen,
  },
  progressLabel: {
    color: ORBITX_THEME.colors.primaryGreen,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  timeRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  remainingLabel: {
    color: withOpacity(ORBITX_THEME.colors.textPrimary, 0.48),
    fontFamily: FONT.medium,
    fontSize: 10.4,
    flex: 1,
  },
  remainingLabelSmall: {
    fontSize: 9.8,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  ctaButton: {
    minWidth: 82,
    minHeight: 32,
    borderRadius: 9,
    backgroundColor: ORBITX_THEME.colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  ctaButtonSmall: {
    minWidth: 76,
    minHeight: 32,
  },
  ctaLabel: {
    color: ORBITX_THEME.colors.background,
    fontFamily: FONT.bold,
    fontSize: 12,
  },
  artWrap: {
    width: 38,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  artWrapSmall: {
    width: 34,
    height: 30,
  },
  artTrail: {
    position: 'absolute',
    height: 1,
    borderRadius: 1,
    backgroundColor: withOpacity(ORBITX_THEME.colors.textPrimary, 0.12),
    transform: [{ rotate: '-18deg' }],
  },
  artTrailA: {
    width: 42,
    top: 8,
    right: -2,
  },
  artTrailB: {
    width: 30,
    top: 17,
    right: 5,
    backgroundColor: ORBITX_THEME.colors.accentGlow,
  },
  artCore: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(ORBITX_THEME.colors.surface, 0.82),
    borderWidth: 1,
    borderColor: ORBITX_THEME.colors.border,
  },
  artCoreSmall: {
    width: 25,
    height: 25,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
