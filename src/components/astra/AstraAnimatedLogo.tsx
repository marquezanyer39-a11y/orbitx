import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  StyleSheet,
  View,
} from 'react-native';

import { withOpacity } from '../../../constants/theme';
import { AstraLogo } from './AstraLogo';

interface Props {
  size?: number;
  framed?: boolean;
  paused?: boolean;
  emphasis?: 'subtle' | 'entry';
}

export function AstraAnimatedLogo({
  size = 24,
  framed = false,
  paused = false,
  emphasis = 'subtle',
}: Props) {
  const [appState, setAppState] = useState(AppState.currentState);
  const [reduceMotion, setReduceMotion] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.26)).current;
  const float = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(-1)).current;

  const brandPrimary = '#7B3FE4';
  const brandGlow = '#A577FF';

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => {
        if (mounted) {
          setReduceMotion(false);
        }
      });

    const motionSubscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      (enabled) => {
        setReduceMotion(enabled);
      },
    );

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
    });

    return () => {
      mounted = false;
      motionSubscription?.remove?.();
      appStateSubscription.remove();
    };
  }, []);

  const shouldAnimate =
    !paused && !reduceMotion && (appState === 'active' || appState === 'unknown');

  useEffect(() => {
    pulse.stopAnimation();
    glow.stopAnimation();
    float.stopAnimation();
    tilt.stopAnimation();
    sweep.stopAnimation();

    if (!shouldAnimate) {
      pulse.setValue(1);
      glow.setValue(0.28);
      float.setValue(0);
      tilt.setValue(0);
      sweep.setValue(-1);
      return;
    }

    const breathingSequence = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, {
            toValue: emphasis === 'entry' ? 1.075 : 1.055,
            duration: emphasis === 'entry' ? 1500 : 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: emphasis === 'entry' ? 0.74 : 0.58,
            duration: emphasis === 'entry' ? 1500 : 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(float, {
            toValue: emphasis === 'entry' ? -1.2 : -0.8,
            duration: emphasis === 'entry' ? 1500 : 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(tilt, {
            toValue: emphasis === 'entry' ? 1 : 0.7,
            duration: emphasis === 'entry' ? 1500 : 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, {
            toValue: 1,
            duration: emphasis === 'entry' ? 1650 : 1950,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0.26,
            duration: emphasis === 'entry' ? 1650 : 1950,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(float, {
            toValue: 0,
            duration: emphasis === 'entry' ? 1650 : 1950,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(tilt, {
            toValue: -0.7,
            duration: emphasis === 'entry' ? 1650 : 1950,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    const sweepSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1.15,
          duration: emphasis === 'entry' ? 2100 : 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(emphasis === 'entry' ? 900 : 1400),
      ]),
    );

    breathingSequence.start();
    sweepSequence.start();

    return () => {
      breathingSequence.stop();
      sweepSequence.stop();
      pulse.stopAnimation();
      glow.stopAnimation();
      float.stopAnimation();
      tilt.stopAnimation();
      sweep.stopAnimation();
    };
  }, [emphasis, float, glow, pulse, shouldAnimate, sweep, tilt]);

  const haloStyle = useMemo(
    () => ({
      backgroundColor: withOpacity(brandPrimary, emphasis === 'entry' ? 0.2 : 0.14),
      borderColor: withOpacity(brandGlow, emphasis === 'entry' ? 0.38 : 0.24),
      width: size + (emphasis === 'entry' ? 18 : 14),
      height: size + (emphasis === 'entry' ? 18 : 14),
      borderRadius: 999,
    }),
    [brandGlow, brandPrimary, emphasis, size],
  );

  const shellSize = framed ? size + 8 : size;
  const tiltRotate = tilt.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-4deg', '4deg'],
  });
  const sweepTranslate = sweep.interpolate({
    inputRange: [-1, 1.15],
    outputRange: [-(shellSize * 0.9), shellSize * 0.95],
  });

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          transform: [{ scale: pulse }, { translateY: float }],
        },
      ]}
    >
      <Animated.View style={[styles.halo, haloStyle, { opacity: glow }]} />
      <Animated.View
        style={[
          styles.logoLayer,
          {
            transform: [{ rotate: tiltRotate }],
          },
        ]}
      >
        <View style={[styles.logoClip, { width: shellSize, height: shellSize, borderRadius: shellSize / 2 }]}>
          <AstraLogo size={size} framed={framed} />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.sheen,
              {
                width: Math.max(shellSize * 0.34, 8),
                height: shellSize * 1.55,
                backgroundColor: withOpacity('#FFFFFF', emphasis === 'entry' ? 0.26 : 0.18),
                transform: [{ translateX: sweepTranslate }, { rotate: '18deg' }],
              },
            ]}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    borderWidth: 1,
  },
  logoLayer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoClip: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheen: {
    position: 'absolute',
    top: -8,
    borderRadius: 999,
  },
});
