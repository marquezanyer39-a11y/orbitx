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

function RewardsArt({ isSmallPhone = false }: { isSmallPhone?: boolean }) {
  return (
    <View style={[styles.artWrap, isSmallPhone ? styles.artWrapSmall : null]}>
      <LinearGradient
        colors={['rgba(0,200,83,0.32)', 'rgba(0,200,83,0.04)']}
        style={[styles.artGlow, isSmallPhone ? styles.artGlowSmall : null]}
      />
      <View style={[styles.artCore, isSmallPhone ? styles.artCoreSmall : null]}>
        <Ionicons name="planet-outline" size={isSmallPhone ? 18 : 20} color="#D8FDE6" />
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
  const rightColumnWidth = Math.min(isSmallPhone ? 104 : 118, Math.floor(contentWidth * 0.3));
  const currentAmount = keepTogether(currentAmountLabel);
  const targetAmount = keepTogether(targetAmountLabel.replace(/^\/\s*/, '/ '));
  const compactRemaining = keepTogether(remainingLabel);

  return (
    <LinearGradient
      colors={['#0F1114', '#101A14']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, isSmallPhone ? styles.cardSmall : null]}
    >
      <LinearGradient
        colors={['rgba(0,200,83,0.16)', 'rgba(0,200,83,0)']}
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

        <Text style={[styles.title, isSmallPhone ? styles.titleSmall : null]} numberOfLines={1}>
          Pozo de recompensas
        </Text>

        <View style={styles.amountRow}>
          <Text
            style={[styles.amount, isSmallPhone ? styles.amountSmall : null]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.84}
          >
            {currentAmount}
          </Text>
          <Text style={[styles.target, isSmallPhone ? styles.targetSmall : null]} numberOfLines={1}>
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
              ellipsizeMode="tail"
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
    minHeight: 206,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.6),
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    gap: 12,
  },
  cardSmall: {
    minHeight: 196,
    padding: 14,
  },
  topGlow: {
    position: 'absolute',
    top: -12,
    right: -8,
    width: 150,
    height: 120,
    borderRadius: 80,
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
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
    borderColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.18),
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
    fontSize: 18,
  },
  titleSmall: {
    fontSize: 17,
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
    fontSize: 13,
    flexShrink: 1,
  },
  targetSmall: {
    fontSize: 12,
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
    paddingRight: 10,
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
    fontSize: 11,
    letterSpacing: 0.4,
    flex: 1,
  },
  remainingLabelSmall: {
    fontSize: 10.5,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  ctaButton: {
    minWidth: 104,
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: ORBITX_THEME.colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  ctaButtonSmall: {
    minWidth: 94,
    minHeight: 38,
  },
  ctaLabel: {
    color: ORBITX_THEME.colors.background,
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  artWrap: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 6,
  },
  artWrapSmall: {
    width: 48,
    height: 48,
  },
  artGlow: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  artGlowSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  artCore: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#06150D', 0.8),
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.12),
  },
  artCoreSmall: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  artOrbitRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.2),
  },
  pressed: {
    opacity: 0.8,
  },
});
