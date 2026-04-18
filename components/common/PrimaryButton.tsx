import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { FONT, RADII, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

type Variant = 'primary' | 'secondary' | 'ghost';

interface PrimaryButtonProps extends PressableProps {
  label: string;
  icon?: ReactNode;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({
  label,
  icon,
  variant = 'primary',
  style,
  ...pressableProps
}: PrimaryButtonProps) {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...pressableProps}
      onPressIn={(event) => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 280 });
        pressableProps.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 280 });
        pressableProps.onPressOut?.(event);
      }}
      style={[
        animatedStyle,
        styles.base,
        variant === 'primary' && { backgroundColor: colors.primary },
        variant === 'secondary' && {
          backgroundColor: colors.chipBackground,
          borderWidth: 1,
          borderColor: colors.border,
        },
        variant === 'ghost' && styles.ghost,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text
          style={[
            styles.label,
            {
              color: variant === 'primary' ? colors.background : colors.textSoft,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 42,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADII.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
});
