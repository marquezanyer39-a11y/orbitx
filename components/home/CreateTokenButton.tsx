import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { FONT, RADII } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface CreateTokenButtonProps {
  onNavigate: () => void;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CreateTokenButton({ onNavigate, style }: CreateTokenButtonProps) {
  const { colors } = useAppTheme();
  const [locked, setLocked] = useState(false);
  const scale = useSharedValue(1);
  const ringScale = useSharedValue(0.92);
  const ringOpacity = useSharedValue(0);
  const rocketLift = useSharedValue(0);
  const rocketTilt = useSharedValue(0);
  const rocketOpacity = useSharedValue(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const rocketStyle = useAnimatedStyle(() => ({
    opacity: rocketOpacity.value,
    transform: [
      { translateY: rocketLift.value },
      { rotate: `${rocketTilt.value}deg` },
    ],
  }));

  function handlePress() {
    if (locked) {
      return;
    }

    setLocked(true);
    scale.value = withSequence(
      withTiming(0.98, { duration: 90, easing: Easing.out(Easing.quad) }),
      withSpring(1.05, { damping: 14, stiffness: 260 }),
      withTiming(1, { duration: 180 }),
    );
    ringOpacity.value = withSequence(
      withTiming(0.42, { duration: 80 }),
      withTiming(0, { duration: 240 }),
    );
    ringScale.value = withSequence(
      withTiming(1.02, { duration: 80 }),
      withTiming(1.28, { duration: 240 }),
    );
    rocketLift.value = withSequence(
      withTiming(-3, { duration: 70 }),
      withTiming(-18, { duration: 170, easing: Easing.out(Easing.cubic) }),
      withTiming(-32, { duration: 120, easing: Easing.out(Easing.cubic) }),
    );
    rocketTilt.value = withSequence(
      withTiming(-9, { duration: 80 }),
      withTiming(-18, { duration: 170 }),
    );
    rocketOpacity.value = withSequence(
      withTiming(1, { duration: 0 }),
      withTiming(1, { duration: 180 }),
      withTiming(0.1, { duration: 120 }),
    );

    timeoutRef.current = setTimeout(() => {
      onNavigate();
      rocketLift.value = 0;
      rocketTilt.value = 0;
      rocketOpacity.value = 1;
      ringScale.value = 0.92;
      ringOpacity.value = 0;
      setLocked(false);
    }, 260);
  }

  return (
    <View style={[styles.shell, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          ringStyle,
          { borderColor: colors.borderStrong, backgroundColor: colors.primarySoft },
        ]}
      />
      <AnimatedPressable
        onPress={handlePress}
        style={[
          styles.button,
          buttonStyle,
          {
            backgroundColor: colors.primarySoft,
            borderColor: colors.borderStrong,
          },
        ]}
      >
        <Animated.View style={rocketStyle}>
          <Ionicons name="rocket-outline" size={14} color={colors.text} />
        </Animated.View>
        <Text style={[styles.label, { color: colors.text }]}>Crear</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 84,
    height: 32,
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: RADII.pill,
    borderWidth: 1,
  },
  button: {
    flex: 1,
    minHeight: 32,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
});
