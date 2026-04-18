import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { RewardsPoolCopy, RewardsPoolStatus } from '../../types/rewardsPool';
import { formatPoolPercent, formatUsdCents } from '../../services/rewardsPool/poolCopy';

interface Props {
  copy: RewardsPoolCopy;
  currentUsdCents: number;
  targetUsdCents: number;
  timeLabel: string;
  status: RewardsPoolStatus;
  userPosition?: number | null;
  estimatedRewardCents?: number | null;
  hasParticipation: boolean;
  onPressCard: () => void;
  onPressCta: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function easeOutExpo(value: number) {
  return value === 1 ? 1 : 1 - 2 ** (-10 * value);
}

export function PoolHomeCard({
  copy,
  currentUsdCents,
  targetUsdCents,
  timeLabel,
  status,
  userPosition,
  estimatedRewardCents,
  hasParticipation,
  onPressCard,
  onPressCta,
}: Props) {
  const { colors } = useAppTheme();
  const isFocused = useIsFocused();
  const safeTargetUsdCents = Math.max(targetUsdCents, 1);
  const [displayUsdCents, setDisplayUsdCents] = useState(currentUsdCents);
  const [appState, setAppState] = useState(AppState.currentState);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const displayUsdCentsRef = useRef(currentUsdCents);
  const hasMountedRef = useRef(false);
  const pulseValue = useSharedValue(0);
  const glowValue = useSharedValue(0);
  const sheenValue = useSharedValue(-0.35);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) {
          setReduceMotionEnabled(Boolean(value));
        }
      })
      .catch(() => {
        if (mounted) {
          setReduceMotionEnabled(false);
        }
      });

    const motionSubscription =
      'addEventListener' in AccessibilityInfo
        ? AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
            setReduceMotionEnabled(Boolean(value));
          })
        : null;

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
    });

    return () => {
      mounted = false;
      motionSubscription?.remove?.();
      appStateSubscription.remove();
    };
  }, []);

  const shouldAnimate = isFocused && appState === 'active' && !reduceMotionEnabled;

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayUsdCents(currentUsdCents);
      displayUsdCentsRef.current = currentUsdCents;
      return;
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      setDisplayUsdCents(currentUsdCents);
      displayUsdCentsRef.current = currentUsdCents;
      return;
    }

    if (displayUsdCentsRef.current === currentUsdCents) {
      return;
    }

    let animationFrame = 0;
    let startTime = 0;
    const from = displayUsdCentsRef.current;
    const to = currentUsdCents;
    const delta = Math.abs(to - from);
    const duration = clamp(820 + delta / 18, 820, 1_780);

    const step = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = clamp((timestamp - startTime) / duration, 0, 1);
      const eased = easeOutExpo(progress);
      const nextValue =
        progress >= 1 ? to : Math.round(from + (to - from) * eased);

      displayUsdCentsRef.current = nextValue;
      setDisplayUsdCents(nextValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    pulseValue.value = 0;
    glowValue.value = 0;
    sheenValue.value = -0.35;

    pulseValue.value = withSequence(
      withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 560, easing: Easing.out(Easing.quad) }),
    );
    glowValue.value = withSequence(
      withTiming(1, { duration: 240, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 980, easing: Easing.out(Easing.quad) }),
    );
    sheenValue.value = withSequence(
      withTiming(1.05, { duration: 1_050, easing: Easing.out(Easing.cubic) }),
      withTiming(-0.35, { duration: 0 }),
    );

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [currentUsdCents, glowValue, pulseValue, sheenValue, shouldAnimate]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulseValue.value * 0.028 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.06 + glowValue.value * 0.2,
  }));

  const sheenStyle = useAnimatedStyle(() => ({
    opacity: sheenValue.value < 0 ? 0 : 0.38,
    transform: [{ translateX: sheenValue.value * 240 }],
  }));

  const displayProgressPercent = clamp(
    (displayUsdCents / safeTargetUsdCents) * 100,
    0,
    100,
  );
  const fillWidth = `${displayProgressPercent}%` as `${number}%`;
  const amountLabel = useMemo(
    () => formatUsdCents(copy.language, displayUsdCents),
    [copy.language, displayUsdCents],
  );
  const targetLabel = useMemo(
    () => formatUsdCents(copy.language, safeTargetUsdCents),
    [copy.language, safeTargetUsdCents],
  );
  const percentLabel = useMemo(
    () => formatPoolPercent(copy.language, displayProgressPercent),
    [copy.language, displayProgressPercent],
  );

  const footerCtaLabel =
    status === 'finalized'
      ? copy.poolResultsCta
      : hasParticipation
        ? copy.poolHomeCta
        : copy.participateLabel;

  const footerDetail =
    status === 'finalized'
      ? copy.finalizedBanner
      : status === 'full'
        ? copy.fullBanner
        : status === 'expired'
          ? copy.expiredBanner
          : hasParticipation
            ? null
            : copy.oneParticipationRule;

  return (
    <View
      style={[
        styles.cardShell,
        {
          borderColor: withOpacity('#22E8FF', 0.16),
          backgroundColor: withOpacity('#09131D', 0.985),
        },
      ]}
    >
      <Animated.View pointerEvents="none" style={[styles.cardGlow, glowStyle]}>
        <LinearGradient
          colors={[
            withOpacity('#22E8FF', 0.06),
            withOpacity('#22E8FF', 0.015),
            'rgba(0,0,0,0)',
          ]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Pressable onPress={onPressCard} style={styles.pressableArea}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.eyebrowPill,
              {
                backgroundColor: withOpacity('#0D1A23', 0.94),
                borderColor: withOpacity('#22E8FF', 0.18),
              },
            ]}
          >
            <Text style={styles.eyebrowText}>{copy.currentPoolTitle}</Text>
          </View>

          <View
            style={[
              styles.countdownPill,
              {
                backgroundColor: withOpacity('#0C1721', 0.94),
                borderColor: withOpacity('#22E8FF', 0.14),
              },
            ]}
          >
            <Text style={styles.countdownText}>{timeLabel}</Text>
          </View>
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.title}>{copy.headerTitle}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {copy.headerBody}
          </Text>
        </View>

        <Animated.View style={[styles.amountWrap, pulseStyle]}>
          <View style={styles.amountRow}>
            <Text style={styles.amountValue}>{amountLabel}</Text>
            <Text style={styles.amountTarget}>/ {targetLabel}</Text>
          </View>
          <Text style={[styles.amountCaption, { color: colors.textSoft }]}>
            {status === 'open' ? copy.rewardsExtra : footerDetail ?? copy.rewardsExtra}
          </Text>
        </Animated.View>

        <View style={styles.progressRow}>
          <View style={styles.track}>
            <View style={[styles.fillWrap, { width: fillWidth }]}>
              <LinearGradient
                colors={['#1FE5FF', '#50DBFF', '#7AF4FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fill}
              />
              <Animated.View style={[styles.fillSheen, sheenStyle]}>
                <LinearGradient
                  colors={[
                    'rgba(255,255,255,0)',
                    'rgba(255,255,255,0.34)',
                    'rgba(255,255,255,0)',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
          </View>

          <Text style={styles.percent}>{percentLabel}</Text>
        </View>

        {hasParticipation ? (
          <View
            style={[
              styles.userStrip,
              {
                backgroundColor: withOpacity('#0C1822', 0.94),
                borderColor: withOpacity('#D5B26B', 0.34),
              },
            ]}
          >
            <View style={styles.userMetaBlock}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {copy.positionLabel}
              </Text>
              <Text style={styles.statValue}>{userPosition ? `#${userPosition}` : '--'}</Text>
            </View>

            <View style={styles.userDivider} />

            <View style={styles.userMetaBlock}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {copy.estimatedReward}
              </Text>
              <Text style={styles.statValue}>
                {estimatedRewardCents != null
                  ? formatUsdCents(copy.language, estimatedRewardCents)
                  : '--'}
              </Text>
            </View>
          </View>
        ) : null}
      </Pressable>

      <View style={styles.footerRow}>
        <View style={styles.footerCopy}>
          <Text style={[styles.footerLead, { color: colors.textSoft }]}>
            {status === 'finalized' ? copy.finalizedStatus : timeLabel}
          </Text>
          {footerDetail ? (
            <Text style={[styles.footerBody, { color: colors.textMuted }]}>
              {footerDetail}
            </Text>
          ) : null}
        </View>

        <AnimatedPressable
          onPress={onPressCta}
          style={[styles.ctaButton, pulseStyle]}
        >
          <LinearGradient
            colors={
              status === 'open' && !hasParticipation
                ? ['#27E8FF', '#69DBFF']
                : ['rgba(18, 30, 41, 0.98)', 'rgba(12, 20, 28, 0.98)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.ctaGradient,
              {
                borderColor:
                  status === 'open' && !hasParticipation
                    ? withOpacity('#8EFDFF', 0.44)
                    : withOpacity('#22E8FF', 0.18),
              },
            ]}
          >
            <Text
              style={[
                styles.ctaLabel,
                {
                  color:
                    status === 'open' && !hasParticipation ? '#072733' : colors.text,
                },
              ]}
            >
              {footerCtaLabel}
            </Text>
          </LinearGradient>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 13,
    gap: 11,
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  pressableArea: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eyebrowPill: {
    minHeight: 26,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyebrowText: {
    color: '#DDFEFF',
    fontFamily: FONT.semibold,
    fontSize: 9,
    letterSpacing: 0.28,
  },
  countdownPill: {
    minHeight: 26,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: '#AEEFFF',
    fontFamily: FONT.semibold,
    fontSize: 9,
  },
  copyBlock: {
    gap: 2,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 23,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  amountWrap: {
    gap: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 4,
  },
  amountValue: {
    color: '#F8FDFF',
    fontFamily: FONT.bold,
    fontSize: 27,
    lineHeight: 29,
  },
  amountTarget: {
    color: '#AEC5D1',
    fontFamily: FONT.semibold,
    fontSize: 17,
    lineHeight: 20,
    paddingBottom: 1,
  },
  amountCaption: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  fillWrap: {
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  fillSheen: {
    position: 'absolute',
    top: -1,
    bottom: -1,
    width: 64,
  },
  percent: {
    minWidth: 42,
    color: '#30E7FF',
    fontFamily: FONT.bold,
    fontSize: 15,
    textAlign: 'right',
  },
  userStrip: {
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userMetaBlock: {
    flex: 1,
    gap: 3,
  },
  userDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: {
    fontFamily: FONT.medium,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  statValue: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerCopy: {
    flex: 1,
    gap: 2,
  },
  footerLead: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  footerBody: {
    fontFamily: FONT.regular,
    fontSize: 9,
    lineHeight: 13,
  },
  ctaButton: {
    minWidth: 108,
  },
  ctaGradient: {
    minHeight: 40,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontFamily: FONT.bold,
    fontSize: 12,
  },
});
