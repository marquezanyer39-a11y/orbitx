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
  variant?: 'line' | 'bars';
}

const FALLBACK_SERIES = [42, 44, 46, 45, 47, 49, 51, 52, 53, 54];

function getSeries(data: number[], targetPoints: number) {
  const safe = data.filter((point) => Number.isFinite(point));
  const usable = safe.length ? safe : FALLBACK_SERIES;

  if (usable.length <= targetPoints) {
    return usable;
  }

  return Array.from({ length: targetPoints }, (_, index) => {
    const pointer = Math.floor((index / Math.max(targetPoints - 1, 1)) * (usable.length - 1));
    return usable[pointer] ?? usable[usable.length - 1];
  });
}

function getLinePoints(data: number[], width: number, height: number) {
  const sampled = getSeries(data, Math.max(8, Math.min(18, Math.floor(width / 7))));
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const delta = Math.max(max - min, 1);
  const usableWidth = Math.max(width - 2, 1);
  const usableHeight = Math.max(height - 4, 1);

  return sampled.map((point, index) => ({
    x: 1 + (index / Math.max(sampled.length - 1, 1)) * usableWidth,
    y: height - 2 - ((point - min) / delta) * usableHeight,
  }));
}

function getBars(data: number[], width: number, barWidth: number, barGap: number) {
  const sampled = getSeries(data, Math.max(5, Math.floor(width / Math.max(barWidth + barGap, 1))));
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const delta = Math.max(max - min, 1);

  return sampled.map((point) => 0.25 + ((point - min) / delta) * 0.75);
}

function MiniSparklineComponent({
  data,
  width = 110,
  height = 24,
  color = '#00C853',
  negativeColor = '#FF5252',
  positive = true,
  barWidth = 4,
  barGap = 2,
  subtle = false,
  variant = 'line',
}: MiniSparklineProps) {
  const stroke = positive ? color : negativeColor;
  const linePoints = useMemo(
    () => (variant === 'line' ? getLinePoints(data, width, height) : []),
    [data, height, variant, width],
  );
  const bars = useMemo(
    () => (variant === 'bars' ? getBars(data, width, barWidth, barGap) : []),
    [barGap, barWidth, data, variant, width],
  );

  return (
    <View
      style={[
        styles.root,
        {
          width,
          height,
          backgroundColor: subtle ? 'transparent' : withOpacity(stroke, 0.03),
          borderColor: subtle ? 'transparent' : withOpacity(stroke, 0.08),
        },
      ]}
    >
      {variant === 'line' ? (
        <View style={styles.canvas}>
          {linePoints.map((point, index) => {
            if (index === linePoints.length - 1) {
              return null;
            }

            const nextPoint = linePoints[index + 1];
            const dx = nextPoint.x - point.x;
            const dy = nextPoint.y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const centerX = (point.x + nextPoint.x) / 2;
            const centerY = (point.y + nextPoint.y) / 2;

            return (
              <View
                key={`segment-${index}`}
                style={[
                  styles.segment,
                  {
                    width: distance,
                    left: centerX - distance / 2,
                    top: centerY - 1,
                    backgroundColor: withOpacity(stroke, subtle ? 0.96 : 0.92),
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}
        </View>
      ) : (
        <View style={styles.barsRow}>
          {bars.map((value, index) => (
            <View
              key={`${index}-${value}`}
              style={[
                styles.bar,
                {
                  width: barWidth,
                  marginRight: index === bars.length - 1 ? 0 : barGap,
                  height: Math.max(4, value * height),
                  backgroundColor: withOpacity(stroke, 0.86),
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export const MiniSparkline = memo(MiniSparklineComponent);

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 12,
  },
  canvas: {
    flex: 1,
  },
  segment: {
    position: 'absolute',
    height: 2,
    borderRadius: 999,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  bar: {
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
});
