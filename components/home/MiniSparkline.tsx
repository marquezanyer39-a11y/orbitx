import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { withOpacity } from '../../constants/theme';

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  negativeColor?: string;
  positive?: boolean;
  barWidth?: number;
  barGap?: number;
  subtle?: boolean;
}

const FALLBACK_SERIES = [28, 34, 32, 38, 36, 42, 44, 41, 46, 52, 48, 56];

function normalizeSeries(
  series: number[],
  width: number,
  barWidth: number,
  barGap: number,
) {
  const safeSeries = series.filter((point) => Number.isFinite(point));
  const usable = safeSeries.length ? safeSeries : FALLBACK_SERIES;
  const maxBars = Math.max(6, Math.floor(width / Math.max(barWidth + barGap, 1)));
  const sampled =
    usable.length <= maxBars
      ? usable
      : Array.from({ length: maxBars }, (_, index) => {
          const pointer = Math.floor((index / maxBars) * usable.length);
          return usable[Math.min(pointer, usable.length - 1)];
        });

  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const delta = Math.max(max - min, 1);

  return sampled.map((point) => 0.22 + ((point - min) / delta) * 0.78);
}

function MiniSparklineComponent({
  data,
  width = 116,
  height = 44,
  color = '#1EDC8B',
  negativeColor = '#FF5A67',
  positive = true,
  barWidth = 4,
  barGap = 2,
  subtle = false,
}: MiniSparklineProps) {
  const bars = useMemo(
    () => normalizeSeries(data, width, barWidth, barGap),
    [barGap, barWidth, data, width],
  );
  const fill = positive ? color : negativeColor;

  return (
    <View
      style={[
        styles.root,
        {
          width,
          height,
          borderColor: subtle ? 'transparent' : withOpacity(fill, 0.08),
          backgroundColor: subtle ? 'transparent' : withOpacity(fill, 0.04),
        },
      ]}
    >
      <View
        style={[
          styles.glow,
          {
            backgroundColor: withOpacity(fill, subtle ? 0.08 : 0.12),
          },
        ]}
      />
      <View style={styles.barRow}>
        {bars.map((value, index) => (
          <View
            key={`${index}-${value}`}
            style={[
              styles.bar,
              {
                width: barWidth,
                marginRight: index === bars.length - 1 ? 0 : barGap,
                height: Math.max(4, value * height),
                backgroundColor: withOpacity(fill, subtle ? 0.78 : 0.94),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export const MiniSparkline = memo(MiniSparklineComponent);

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderRadius: 14,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    top: '48%',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  bar: {
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
});
