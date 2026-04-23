import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  buildOrbitChartPayload,
  buildOrbitChartPayloadFromHistory,
  type OrbitChartIndicator,
  type OrbitChartMarketHistoryInput,
  type OrbitChartMode,
  type OrbitChartTimeframe,
} from './chartData';
import {
  buildLightweightChartHtml,
  type OrbitChartHtmlColors,
  type OrbitLightweightChartRuntimeConfig,
} from './lightweightChartHtml';

export interface OrbitLightweightChartProps {
  values?: number[] | null;
  history?: OrbitChartMarketHistoryInput | null;
  height?: number;
  timeframe?: OrbitChartTimeframe;
  mode?: OrbitChartMode;
  indicators?: OrbitChartIndicator[];
  interactive?: boolean;
  compact?: boolean;
  showVolume?: boolean;
  attribution?: boolean;
  style?: StyleProp<ViewStyle>;
  colorOverrides?: Partial<OrbitChartHtmlColors>;
  emptyTitle?: string;
  emptyBody?: string;
}

function OrbitLightweightChartComponent({
  values,
  history,
  height = 240,
  timeframe = '1h',
  mode = 'candles',
  indicators = [],
  interactive = false,
  compact = false,
  showVolume = false,
  attribution = false,
  style,
  colorOverrides,
  emptyTitle = 'Grafico no disponible',
  emptyBody = 'OrbitX mostrara el grafico cuando reciba datos verificables del mercado.',
}: OrbitLightweightChartProps) {
  const { colors } = useAppTheme();
  const webViewRef = useRef<WebView>(null);
  const [webReady, setWebReady] = useState(false);
  const safeValues = Array.isArray(values) ? values : [];
  const safeIndicators = Array.isArray(indicators) ? indicators : [];
  const safeHistory =
    history && Array.isArray(history.line) && history.line.length
      ? history
      : null;

  const payload = useMemo(
    () => {
      if (safeHistory) {
        return buildOrbitChartPayloadFromHistory(safeHistory, {
          mode,
          indicators: safeIndicators,
          compact,
          showVolume,
          positiveColor: colors.profit,
          negativeColor: colors.loss,
        });
      }

      return buildOrbitChartPayload(safeValues, {
        timeframe,
        mode,
        indicators: safeIndicators,
        compact,
        showVolume,
        positiveColor: colors.profit,
        negativeColor: colors.loss,
      });
    },
    [
      colors.loss,
      colors.profit,
      compact,
      mode,
      safeHistory,
      safeIndicators,
      safeValues,
      showVolume,
      timeframe,
    ],
  );

  const chartConfig = useMemo<OrbitLightweightChartRuntimeConfig>(
    () => ({
      payload,
      height,
      interactive,
      attribution,
      colors: {
        background: colors.background,
        backgroundAlt: colors.backgroundAlt,
        text: colors.text,
        textMuted: colors.textMuted,
        border: colors.border,
        borderStrong: colors.borderStrong,
        grid: withOpacity(colors.border, 0.18),
        gridStrong: withOpacity(colors.borderStrong, 0.36),
        primary: colors.primary,
        profit: colors.profit,
        loss: colors.loss,
        ...colorOverrides,
      },
    }),
    [
      attribution,
      colors.background,
      colors.backgroundAlt,
      colors.border,
      colors.borderStrong,
      colors.loss,
      colors.primary,
      colors.profit,
      colors.text,
      colors.textMuted,
      colorOverrides,
      height,
      interactive,
      payload,
    ],
  );

  const html = useMemo(
    () =>
      Platform.OS === 'web'
        ? buildLightweightChartHtml({ initialConfig: chartConfig })
        : buildLightweightChartHtml(),
    [chartConfig],
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    if (payload.line.length < 2 || !webReady || !webViewRef.current) {
      return;
    }

    const serialized = JSON.stringify(chartConfig).replace(/<\/script/gi, '<\\/script');
    webViewRef.current.injectJavaScript(`window.__applyOrbitChart(${serialized}); true;`);
  }, [chartConfig, payload.line.length, webReady]);

  if (payload.line.length < 2) {
    return (
      <View style={[styles.shell, { height }, style]}>
        <View
          style={[
            styles.emptyState,
            {
              backgroundColor: colors.backgroundAlt,
              borderColor: withOpacity(colors.border, 0.78),
            },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{emptyTitle}</Text>
          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>{emptyBody}</Text>
        </View>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.shell, { height }, style]}>
        <iframe
          srcDoc={html}
          title="OrbitX Trading Chart"
          style={{
            width: '100%',
            height: '100%',
            border: '0',
            background: colors.background,
            pointerEvents: interactive ? 'auto' : 'none',
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.shell, { height }, style]} pointerEvents={interactive ? 'auto' : 'none'}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        onLoadEnd={() => setWebReady(true)}
        androidLayerType="hardware"
        scrollEnabled={false}
        overScrollMode="never"
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        nestedScrollEnabled={interactive}
        automaticallyAdjustContentInsets={false}
        setSupportMultipleWindows={false}
        textZoom={100}
      />
    </View>
  );
}

export const OrbitLightweightChart = memo(OrbitLightweightChartComponent);

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    overflow: 'hidden',
  },
  emptyState: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADII.lg,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  emptyBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
