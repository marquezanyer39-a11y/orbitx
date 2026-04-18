import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { OrbitLightweightChart } from '../../../components/charts/OrbitLightweightChart';
import type { MarketChartHistory } from '../../types';

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'] as const;

interface Props {
  history?: MarketChartHistory | null;
  timeframe: (typeof TIMEFRAMES)[number];
  onChangeTimeframe: (timeframe: (typeof TIMEFRAMES)[number]) => void;
  onOpenFullscreen: () => void;
  compact?: boolean;
}

export function TradeChart({
  history,
  timeframe,
  onChangeTimeframe,
  onOpenFullscreen,
  compact = false,
}: Props) {
  const { colors } = useAppTheme();
  const previewPoints = history?.line?.slice(-18) ?? [];
  const maxValue = Math.max(...previewPoints.map((point) => point.value), 1);

  if (compact) {
    if (Platform.OS !== 'web') {
      return (
        <View
          style={[
            styles.compactShell,
            {
              backgroundColor: withOpacity(colors.fieldBackground, 0.88),
              borderColor: colors.border,
            },
          ]}
        >
          {previewPoints.length > 1 ? (
            <>
              <View style={styles.nativePreviewBars}>
                {previewPoints.map((point, index) => (
                  <View
                    key={`${point.time}-${index}`}
                    style={[
                      styles.nativePreviewBar,
                      {
                        height: `${Math.max((point.value / maxValue) * 100, 12)}%`,
                        backgroundColor:
                          index === previewPoints.length - 1
                            ? colors.primary
                            : withOpacity(colors.profit, 0.72),
                      },
                    ]}
                  />
                ))}
              </View>
              <Pressable onPress={onOpenFullscreen} style={styles.nativePreviewLink}>
                <Text style={[styles.nativePreviewLabel, { color: colors.text }]}>
                  Ver grafico
                </Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.nativePreviewEmpty}>
              <Text style={[styles.nativePreviewLabel, { color: colors.textMuted }]}>
                Grafico listo para abrir
              </Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <View
        style={[
          styles.compactShell,
          { backgroundColor: withOpacity(colors.fieldBackground, 0.88), borderColor: colors.border },
        ]}
      >
        <OrbitLightweightChart
          history={history}
          height={70}
          timeframe={timeframe}
          mode="line"
          indicators={[]}
          compact
          interactive={false}
          showVolume={false}
          emptyTitle="Grafico en actualizacion"
          emptyBody="Estamos sincronizando este par."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeframeRow}>
          {TIMEFRAMES.map((item) => {
            const active = item === timeframe;
            return (
              <Pressable
                key={item}
                onPress={() => onChangeTimeframe(item)}
                style={[
                  styles.timeframeChip,
                  {
                    backgroundColor: active ? colors.primarySoft : colors.fieldBackground,
                    borderColor: active ? colors.borderStrong : colors.border,
                  },
                ]}
              >
                <Text style={[styles.timeframeLabel, { color: active ? colors.text : colors.textMuted }]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable onPress={onOpenFullscreen}>
          <Text style={[styles.fullscreen, { color: colors.text }]}>Ver grafico</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.expandedShell,
          { backgroundColor: withOpacity(colors.fieldBackground, 0.88), borderColor: colors.border },
        ]}
      >
        <OrbitLightweightChart
          history={history}
          height={206}
          timeframe={timeframe}
          mode="candles"
          indicators={['MA']}
          interactive
          showVolume
          emptyTitle="Grafico en actualizacion"
          emptyBody="OrbitX esta sincronizando la serie de este par."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  timeframeRow: {
    gap: 6,
  },
  timeframeChip: {
    minHeight: 28,
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeframeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
  fullscreen: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  expandedShell: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 2,
  },
  compactShell: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 0,
  },
  nativePreviewBars: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  nativePreviewBar: {
    flex: 1,
    borderRadius: 999,
    minHeight: 8,
  },
  nativePreviewLink: {
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  nativePreviewEmpty: {
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativePreviewLabel: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
});
