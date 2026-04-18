import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  OrbitLightweightChart,
  type OrbitLightweightChartProps,
} from '../charts/OrbitLightweightChart';

interface PriceChartProps
  extends Pick<
    OrbitLightweightChartProps,
    | 'values'
    | 'height'
    | 'timeframe'
    | 'mode'
    | 'indicators'
    | 'interactive'
    | 'emptyTitle'
    | 'emptyBody'
  > {
  positive?: boolean;
  showHeader?: boolean;
  showStats?: boolean;
  borderless?: boolean;
  showVolume?: boolean;
}

function PriceChartComponent({
  values,
  height = 188,
  timeframe = '1h',
  mode = 'candles',
  indicators = [],
  interactive = false,
  borderless = false,
  showVolume = false,
  emptyTitle,
  emptyBody,
}: PriceChartProps) {
  return (
    <View style={[styles.root, borderless ? styles.borderless : null]}>
      <OrbitLightweightChart
        values={values}
        height={height}
        timeframe={timeframe}
        mode={mode}
        indicators={indicators}
        interactive={interactive}
        compact
        showVolume={showVolume}
        emptyTitle={emptyTitle}
        emptyBody={emptyBody}
      />
    </View>
  );
}

export const PriceChart = memo(PriceChartComponent);

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  borderless: {
    marginHorizontal: 0,
  },
});
