import type { OrbitChartPayload } from './chartData';
import { LIGHTWEIGHT_CHARTS_STANDALONE } from './lightweightChartsBundle';

export interface OrbitChartHtmlColors {
  background: string;
  backgroundAlt: string;
  text: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  grid: string;
  gridStrong: string;
  primary: string;
  profit: string;
  loss: string;
}

export interface OrbitLightweightChartRuntimeConfig {
  payload: OrbitChartPayload;
  height: number;
  interactive: boolean;
  attribution: boolean;
  colors: OrbitChartHtmlColors;
}

interface BuildLightweightChartHtmlOptions {
  initialConfig?: OrbitLightweightChartRuntimeConfig | null;
}

export function buildLightweightChartHtml({
  initialConfig = null,
}: BuildLightweightChartHtmlOptions = {}) {
  const initialConfigJson = JSON.stringify(initialConfig);
  const scriptSource = LIGHTWEIGHT_CHARTS_STANDALONE.replace(/<\/script/gi, '<\\/script');

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <style>
      :root {
        color-scheme: dark;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #0b0b0f;
        color: #ffffff;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        text-size-adjust: 100%;
      }

      #chart-shell {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 180px;
        isolation: isolate;
        background:
          radial-gradient(circle at 50% 10%, rgba(123, 63, 228, 0.14) 0%, transparent 38%),
          linear-gradient(180deg, #12101a 0%, #0b0b0f 100%);
      }

      #chart-shell::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 84% 18%, rgba(123, 63, 228, 0.12) 0%, transparent 18%),
          radial-gradient(circle at 18% 82%, rgba(123, 63, 228, 0.1) 0%, transparent 20%);
        z-index: 0;
      }

      #chart {
        width: 100%;
        height: 100%;
        position: relative;
        z-index: 1;
        transform: translateZ(0);
        backface-visibility: hidden;
      }

      #empty-state {
        position: absolute;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
        text-align: center;
        color: #a3a1b2;
        font-size: 12px;
        line-height: 1.5;
        z-index: 2;
      }
    </style>
  </head>
  <body>
    <div id="chart-shell">
      <div id="chart"></div>
      <div id="empty-state">No hay datos de grafico disponibles por ahora.</div>
    </div>

    <script>${scriptSource}</script>
    <script>
      const INITIAL_CONFIG = ${initialConfigJson};
      const container = document.getElementById('chart');
      const emptyState = document.getElementById('empty-state');
      const orbitChartState = {
        chart: null,
        resizeObserver: null,
        resizeHandler: null,
      };

      function showEmptyState(message) {
        emptyState.textContent = message || 'No hay datos de grafico disponibles por ahora.';
        emptyState.style.display = 'flex';
      }

      function hideEmptyState() {
        emptyState.style.display = 'none';
      }

      function cleanupChart() {
        if (orbitChartState.resizeObserver) {
          orbitChartState.resizeObserver.disconnect();
          orbitChartState.resizeObserver = null;
        }

        if (orbitChartState.resizeHandler) {
          window.removeEventListener('resize', orbitChartState.resizeHandler);
          orbitChartState.resizeHandler = null;
        }

        if (orbitChartState.chart) {
          orbitChartState.chart.remove();
          orbitChartState.chart = null;
        }
      }

      function applyPaneHeights(chart, payload, indicators) {
        const panes = typeof chart.panes === 'function' ? chart.panes() : [];
        if (!panes.length) {
          return;
        }

        const total = container.clientHeight || 360;
        const mainHeight = payload.compact
          ? total
          : Math.round(total * (payload.showVolume || indicators.length ? 0.56 : 0.82));

        panes[0]?.setHeight?.(mainHeight);

        let paneCursor = 1;
        if (payload.showVolume) {
          panes[paneCursor]?.setHeight?.(Math.round(total * 0.16));
          paneCursor += 1;
        }

        if (indicators.includes('RSI')) {
          panes[paneCursor]?.setHeight?.(Math.round(total * 0.14));
          paneCursor += 1;
        }

        if (indicators.includes('MACD')) {
          panes[paneCursor]?.setHeight?.(Math.round(total * 0.16));
        }
      }

      function applyChartConfig(config) {
        cleanupChart();

        const payload = config?.payload;
        const colors = config?.colors;

        if (!payload || !Array.isArray(payload.line) || payload.line.length < 2 || !colors) {
          showEmptyState('No hay datos de grafico disponibles por ahora.');
          return;
        }

        hideEmptyState();

        const { createChart, CandlestickSeries, HistogramSeries, LineSeries } = window.LightweightCharts;
        const indicators = Array.isArray(payload.indicators) ? payload.indicators : [];

        const chart = createChart(container, {
          width: container.clientWidth || 360,
          height: container.clientHeight || config.height,
          attributionLogo: config.attribution,
          layout: {
            background: { type: 'solid', color: colors.background },
            textColor: colors.text,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            fontSize: payload.compact ? 10 : 11,
          },
          panes: {
            enableResize: false,
            separatorColor: colors.border,
            separatorHoverColor: colors.borderStrong,
          },
          autoSize: false,
          localization: {
            locale: 'es-PE',
          },
          kineticScroll: {
            mouse: config.interactive,
            touch: config.interactive,
          },
          grid: {
            vertLines: { color: colors.grid, visible: true, style: 0 },
            horzLines: { color: colors.grid, visible: true, style: 0 },
          },
          rightPriceScale: {
            visible: true,
            borderVisible: true,
            borderColor: colors.borderStrong,
            scaleMargins: { top: payload.compact ? 0.12 : 0.08, bottom: payload.compact ? 0.1 : 0.08 },
          },
          leftPriceScale: {
            visible: false,
          },
          crosshair: {
            mode: 0,
            vertLine: {
              color: colors.gridStrong,
              width: 1,
              labelBackgroundColor: colors.backgroundAlt,
              labelVisible: true,
            },
            horzLine: {
              color: colors.gridStrong,
              width: 1,
              labelBackgroundColor: colors.backgroundAlt,
              labelVisible: true,
            },
          },
          handleScale: config.interactive
            ? {
                axisPressedMouseMove: { time: true, price: true },
                mouseWheel: true,
                pinch: true,
              }
            : {
                axisPressedMouseMove: false,
                mouseWheel: false,
                pinch: false,
              },
          handleScroll: config.interactive
            ? {
                pressedMouseMove: true,
                mouseWheel: true,
                horzTouchDrag: true,
                vertTouchDrag: false,
              }
            : {
                pressedMouseMove: false,
                mouseWheel: false,
                horzTouchDrag: false,
                vertTouchDrag: false,
              },
          timeScale: {
            visible: true,
            borderVisible: true,
            borderColor: colors.borderStrong,
            timeVisible: true,
            secondsVisible: false,
            rightOffset: payload.compact ? 4 : 6,
            barSpacing: payload.compact ? 7 : 10,
            minBarSpacing: payload.compact ? 5 : 4,
            fixLeftEdge: false,
            lockVisibleTimeRangeOnResize: true,
            ticksVisible: true,
          },
        });

        orbitChartState.chart = chart;

        const priceFormat = {
          type: 'price',
          precision: payload.precision,
          minMove: payload.minMove,
        };

        const mainSeries =
          payload.mode === 'candles'
            ? chart.addSeries(
                CandlestickSeries,
                {
                  priceFormat,
                  upColor: colors.profit,
                  downColor: colors.loss,
                  borderVisible: false,
                  wickUpColor: colors.profit,
                  wickDownColor: colors.loss,
                  lastValueVisible: true,
                  priceLineVisible: true,
                  priceLineWidth: 1,
                  priceLineColor: colors.primary,
                  priceLineStyle: 2,
                },
                0
              )
            : chart.addSeries(
                LineSeries,
                {
                  priceFormat,
                  color:
                    payload.line[payload.line.length - 1].value >= payload.line[0].value
                      ? colors.profit
                      : colors.loss,
                  lineWidth: payload.compact ? 2 : 2.5,
                  crosshairMarkerVisible: false,
                  lastValueVisible: true,
                  priceLineVisible: true,
                  priceLineWidth: 1,
                  priceLineColor: colors.primary,
                  priceLineStyle: 2,
                },
                0
              );

        if (payload.mode === 'candles') {
          mainSeries.setData(payload.candles);
        } else {
          mainSeries.setData(payload.line);
        }

        if (indicators.includes('MA') && payload.ma.length) {
          const maSeries = chart.addSeries(
            LineSeries,
            {
              priceFormat,
              color: '#F6D365',
              lineWidth: 1.25,
              crosshairMarkerVisible: false,
              lastValueVisible: false,
              priceLineVisible: false,
              lineStyle: 0,
            },
            0
          );
          maSeries.setData(payload.ma);
        }

        if (indicators.includes('EMA') && payload.ema.length) {
          const emaSeries = chart.addSeries(
            LineSeries,
            {
              priceFormat,
              color: '#58A6FF',
              lineWidth: 1.25,
              lineStyle: 2,
              crosshairMarkerVisible: false,
              lastValueVisible: false,
              priceLineVisible: false,
            },
            0
          );
          emaSeries.setData(payload.ema);
        }

        if (indicators.includes('BOLL') && payload.bollingerUpper.length && payload.bollingerLower.length) {
          const bollUpperSeries = chart.addSeries(
            LineSeries,
            {
              priceFormat,
              color: '#D7A5FF',
              lineWidth: 1.1,
              lineStyle: 1,
              crosshairMarkerVisible: false,
              lastValueVisible: false,
              priceLineVisible: false,
            },
            0
          );
          bollUpperSeries.setData(payload.bollingerUpper);

          const bollLowerSeries = chart.addSeries(
            LineSeries,
            {
              priceFormat,
              color: '#8C6BFF',
              lineWidth: 1.1,
              lineStyle: 1,
              crosshairMarkerVisible: false,
              lastValueVisible: false,
              priceLineVisible: false,
            },
            0
          );
          bollLowerSeries.setData(payload.bollingerLower);
        }

        if (indicators.includes('VWAP') && payload.vwap.length) {
          const vwapSeries = chart.addSeries(
            LineSeries,
            {
              priceFormat,
              color: '#7CE7FF',
              lineWidth: 1.25,
              lineStyle: 2,
              crosshairMarkerVisible: false,
              lastValueVisible: false,
              priceLineVisible: false,
            },
            0
          );
          vwapSeries.setData(payload.vwap);
        }

        let nextPaneIndex = 1;

        if (payload.showVolume && payload.volume.length) {
          const volumeSeries = chart.addSeries(
            HistogramSeries,
            {
              priceFormat: { type: 'volume' },
              priceScaleId: '',
              base: 0,
              lastValueVisible: false,
              priceLineVisible: false,
            },
            nextPaneIndex
          );
          volumeSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.08, bottom: 0.04 },
            visible: true,
            borderVisible: false,
          });
          volumeSeries.setData(payload.volume);
          nextPaneIndex += 1;
        }

        if (indicators.includes('RSI') && payload.rsi.length) {
          const rsiSeries = chart.addSeries(
            LineSeries,
            {
              color: '#B388FF',
              lineWidth: 1.4,
              crosshairMarkerVisible: false,
              lastValueVisible: false,
              priceLineVisible: false,
              priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
            },
            nextPaneIndex
          );
          rsiSeries.setData(payload.rsi);
          rsiSeries.createPriceLine({
            price: 70,
            color: colors.borderStrong,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: false,
          });
          rsiSeries.createPriceLine({
            price: 30,
            color: colors.borderStrong,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: false,
          });
          nextPaneIndex += 1;
        }

        if (indicators.includes('MACD') && payload.macd.length) {
          const macdHistogramSeries = chart.addSeries(
            HistogramSeries,
            {
              priceScaleId: '',
              base: 0,
              lastValueVisible: false,
              priceLineVisible: false,
            },
            nextPaneIndex
          );
          macdHistogramSeries.setData(payload.macdHistogram);
          macdHistogramSeries.priceScale().applyOptions({
            visible: true,
            borderVisible: false,
          });

          const macdSeries = chart.addSeries(
            LineSeries,
            {
              color: '#00D9FF',
              lineWidth: 1.2,
              crosshairMarkerVisible: false,
              lastValueVisible: false,
              priceLineVisible: false,
            },
            nextPaneIndex
          );
          macdSeries.setData(payload.macd);

          const macdSignalSeries = chart.addSeries(
            LineSeries,
            {
              color: '#FFB84D',
              lineWidth: 1.2,
              crosshairMarkerVisible: false,
              lastValueVisible: false,
              priceLineVisible: false,
            },
            nextPaneIndex
          );
          macdSignalSeries.setData(payload.macdSignal);
        }

        const resize = () => {
          chart.resize(container.clientWidth || 360, container.clientHeight || config.height, true);
          applyPaneHeights(chart, payload, indicators);
        };

        resize();
        chart.timeScale().fitContent();

        requestAnimationFrame(() => {
          const canvases = container.querySelectorAll('canvas');
          canvases.forEach((canvas) => {
            canvas.style.transform = 'translateZ(0)';
            canvas.style.backfaceVisibility = 'hidden';
          });
        });

        if (typeof ResizeObserver !== 'undefined') {
          const observer = new ResizeObserver(() => resize());
          observer.observe(container);
          orbitChartState.resizeObserver = observer;
        } else {
          orbitChartState.resizeHandler = resize;
          window.addEventListener('resize', resize);
        }
      }

      window.__applyOrbitChart = applyChartConfig;

      window.addEventListener('message', (event) => {
        try {
          const data =
            typeof event.data === 'string'
              ? JSON.parse(event.data)
              : event.data;

          if (data?.type === 'orbitx-chart:update' && data.config) {
            applyChartConfig(data.config);
          }
        } catch {
          // Ignore malformed updates from the host app.
        }
      });

      if (INITIAL_CONFIG) {
        applyChartConfig(INITIAL_CONFIG);
      } else {
        showEmptyState('Esperando datos del mercado...');
      }
    </script>
  </body>
</html>`;
}
