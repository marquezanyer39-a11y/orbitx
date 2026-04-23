export type OrbitChartTimeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';
export type OrbitChartMode = 'candles' | 'line';
export type OrbitChartIndicator = 'MA' | 'EMA' | 'RSI' | 'MACD' | 'BOLL' | 'VWAP';

export interface OrbitChartPoint {
  time: number;
  value: number;
}

export interface OrbitChartCandlePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface OrbitChartHistogramPoint {
  time: number;
  value: number;
  color: string;
}

export interface OrbitChartPayload {
  mode: OrbitChartMode;
  candles: OrbitChartCandlePoint[];
  line: OrbitChartPoint[];
  volume: OrbitChartHistogramPoint[];
  ma: OrbitChartPoint[];
  maFast: OrbitChartPoint[];
  maMid: OrbitChartPoint[];
  maSlow: OrbitChartPoint[];
  ema: OrbitChartPoint[];
  bollingerUpper: OrbitChartPoint[];
  bollingerLower: OrbitChartPoint[];
  vwap: OrbitChartPoint[];
  rsi: OrbitChartPoint[];
  macd: OrbitChartPoint[];
  macdSignal: OrbitChartPoint[];
  macdHistogram: OrbitChartHistogramPoint[];
  compact: boolean;
  showVolume: boolean;
  indicators: OrbitChartIndicator[];
  precision: number;
  minMove: number;
}

export interface OrbitChartMarketHistoryInput {
  line: OrbitChartPoint[];
  candles?: OrbitChartCandlePoint[];
  volume?: Array<{ time: number; value: number }>;
}

interface BuildChartPayloadOptions {
  timeframe: OrbitChartTimeframe;
  mode: OrbitChartMode;
  indicators?: OrbitChartIndicator[];
  compact?: boolean;
  showVolume?: boolean;
  positiveColor: string;
  negativeColor: string;
}

const TIMEFRAME_MINUTES: Record<OrbitChartTimeframe, number> = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '1h': 60,
  '4h': 240,
  '1D': 24 * 60,
};

const SMOOTHING_WINDOW: Record<OrbitChartTimeframe, number> = {
  '1m': 1,
  '5m': 2,
  '15m': 2,
  '1h': 3,
  '4h': 5,
  '1D': 7,
};

function sanitizeSeries(values?: number[] | null) {
  if (!Array.isArray(values)) {
    return [];
  }

  const cleaned = values.filter((value) => Number.isFinite(value) && value > 0);

  return cleaned;
}

function smoothSeries(values: number[], windowSize: number) {
  if (windowSize <= 1) {
    return values;
  }

  return values.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const slice = values.slice(start, index + 1);
    const average = slice.reduce((sum, value) => sum + value, 0) / slice.length;
    return average;
  });
}

function buildTimeline(values: number[], timeframe: OrbitChartTimeframe) {
  const stepSeconds = TIMEFRAME_MINUTES[timeframe] * 60;
  const end = Math.floor(Date.now() / 1000);
  const start = end - stepSeconds * (values.length - 1);

  return values.map((value, index) => ({
    time: start + index * stepSeconds,
    value,
  }));
}

function buildCandles(series: OrbitChartPoint[]) {
  return series.map((point, index) => {
    const previousClose = index === 0 ? series[0].value * 0.996 : series[index - 1].value;
    const open = previousClose;
    const close = point.value;
    const swing = Math.max(Math.abs(close - open), close * 0.0038);
    const high = Math.max(open, close) + swing * 0.42;
    const low = Math.min(open, close) - swing * 0.36;

    return {
      time: point.time,
      open,
      high,
      low,
      close,
    };
  });
}

function buildVolume(
  candles: OrbitChartCandlePoint[],
  positiveColor: string,
  negativeColor: string,
) {
  return candles.map((candle) => {
    const value = Math.max(Math.abs(candle.close - candle.open) * 1800, candle.close * 0.14);
    return {
      time: candle.time,
      value,
      color: candle.close >= candle.open ? `${positiveColor}55` : `${negativeColor}55`,
    };
  });
}

function movingAverage(values: number[], period: number) {
  return values.map((_, index) => {
    if (index + 1 < period) {
      return null;
    }

    const slice = values.slice(index - period + 1, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / period;
  });
}

function exponentialMovingAverage(values: number[], period: number) {
  const multiplier = 2 / (period + 1);
  const result: number[] = [];

  values.forEach((value, index) => {
    if (index === 0) {
      result.push(value);
      return;
    }

    const previous = result[index - 1];
    result.push((value - previous) * multiplier + previous);
  });

  return result;
}

function relativeStrengthIndex(values: number[], period = 14) {
  if (values.length <= period) {
    return values.map(() => null);
  }

  const changes = values.map((value, index) => (index === 0 ? 0 : value - values[index - 1]));
  const gains = changes.map((change) => Math.max(change, 0));
  const losses = changes.map((change) => Math.max(-change, 0));

  let averageGain =
    gains.slice(1, period + 1).reduce((sum, value) => sum + value, 0) / period;
  let averageLoss =
    losses.slice(1, period + 1).reduce((sum, value) => sum + value, 0) / period;

  const result = values.map(() => null as number | null);
  result[period] = averageLoss === 0 ? 100 : 100 - 100 / (1 + averageGain / averageLoss);

  for (let index = period + 1; index < values.length; index += 1) {
    averageGain = (averageGain * (period - 1) + gains[index]) / period;
    averageLoss = (averageLoss * (period - 1) + losses[index]) / period;
    const relativeStrength = averageLoss === 0 ? 0 : averageGain / averageLoss;
    result[index] = averageLoss === 0 ? 100 : 100 - 100 / (1 + relativeStrength);
  }

  return result;
}

function buildMacd(values: number[]) {
  const fast = exponentialMovingAverage(values, 12);
  const slow = exponentialMovingAverage(values, 26);
  const macd = values.map((_, index) => fast[index] - slow[index]);
  const signal = exponentialMovingAverage(macd, 9);
  const histogram = macd.map((value, index) => value - signal[index]);

  return { macd, signal, histogram };
}

function standardDeviation(values: number[]) {
  if (!values.length) {
    return 0;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;

  return Math.sqrt(variance);
}

function buildBollingerBands(values: number[], period = 20, multiplier = 2) {
  const middle = movingAverage(values, period);

  const upper = values.map((_, index) => {
    if (index + 1 < period) {
      return null;
    }

    const slice = values.slice(index - period + 1, index + 1);
    const deviation = standardDeviation(slice);
    const basis = middle[index];
    return basis === null ? null : basis + deviation * multiplier;
  });

  const lower = values.map((_, index) => {
    if (index + 1 < period) {
      return null;
    }

    const slice = values.slice(index - period + 1, index + 1);
    const deviation = standardDeviation(slice);
    const basis = middle[index];
    return basis === null ? null : basis - deviation * multiplier;
  });

  return { upper, lower };
}

function buildVwap(
  times: number[],
  candles: OrbitChartCandlePoint[],
  volumePoints: OrbitChartHistogramPoint[],
) {
  let cumulativePriceVolume = 0;
  let cumulativeVolume = 0;

  return candles.map((candle, index) => {
    const volume = volumePoints[index]?.value ?? 0;
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    cumulativePriceVolume += typicalPrice * volume;
    cumulativeVolume += volume;

    return {
      time: times[index],
      value: cumulativeVolume > 0 ? cumulativePriceVolume / cumulativeVolume : candle.close,
    };
  });
}

function toLinePoints(times: number[], values: Array<number | null>) {
  return values.reduce<OrbitChartPoint[]>((points, value, index) => {
    if (value === null || !Number.isFinite(value)) {
      return points;
    }

    points.push({
      time: times[index],
      value,
    });

    return points;
  }, []);
}

function toHistogramPoints(
  times: number[],
  values: Array<number | null>,
  positiveColor: string,
  negativeColor: string,
) {
  return values.reduce<OrbitChartHistogramPoint[]>((points, value, index) => {
    if (value === null || !Number.isFinite(value)) {
      return points;
    }

    points.push({
      time: times[index],
      value,
      color: value >= 0 ? `${positiveColor}88` : `${negativeColor}88`,
    });

    return points;
  }, []);
}

function inferPricePrecision(values: number[]) {
  const latest = values[values.length - 1] ?? 1;

  if (latest >= 1000) {
    return { precision: 2, minMove: 0.01 };
  }

  if (latest >= 1) {
    return { precision: 4, minMove: 0.0001 };
  }

  if (latest >= 0.01) {
    return { precision: 6, minMove: 0.000001 };
  }

  return { precision: 8, minMove: 0.00000001 };
}

function normalizeHistoryInput(history: OrbitChartMarketHistoryInput) {
  const line = Array.isArray(history.line)
    ? history.line.filter(
        (point): point is OrbitChartPoint =>
          Boolean(point) && Number.isFinite(point.time) && Number.isFinite(point.value) && point.value > 0,
      )
    : [];

  const candles =
    Array.isArray(history.candles) && history.candles.length
      ? history.candles.filter(
          (point): point is OrbitChartCandlePoint =>
            Boolean(point) &&
            Number.isFinite(point.time) &&
            Number.isFinite(point.open) &&
            Number.isFinite(point.high) &&
            Number.isFinite(point.low) &&
            Number.isFinite(point.close) &&
            point.close > 0,
        )
      : buildCandles(line);

  const normalizedLine =
    line.length >= 2
      ? line
      : candles.map((candle) => ({
          time: candle.time,
          value: candle.close,
        }));

  const volume =
    Array.isArray(history.volume) && history.volume.length
      ? history.volume
          .filter(
            (point): point is { time: number; value: number } =>
              Boolean(point) &&
              Number.isFinite(point.time) &&
              Number.isFinite(point.value) &&
              point.value >= 0,
          )
          .map((point, index) => ({
            time: point.time,
            value: point.value,
            color:
              candles[index]?.close >= candles[index]?.open
                ? '#00FFA355'
                : '#FF4D4D55',
          }))
      : [];

  return {
    line: normalizedLine,
    candles,
    volume,
  };
}

export function buildOrbitChartPayload(
  values: number[] | undefined | null,
  {
    timeframe,
    mode,
    indicators = [],
    compact = false,
    showVolume = true,
    positiveColor,
    negativeColor,
  }: BuildChartPayloadOptions,
): OrbitChartPayload {
  const sanitized = sanitizeSeries(values);
  const safeIndicators = Array.isArray(indicators) ? indicators : [];

  if (sanitized.length < 2) {
    return {
      mode,
      candles: [],
      line: [],
      volume: [],
      ma: [],
      maFast: [],
      maMid: [],
      maSlow: [],
      ema: [],
      bollingerUpper: [],
      bollingerLower: [],
      vwap: [],
      rsi: [],
      macd: [],
      macdSignal: [],
      macdHistogram: [],
      compact,
      showVolume,
      indicators: safeIndicators,
      precision: 2,
      minMove: 0.01,
    };
  }

  const smoothed = smoothSeries(sanitized, SMOOTHING_WINDOW[timeframe]);
  const timeline = buildTimeline(smoothed, timeframe);
  const times = timeline.map((point) => point.time);
  const closes = timeline.map((point) => point.value);
  const candles = buildCandles(timeline);
  const volume = buildVolume(candles, positiveColor, negativeColor);
  const maFast = toLinePoints(times, movingAverage(closes, 5));
  const maMid = toLinePoints(times, movingAverage(closes, 10));
  const maSlow = toLinePoints(times, movingAverage(closes, 30));
  const ema = toLinePoints(times, exponentialMovingAverage(closes, 9));
  const bollinger = buildBollingerBands(closes, 20, 2);
  const bollingerUpper = toLinePoints(times, bollinger.upper);
  const bollingerLower = toLinePoints(times, bollinger.lower);
  const vwap = buildVwap(times, candles, volume);
  const rsi = toLinePoints(times, relativeStrengthIndex(closes, 14));
  const macdData = buildMacd(closes);
  const macd = toLinePoints(times, macdData.macd);
  const macdSignal = toLinePoints(times, macdData.signal);
  const macdHistogram = toHistogramPoints(times, macdData.histogram, positiveColor, negativeColor);
  const { precision, minMove } = inferPricePrecision(closes);

  return {
    mode,
    candles,
    line: timeline,
    volume,
    ma: maFast,
    maFast,
    maMid,
    maSlow,
    ema,
    bollingerUpper,
    bollingerLower,
    vwap,
    rsi,
    macd,
    macdSignal,
    macdHistogram,
    compact,
    showVolume,
    indicators: safeIndicators,
    precision,
    minMove,
  };
}

export function buildOrbitChartPayloadFromHistory(
  history: OrbitChartMarketHistoryInput,
  {
    mode,
    indicators = [],
    compact = false,
    showVolume = true,
    positiveColor,
    negativeColor,
  }: Omit<BuildChartPayloadOptions, 'timeframe'>,
): OrbitChartPayload {
  const safeIndicators = Array.isArray(indicators) ? indicators : [];
  const normalized = normalizeHistoryInput(history);
  const closes = normalized.line.map((point) => point.value);

  if (normalized.line.length < 2) {
    return {
      mode,
      candles: [],
      line: [],
      volume: [],
      ma: [],
      maFast: [],
      maMid: [],
      maSlow: [],
      ema: [],
      bollingerUpper: [],
      bollingerLower: [],
      vwap: [],
      rsi: [],
      macd: [],
      macdSignal: [],
      macdHistogram: [],
      compact,
      showVolume,
      indicators: safeIndicators,
      precision: 2,
      minMove: 0.01,
    };
  }

  const times = normalized.line.map((point) => point.time);
  const maFast = toLinePoints(times, movingAverage(closes, 5));
  const maMid = toLinePoints(times, movingAverage(closes, 10));
  const maSlow = toLinePoints(times, movingAverage(closes, 30));
  const ema = toLinePoints(times, exponentialMovingAverage(closes, 9));
  const bollinger = buildBollingerBands(closes, 20, 2);
  const bollingerUpper = toLinePoints(times, bollinger.upper);
  const bollingerLower = toLinePoints(times, bollinger.lower);
  const rsi = toLinePoints(times, relativeStrengthIndex(closes, 14));
  const macdData = buildMacd(closes);
  const macd = toLinePoints(times, macdData.macd);
  const macdSignal = toLinePoints(times, macdData.signal);
  const macdHistogram = toHistogramPoints(times, macdData.histogram, positiveColor, negativeColor);
  const volume =
    normalized.volume.length > 0
      ? normalized.volume.map((point, index) => ({
          ...point,
          color:
            normalized.candles[index]?.close >= normalized.candles[index]?.open
              ? `${positiveColor}55`
              : `${negativeColor}55`,
        }))
      : buildVolume(normalized.candles, positiveColor, negativeColor);
  const vwap = buildVwap(times, normalized.candles, volume);
  const { precision, minMove } = inferPricePrecision(closes);

  return {
    mode,
    candles: normalized.candles,
    line: normalized.line,
    volume,
    ma: maFast,
    maFast,
    maMid,
    maSlow,
    ema,
    bollingerUpper,
    bollingerLower,
    vwap,
    rsi,
    macd,
    macdSignal,
    macdHistogram,
    compact,
    showVolume,
    indicators: safeIndicators,
    precision,
    minMove,
  };
}
