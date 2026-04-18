import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  highlighted?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  style,
  highlighted = false,
  delay = 0,
}: GlassCardProps) {
  const { colors } = useAppTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(delay)}
      style={style}
    >
      <LinearGradient
        colors={highlighted ? colors.highlightGradient : colors.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: highlighted ? colors.borderStrong : colors.border,
            shadowColor: highlighted ? colors.primary : colors.text,
          },
        ]}
      >
        <View
          style={[
            styles.sheen,
            {
              backgroundColor: withOpacity(highlighted ? colors.primary : colors.textSoft, highlighted ? 0.09 : 0.03),
            },
          ]}
        />
        <View style={[styles.overlay, { backgroundColor: 'transparent' }]}>{children}</View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1,
  },
  overlay: {
    padding: 15,
    gap: 10,
  },
});
