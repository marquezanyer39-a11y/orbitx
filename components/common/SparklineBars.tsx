import { StyleSheet, View } from 'react-native';

import { RADII, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface SparklineBarsProps {
  values: number[];
  positive?: boolean;
  variant?: 'bars' | 'technical';
  width?: number;
  height?: number;
}

export function SparklineBars({
  values,
  positive = true,
  variant = 'bars',
  width,
  height,
}: SparklineBarsProps) {
  const { colors } = useAppTheme();
  const min = Math.min(...values);
  const max = Math.max(...values);
  const color = positive ? colors.profit : colors.loss;
  const chartHeight = height ?? (variant === 'technical' ? 26 : 30);
  const chartWidth = width ?? (variant === 'technical' ? 78 : undefined);
  const gap = variant === 'technical' ? 2 : 3;
  const barWidth = variant === 'technical' ? 2 : 5;

  return (
    <View
      style={[
        styles.container,
        {
          gap,
          height: chartHeight,
          width: chartWidth,
        },
      ]}
    >
      {variant === 'technical' ? (
        <View style={[styles.baseline, { backgroundColor: withOpacity(colors.textMuted, 0.18) }]} />
      ) : null}
      {values.map((value, index) => {
        const currentHeight =
          max === min ? chartHeight * 0.3 : chartHeight * 0.24 + ((value - min) / (max - min)) * (chartHeight * 0.6);

        return (
          <View
            key={`${value}-${index}`}
            style={[
              styles.bar,
              {
                width: barWidth,
                height: currentHeight,
                backgroundColor:
                  index === values.length - 1 ? color : withOpacity(color, 0.36),
                borderRadius: variant === 'technical' ? 2 : RADII.pill,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  baseline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
  },
  bar: {
    borderRadius: RADII.pill,
  },
});
