import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { RADII, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface Point {
  x: number;
  y: number;
}

interface SparklineLineProps {
  values: number[];
  positive?: boolean;
  width?: number;
  height?: number;
  animated?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function SparklineLine({
  values,
  positive = true,
  width = 82,
  height = 28,
  animated = true,
}: SparklineLineProps) {
  const { colors } = useAppTheme();
  const opacity = useSharedValue(animated ? 0 : 1);
  const translateY = useSharedValue(animated ? 4 : 0);
  const color = positive ? colors.profit : colors.loss;

  const points = useMemo<Point[]>(() => {
    if (!values.length) {
      return [];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const usableWidth = width - 4;
    const usableHeight = height - 6;

    return values.map((value, index) => {
      const x = values.length === 1 ? width / 2 : 2 + (index / (values.length - 1)) * usableWidth;
      const ratio = max === min ? 0.5 : (value - min) / (max - min);
      const y = 3 + usableHeight - ratio * usableHeight;

      return { x, y };
    });
  }, [height, values, width]);

  const segments = useMemo(() => {
    return points.slice(0, -1).map((point, index) => {
      const next = points[index + 1];
      const dx = next.x - point.x;
      const dy = next.y - point.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      return {
        left: point.x,
        top: point.y,
        width: length,
        angle,
      };
    });
  }, [points]);

  useEffect(() => {
    opacity.value = animated ? 0 : 1;
    translateY.value = animated ? 4 : 0;

    if (animated) {
      opacity.value = withTiming(1, { duration: 220 });
      translateY.value = withTiming(0, { duration: 220 });
    }
  }, [animated, opacity, translateY, values]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const lastPoint = points[points.length - 1];

  return (
    <AnimatedView style={[styles.shell, animatedStyle, { width, height }]}>
      <View
        style={[
          styles.baseline,
          { backgroundColor: withOpacity(colors.textMuted, 0.16) },
        ]}
      />

      {segments.map((segment, index) => (
        <View
          key={`${segment.left}-${segment.top}-${index}`}
          style={[
            styles.segment,
            {
              left: segment.left,
              top: segment.top,
              width: segment.width,
              backgroundColor: index === segments.length - 1 ? color : withOpacity(color, 0.72),
              transform: [{ translateY: -1 }, { rotateZ: `${segment.angle}rad` }],
            },
          ]}
        />
      ))}

      {lastPoint ? (
        <View
          style={[
            styles.endDot,
            {
              left: lastPoint.x - 2.5,
              top: lastPoint.y - 2.5,
              backgroundColor: color,
              shadowColor: color,
            },
          ]}
        />
      ) : null}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'relative',
  },
  baseline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 4,
    height: 1,
  },
  segment: {
    position: 'absolute',
    height: 2,
    borderRadius: RADII.pill,
    transformOrigin: 'left center',
  },
  endDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 999,
    shadowOpacity: 0.24,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
});
