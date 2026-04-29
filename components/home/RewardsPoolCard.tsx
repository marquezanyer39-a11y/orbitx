import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { ORBITX_THEME } from './orbitxTheme';

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

  if (numeric >= 1000) {
    return keepTogether(`/ $${Math.round(numeric / 1000)}k`);
  }

  return keepTogether(`/ ${safe}`);
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
      <LinearGradient
        colors={['rgba(0,200,83,0.28)', 'rgba(0,200,83,0.04)']}
        style={[styles.artGlow, isSmallPhone ? styles.artGlowSmall : null]}
      />
      <View style={[styles.artCore, isSmallPhone ? styles.artCoreSmall : null]}>
        <Ionicons name="planet-outline" size={isSmallPhone ? 17 : 19} color="#D8FDE6" />
      </View>
      <View style={styles.artOrbitRing} />
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
  const rightColumnWidth = Math.min(isSmallPhone ? 92 : 102, Math.floor(contentWidth * 0.26));
  const currentAmount = keepTogether(currentAmountLabel);
  const targetAmount = compactTargetLabel(targetAmountLabel);
  const compactRemaining = normalizeRemainingLabel(remainingLabel);

  return (
    <LinearGradient
      colors={['#0F1114', '#101A14']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, isSmallPhone ? styles.cardSmall : null]}
    >
      <LinearGradient
        colors={['rgba(0,200,83,0.14)', 'rgba(0,200,83,0)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topGlow}
      />

      <View style={styles.leftColumn}>
        <View style={styles.badge}>
          <Ionicons name="sparkles-outline" size={11} color={ORBITX_THEME.colors.primaryGreen} />
          <Text style={styles.badgeLabel} numberOfLines={1}>
            POZO MENSUAL
          </Text>
        </View>

        <Text
          style={[styles.title, isSmallPhone ? styles.titleSmall : null]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.9}
        >
          Pozo de recompensas
        </Text>

        <View style={styles.amountRow}>
          <Text
            style={[styles.amount, isSmallPhone ? styles.amountSmall : null]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.86}
          >
            {currentAmount}
          </Text>
          <Text
            style={[styles.target, isSmallPhone ? styles.targetSmall : null]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.92}
          >
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

        <View style={styles.bottomRow}>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color={withOpacity('#FAFAFA', 0.42)} />
            <Text
              style={[styles.remainingLabel, isSmallPhone ? styles.remainingLabelSmall : null]}
              numberOfLines={1}
            >
              {compactRemaining}
            </Text>
          </View>
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
    minHeight: 208,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.42),
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    gap: 10,
  },
  cardSmall: {
    minHeight: 198,
    padding: 14,
  },
  topGlow: {
    position: 'absolute',
    top: -10,
    right: -6,
    width: 142,
    height: 116,
    borderRadius: 80,
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    paddingRight: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 24,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
    backgroundColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.16),
  },
  badgeLabel: {
    color: ORBITX_THEME.colors.primaryGreen,
    fontFamily: FONT.semibold,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  title: {
    marginTop: 10,
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 17,
  },
  titleSmall: {
    fontSize: 16,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
    minWidth: 0,
  },
  amount: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.bold,
    fontSize: 24,
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  amountSmall: {
    fontSize: 22,
  },
  target: {
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.medium,
    fontSize: 12,
    flexShrink: 1,
  },
  targetSmall: {
    fontSize: 11,
  },
  progressRow: {
    marginTop: 16,
    gap: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: RADII.pill,
    overflow: 'hidden',
    backgroundColor: withOpacity('#FFFFFF', 0.1),
  },
  progressFill: {
    height: '100%',
    borderRadius: RADII.pill,
    backgroundColor: ORBITX_THEME.colors.primaryGreen,
  },
  progressLabel: {
    alignSelf: 'flex-end',
    color: ORBITX_THEME.colors.primaryGreen,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  bottomRow: {
    marginTop: 18,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  remainingLabel: {
    color: withOpacity('#FAFAFA', 0.48),
    fontFamily: FONT.medium,
    fontSize: 10.8,
    letterSpacing: 0.3,
    flex: 1,
  },
  remainingLabelSmall: {
    fontSize: 10.2,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  ctaButton: {
    minWidth: 96,
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: ORBITX_THEME.colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  ctaButtonSmall: {
    minWidth: 90,
    minHeight: 38,
  },
  ctaLabel: {
    color: ORBITX_THEME.colors.background,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  artWrap: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 4,
  },
  artWrapSmall: {
    width: 44,
    height: 44,
  },
  artGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  artGlowSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  artCore: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#06150D', 0.8),
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.12),
  },
  artCoreSmall: {
    width: 28,
    height: 28,
    borderRadius: 9,
  },
  artOrbitRing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.18),
  },
  pressed: {
    opacity: 0.8,
  },
});
