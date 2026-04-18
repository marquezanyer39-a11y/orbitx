import { usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getLocaleDirection } from '../../constants/i18n';
import { FONT, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useOrbitStore } from '../../store/useOrbitStore';
import { OrbitMotionVideoBackground } from './OrbitMotionVideoBackground';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundMode?: 'default' | 'motionVideo' | 'plain';
}

const DRIFT_BEAMS = [
  { top: 0, left: 8, width: 220, height: 14, rotate: '-24deg', alpha: 0.26 },
  { top: 28, left: 40, width: 168, height: 8, rotate: '-24deg', alpha: 0.18 },
  { top: 66, left: -10, width: 196, height: 12, rotate: '-24deg', alpha: 0.2 },
  { top: 104, left: 54, width: 146, height: 6, rotate: '-24deg', alpha: 0.14 },
] as const;

const HALO_BANDS = [
  { top: 10, left: 0, width: 220, height: 62, rotate: '-6deg', alpha: 0.22 },
  { top: 70, left: 22, width: 186, height: 46, rotate: '-8deg', alpha: 0.18 },
  { top: 116, left: 34, width: 154, height: 28, rotate: '-10deg', alpha: 0.16 },
] as const;

const PARALLAX_PANELS = [
  { top: 0, left: 18, width: 168, height: 116, rotate: '-9deg' },
  { top: 54, left: 72, width: 142, height: 96, rotate: '-3deg' },
  { top: 116, left: 8, width: 132, height: 86, rotate: '-12deg' },
] as const;

const DUST_PARTICLES = [
  { top: 8, left: 16, size: 9, alpha: 0.38 },
  { top: 22, left: 84, size: 5, alpha: 0.24 },
  { top: 48, left: 42, size: 7, alpha: 0.28 },
  { top: 68, left: 132, size: 4, alpha: 0.18 },
  { top: 92, left: 56, size: 10, alpha: 0.34 },
  { top: 110, left: 116, size: 6, alpha: 0.22 },
  { top: 132, left: 26, size: 5, alpha: 0.18 },
  { top: 148, left: 88, size: 8, alpha: 0.3 },
  { top: 164, left: 152, size: 6, alpha: 0.24 },
] as const;

const CANDLE_SERIES = [
  { height: 88, body: 30, bullish: true },
  { height: 122, body: 54, bullish: false },
  { height: 102, body: 36, bullish: true },
  { height: 112, body: 42, bullish: true },
  { height: 94, body: 32, bullish: false },
  { height: 128, body: 58, bullish: true },
  { height: 86, body: 28, bullish: false },
  { height: 108, body: 38, bullish: true },
] as const;

const CHART_RIBBON_WIDTH = 304;

const MARKET_SIGNAL_COLUMNS = [
  { left: 12, height: 74, bullish: false },
  { left: 44, height: 122, bullish: true },
  { left: 82, height: 92, bullish: false },
  { left: 122, height: 148, bullish: true },
  { left: 168, height: 106, bullish: false },
  { left: 208, height: 136, bullish: true },
] as const;

const BULL_SPEED_LINES = [
  { top: 60, left: -8, width: 126, rotate: '-8deg', alpha: 0.22 },
  { top: 92, left: 8, width: 102, rotate: '-6deg', alpha: 0.18 },
  { top: 126, left: -12, width: 118, rotate: '-10deg', alpha: 0.16 },
  { top: 162, left: 12, width: 86, rotate: '-4deg', alpha: 0.14 },
] as const;

const BULL_DIGITAL_SHARDS = [
  { left: 96, top: 42, width: 40, rotate: '-24deg', alpha: 0.2 },
  { left: 132, top: 34, width: 26, rotate: '18deg', alpha: 0.16 },
  { left: 168, top: 48, width: 32, rotate: '-12deg', alpha: 0.18 },
  { left: 202, top: 64, width: 24, rotate: '22deg', alpha: 0.14 },
  { left: 76, top: 176, width: 34, rotate: '12deg', alpha: 0.14 },
  { left: 220, top: 172, width: 28, rotate: '-18deg', alpha: 0.18 },
] as const;

const BULL_ORBIT_NODES = [
  { left: 92, top: 72, size: 8, alpha: 0.22 },
  { left: 118, top: 118, size: 6, alpha: 0.18 },
  { left: 212, top: 88, size: 7, alpha: 0.24 },
  { left: 244, top: 146, size: 8, alpha: 0.18 },
  { left: 170, top: 188, size: 6, alpha: 0.16 },
] as const;

const BULL_WIRE_SEGMENTS = [
  { left: 54, top: 124, width: 88, rotate: '-22deg' },
  { left: 70, top: 92, width: 118, rotate: '-8deg' },
  { left: 134, top: 72, width: 98, rotate: '12deg' },
  { left: 144, top: 112, width: 106, rotate: '18deg' },
  { left: 100, top: 142, width: 102, rotate: '8deg' },
  { left: 82, top: 154, width: 68, rotate: '48deg' },
  { left: 118, top: 164, width: 78, rotate: '78deg' },
  { left: 164, top: 150, width: 66, rotate: '56deg' },
  { left: 212, top: 154, width: 78, rotate: '84deg' },
  { left: 214, top: 86, width: 74, rotate: '-18deg' },
  { left: 236, top: 58, width: 42, rotate: '-38deg' },
  { left: 246, top: 104, width: 42, rotate: '34deg' },
  { left: 34, top: 110, width: 52, rotate: '-10deg' },
  { left: 16, top: 94, width: 34, rotate: '-42deg' },
] as const;

const BULL_NODE_POINTS = [
  { left: 42, top: 108, size: 8 },
  { left: 74, top: 90, size: 7 },
  { left: 122, top: 76, size: 7 },
  { left: 178, top: 84, size: 8 },
  { left: 226, top: 102, size: 7 },
  { left: 110, top: 140, size: 8 },
  { left: 146, top: 150, size: 7 },
  { left: 182, top: 148, size: 7 },
  { left: 120, top: 196, size: 8 },
  { left: 188, top: 202, size: 8 },
  { left: 250, top: 178, size: 7 },
] as const;

const BEAR_WIRE_SEGMENTS = [
  { left: 48, top: 92, width: 118, rotate: '-12deg' },
  { left: 76, top: 72, width: 126, rotate: '-2deg' },
  { left: 112, top: 60, width: 138, rotate: '10deg' },
  { left: 156, top: 84, width: 112, rotate: '18deg' },
  { left: 188, top: 112, width: 92, rotate: '24deg' },
  { left: 94, top: 130, width: 136, rotate: '16deg' },
  { left: 74, top: 154, width: 118, rotate: '42deg' },
  { left: 116, top: 168, width: 98, rotate: '78deg' },
  { left: 164, top: 164, width: 88, rotate: '64deg' },
  { left: 204, top: 164, width: 82, rotate: '84deg' },
  { left: 214, top: 92, width: 76, rotate: '-18deg' },
  { left: 236, top: 84, width: 62, rotate: '-6deg' },
  { left: 238, top: 116, width: 54, rotate: '18deg' },
  { left: 16, top: 112, width: 60, rotate: '-18deg' },
] as const;

const BEAR_NODE_POINTS = [
  { left: 42, top: 104, size: 8 },
  { left: 80, top: 84, size: 7 },
  { left: 132, top: 70, size: 8 },
  { left: 188, top: 78, size: 7 },
  { left: 238, top: 94, size: 8 },
  { left: 114, top: 136, size: 7 },
  { left: 160, top: 148, size: 8 },
  { left: 208, top: 154, size: 7 },
  { left: 102, top: 204, size: 8 },
  { left: 164, top: 208, size: 8 },
  { left: 230, top: 204, size: 7 },
] as const;

const BEAR_FUR_SPIKES = [
  { left: 76, top: 40, rotate: '-28deg', height: 24 },
  { left: 98, top: 34, rotate: '-18deg', height: 28 },
  { left: 122, top: 28, rotate: '-10deg', height: 26 },
  { left: 148, top: 26, rotate: '2deg', height: 26 },
  { left: 176, top: 30, rotate: '14deg', height: 24 },
  { left: 198, top: 40, rotate: '24deg', height: 22 },
] as const;

const BEAR_FIRE_COLUMNS = [
  { left: 34, width: 14, height: 46 },
  { left: 58, width: 10, height: 32 },
  { left: 214, width: 12, height: 38 },
  { left: 236, width: 14, height: 56 },
  { left: 258, width: 10, height: 34 },
] as const;

function DriftScene({ accent, text }: { accent: string; text: string }) {
  return (
    <>
      {DRIFT_BEAMS.map((beam, index) => {
        const fill = index % 2 === 0 ? accent : text;

        return (
          <View
            key={`${beam.top}-${beam.left}-${beam.width}`}
            style={[
              styles.driftBeam,
              {
                top: beam.top,
                left: beam.left,
                width: beam.width,
                height: beam.height,
                borderRadius: beam.height,
                backgroundColor: withOpacity(fill, beam.alpha),
                transform: [{ rotate: beam.rotate }],
              },
            ]}
          />
        );
      })}
    </>
  );
}

function HaloScene({ accent, text }: { accent: string; text: string }) {
  return (
    <>
      {HALO_BANDS.map((band, index) => (
        <LinearGradient
          key={`${band.top}-${band.left}-${band.width}`}
          colors={[
            withOpacity(index === 0 ? accent : text, band.alpha),
            withOpacity(index === 0 ? text : accent, 0.06),
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.haloBand,
            {
              top: band.top,
              left: band.left,
              width: band.width,
              height: band.height,
              borderRadius: band.height,
              borderColor: withOpacity(index === 0 ? accent : text, 0.16),
              transform: [{ rotate: band.rotate }],
            },
          ]}
        />
      ))}
    </>
  );
}

function ParallaxScene({
  accent,
  text,
  border,
}: {
  accent: string;
  text: string;
  border: string;
}) {
  return (
    <>
      {PARALLAX_PANELS.map((panel, index) => (
        <View
          key={`${panel.top}-${panel.left}-${panel.width}`}
          style={[
            styles.panelCard,
            {
              top: panel.top,
              left: panel.left,
              width: panel.width,
              height: panel.height,
              borderColor: withOpacity(border, 0.7),
              backgroundColor: withOpacity(text, index === 0 ? 0.06 : 0.04),
              transform: [{ rotate: panel.rotate }],
            },
          ]}
        >
          <View style={styles.panelRow}>
            <View style={[styles.panelDot, { backgroundColor: withOpacity(accent, 0.78) }]} />
            <View style={[styles.panelLine, { backgroundColor: withOpacity(text, 0.18), width: '52%' }]} />
          </View>
          <View style={[styles.panelMetric, { backgroundColor: withOpacity(accent, 0.22) }]} />
          <View style={[styles.panelLine, { backgroundColor: withOpacity(text, 0.16), width: '78%' }]} />
          <View style={[styles.panelLine, { backgroundColor: withOpacity(text, 0.1), width: '56%' }]} />
        </View>
      ))}
    </>
  );
}

function DustCluster({ accent, text }: { accent: string; text: string }) {
  return (
    <View style={styles.dustCluster}>
      {DUST_PARTICLES.map((particle, index) => {
        const fill = index % 2 === 0 ? accent : text;

        return (
          <View
            key={`${particle.top}-${particle.left}-${particle.size}`}
            style={[
              styles.dustParticle,
              {
                top: particle.top,
                left: particle.left,
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size / 2,
                backgroundColor: withOpacity(fill, particle.alpha),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function CandleRibbon({
  profit,
  loss,
  text,
}: {
  profit: string;
  loss: string;
  text: string;
}) {
  return (
    <View style={styles.candleRibbon}>
      {CANDLE_SERIES.map((bar, index) => {
        const bullish = bar.bullish;
        const color = bullish ? profit : loss;

        return (
          <View key={`${bar.height}-${index}`} style={styles.candleColumn}>
            <View style={[styles.candleWick, { height: bar.height, backgroundColor: withOpacity(text, 0.34) }]} />
            <View
              style={[
                styles.candleBody,
                {
                  height: bar.body,
                  bottom: (bar.height - bar.body) / 2,
                  backgroundColor: withOpacity(color, 0.34),
                  borderColor: withOpacity(color, 0.7),
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

function BullChargeScene({
  accent,
  text,
  signal,
  ghost = false,
}: {
  accent: string;
  text: string;
  signal: string;
  ghost?: boolean;
}) {
  const edge = ghost ? text : signal;

  return (
    <View style={styles.bullScene}>
      <View style={styles.bullSpeedRack}>
        {BULL_SPEED_LINES.map((line, index) => (
          <View
            key={`${line.top}-${line.left}-${line.width}`}
            style={[
              styles.bullSpeedLine,
              {
                top: line.top,
                left: line.left,
                width: line.width,
                backgroundColor: withOpacity(index % 2 === 0 ? signal : accent, ghost ? line.alpha * 0.5 : line.alpha),
                transform: [{ rotate: line.rotate }],
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.bullShardLayer}>
        {BULL_DIGITAL_SHARDS.map((shard, index) => (
          <View
            key={`${shard.left}-${shard.top}-${shard.width}`}
            style={[
              styles.bullDigitalShard,
              {
                left: shard.left,
                top: shard.top,
                width: shard.width,
                backgroundColor: withOpacity(index % 2 === 0 ? signal : text, ghost ? shard.alpha * 0.5 : shard.alpha),
                borderColor: withOpacity(index % 2 === 0 ? signal : accent, ghost ? 0.12 : 0.28),
                transform: [{ rotate: shard.rotate }],
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.bullOrbitLayer}>
        <View style={[styles.bullOrbitRingOuter, { borderColor: withOpacity(signal, ghost ? 0.08 : 0.2) }]} />
        <View style={[styles.bullOrbitRingInner, { borderColor: withOpacity(accent, ghost ? 0.08 : 0.18) }]} />
        {BULL_ORBIT_NODES.map((node, index) => (
          <View
            key={`${node.left}-${node.top}-${node.size}`}
            style={[
              styles.bullOrbitNode,
              {
                left: node.left,
                top: node.top,
                width: node.size,
                height: node.size,
                borderRadius: node.size,
                backgroundColor: withOpacity(index % 2 === 0 ? signal : accent, ghost ? node.alpha * 0.55 : node.alpha),
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.marketSignalBackdrop}>
        {MARKET_SIGNAL_COLUMNS.map((column) => {
          const color = column.bullish ? signal : accent;

          return (
            <View
              key={`${column.left}-${column.height}`}
              style={[styles.marketSignalColumn, { left: column.left }]}
            >
              <View style={[styles.marketSignalWick, { height: column.height, backgroundColor: withOpacity(text, 0.2) }]} />
              <View
                style={[
                  styles.marketSignalBody,
                  {
                    height: column.height * 0.42,
                    backgroundColor: withOpacity(color, ghost ? 0.14 : 0.26),
                    borderColor: withOpacity(color, ghost ? 0.22 : 0.48),
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <LinearGradient
        colors={[withOpacity(signal, ghost ? 0.04 : 0.18), withOpacity(accent, ghost ? 0.03 : 0.08), withOpacity('#050505', 0)]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.bullChargeCone}
      />

      <View style={styles.creatureTrails}>
        <View style={[styles.creatureTrail, { backgroundColor: withOpacity(signal, ghost ? 0.08 : 0.18), width: 118 }]} />
        <View style={[styles.creatureTrail, { backgroundColor: withOpacity(accent, ghost ? 0.08 : 0.14), width: 82 }]} />
        <View style={[styles.creatureTrail, { backgroundColor: withOpacity(text, ghost ? 0.06 : 0.12), width: 56 }]} />
      </View>

      <View style={[styles.bullFloorGlow, { backgroundColor: withOpacity(signal, ghost ? 0.08 : 0.16) }]} />

      <LinearGradient
        colors={[withOpacity(signal, ghost ? 0.12 : 0.2), withOpacity(accent, ghost ? 0.08 : 0.14)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.bullAura, ghost ? styles.bullAuraGhost : null]}
      />

      <LinearGradient
        colors={[withOpacity(signal, ghost ? 0.08 : 0.22), withOpacity('#FFD36D', ghost ? 0.06 : 0.14), withOpacity('#050505', 0)]}
        start={{ x: 0.1, y: 0.2 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.bullNeonCore}
      />

      <View style={[styles.bullHeadCore, { borderColor: withOpacity(signal, ghost ? 0.16 : 0.56) }]} />
      <View style={[styles.bullForeheadPlate, { borderColor: withOpacity(text, ghost ? 0.12 : 0.32) }]} />
      <View style={[styles.bullHornLeftWide, { borderTopColor: withOpacity('#FFD36D', ghost ? 0.12 : 0.72) }]} />
      <View style={[styles.bullHornRightWide, { borderTopColor: withOpacity('#FFD36D', ghost ? 0.12 : 0.72) }]} />
      <View style={[styles.bullNoseBridge, { backgroundColor: withOpacity(text, ghost ? 0.1 : 0.24) }]} />
      <View style={[styles.bullJawPlate, { borderColor: withOpacity(signal, ghost ? 0.12 : 0.36) }]} />
      <View style={[styles.bullEyeLeft, { backgroundColor: withOpacity('#FFD36D', ghost ? 0.18 : 0.92) }]} />
      <View style={[styles.bullEyeRight, { backgroundColor: withOpacity('#FFD36D', ghost ? 0.18 : 0.92) }]} />

      <View style={styles.bullTickerWrap}>
        {['BTC', 'SOL', 'ETH'].map((label, index) => (
          <View
            key={label}
            style={[
              styles.bullTickerChip,
              {
                borderColor: withOpacity(index === 1 ? accent : signal, ghost ? 0.12 : 0.28),
                backgroundColor: withOpacity(index === 1 ? accent : signal, ghost ? 0.04 : 0.09),
              },
            ]}
          >
            <Text style={[styles.bullTickerText, { color: withOpacity(text, ghost ? 0.34 : 0.72) }]}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.bullTorso, { borderColor: withOpacity(edge, ghost ? 0.18 : 0.58) }]} />
      <View style={[styles.bullChest, { borderColor: withOpacity(edge, ghost ? 0.16 : 0.5) }]} />
      <View style={[styles.bullHeadFrame, { borderColor: withOpacity(edge, ghost ? 0.16 : 0.5) }]} />
      <View style={[styles.bullSnoutFrame, { borderColor: withOpacity(text, ghost ? 0.14 : 0.34) }]} />
      <View style={[styles.bullHornForward, { borderTopColor: withOpacity(signal, ghost ? 0.14 : 0.68) }]} />
      <View style={[styles.bullHornRear, { borderTopColor: withOpacity(signal, ghost ? 0.12 : 0.5) }]} />
      <View style={[styles.bullTail, { backgroundColor: withOpacity(edge, ghost ? 0.16 : 0.44) }]} />
      <View style={[styles.bullTailTip, { backgroundColor: withOpacity(signal, ghost ? 0.12 : 0.4) }]} />

      <View style={[styles.bullLegBackRear, { backgroundColor: withOpacity(edge, ghost ? 0.12 : 0.4) }]} />
      <View style={[styles.bullLegBackRearLower, { backgroundColor: withOpacity(edge, ghost ? 0.14 : 0.44) }]} />
      <View style={[styles.bullLegBackFront, { backgroundColor: withOpacity(edge, ghost ? 0.12 : 0.36) }]} />
      <View style={[styles.bullLegBackFrontLower, { backgroundColor: withOpacity(edge, ghost ? 0.14 : 0.42) }]} />
      <View style={[styles.bullLegFrontRear, { backgroundColor: withOpacity(edge, ghost ? 0.12 : 0.36) }]} />
      <View style={[styles.bullLegFrontRearLower, { backgroundColor: withOpacity(edge, ghost ? 0.14 : 0.42) }]} />
      <View style={[styles.bullLegFrontLift, { backgroundColor: withOpacity(edge, ghost ? 0.14 : 0.5) }]} />
      <View style={[styles.bullLegFrontLiftLower, { backgroundColor: withOpacity(edge, ghost ? 0.14 : 0.5) }]} />

      {BULL_WIRE_SEGMENTS.map((segment) => (
        <View
          key={`${segment.left}-${segment.top}-${segment.width}`}
          style={[
            styles.bullWire,
            {
              left: segment.left,
              top: segment.top,
              width: segment.width,
              backgroundColor: withOpacity(edge, ghost ? 0.16 : 0.42),
              transform: [{ rotate: segment.rotate }],
            },
          ]}
        />
      ))}

      {BULL_NODE_POINTS.map((node) => (
        <View
          key={`${node.left}-${node.top}-${node.size}`}
          style={[
            styles.bullNode,
            {
              left: node.left,
              top: node.top,
              width: node.size,
              height: node.size,
              borderRadius: node.size,
              backgroundColor: withOpacity(signal, ghost ? 0.18 : 0.74),
            },
          ]}
        />
      ))}

      <View style={[styles.bullEye, { backgroundColor: withOpacity('#FFD36D', ghost ? 0.2 : 0.92) }]} />
    </View>
  );
}

function BearInfernoScene({
  accent,
  text,
  signal,
  ghost = false,
}: {
  accent: string;
  text: string;
  signal: string;
  ghost?: boolean;
}) {
  const edge = ghost ? text : signal;

  return (
    <View style={styles.bearScene}>
      <View style={styles.bearBackGeometry}>
        <View style={[styles.bearGeoLine, { width: 74, left: 4, top: 70, backgroundColor: withOpacity(signal, 0.24), transform: [{ rotate: '0deg' }] }]} />
        <View style={[styles.bearGeoLine, { width: 64, left: 30, top: 38, backgroundColor: withOpacity(signal, 0.22), transform: [{ rotate: '-52deg' }] }]} />
        <View style={[styles.bearGeoLine, { width: 92, left: 76, top: 52, backgroundColor: withOpacity(accent, 0.16), transform: [{ rotate: '22deg' }] }]} />
        <View style={[styles.bearGeoLine, { width: 82, left: 48, top: 94, backgroundColor: withOpacity(signal, 0.18), transform: [{ rotate: '-18deg' }] }]} />
      </View>

      <View style={styles.bearFireBase}>
        {BEAR_FIRE_COLUMNS.map((column) => (
          <View
            key={`${column.left}-${column.width}`}
            style={[
              styles.bearFireColumn,
              {
                left: column.left,
                width: column.width,
                height: column.height,
                backgroundColor: withOpacity('#FFB84D', ghost ? 0.12 : 0.3),
                borderColor: withOpacity(signal, ghost ? 0.16 : 0.46),
              },
            ]}
          />
        ))}
        <View style={[styles.bearFlameMain, { backgroundColor: withOpacity(signal, ghost ? 0.12 : 0.28) }]} />
        <View style={[styles.bearFlameCore, { backgroundColor: withOpacity('#FFD36D', ghost ? 0.14 : 0.82) }]} />
        <View style={[styles.bearEmber, { left: 196, top: 20, backgroundColor: withOpacity('#FFD36D', ghost ? 0.12 : 0.7) }]} />
        <View style={[styles.bearEmber, { left: 224, top: 6, backgroundColor: withOpacity(signal, ghost ? 0.12 : 0.5) }]} />
        <View style={[styles.bearEmber, { left: 252, top: 26, backgroundColor: withOpacity('#FFB84D', ghost ? 0.12 : 0.56) }]} />
      </View>

      <View style={styles.creatureTrails}>
        <View style={[styles.creatureTrail, { backgroundColor: withOpacity(signal, ghost ? 0.1 : 0.18), width: 108 }]} />
        <View style={[styles.creatureTrail, { backgroundColor: withOpacity(accent, ghost ? 0.08 : 0.12), width: 76 }]} />
        <View style={[styles.creatureTrail, { backgroundColor: withOpacity(text, ghost ? 0.06 : 0.1), width: 52 }]} />
      </View>

      <LinearGradient
        colors={[withOpacity(signal, ghost ? 0.12 : 0.18), withOpacity(accent, ghost ? 0.08 : 0.14)]}
        start={{ x: 0.05, y: 0.2 }}
        end={{ x: 0.95, y: 0.9 }}
        style={[styles.bearAura, ghost ? styles.bearAuraGhost : null]}
      />

      {BEAR_FUR_SPIKES.map((spike) => (
        <View
          key={`${spike.left}-${spike.top}-${spike.rotate}`}
          style={[
            styles.bearFurSpike,
            {
              left: spike.left,
              top: spike.top,
              height: spike.height,
              backgroundColor: withOpacity(signal, ghost ? 0.14 : 0.42),
              transform: [{ rotate: spike.rotate }],
            },
          ]}
        />
      ))}

      <View style={[styles.bearTorsoFrame, { borderColor: withOpacity(edge, ghost ? 0.16 : 0.56) }]} />
      <View style={[styles.bearShoulderFrame, { borderColor: withOpacity(edge, ghost ? 0.16 : 0.48) }]} />
      <View style={[styles.bearHeadFrameWide, { borderColor: withOpacity(edge, ghost ? 0.16 : 0.5) }]} />
      <View style={[styles.bearSnoutFrameWide, { borderColor: withOpacity(text, ghost ? 0.14 : 0.3) }]} />
      <View style={[styles.bearEarLeftWide, { borderColor: withOpacity(edge, ghost ? 0.14 : 0.46) }]} />
      <View style={[styles.bearEarRightWide, { borderColor: withOpacity(edge, ghost ? 0.14 : 0.46) }]} />
      <View style={[styles.bearJawUpper, { borderColor: withOpacity(edge, ghost ? 0.14 : 0.4) }]} />
      <View style={[styles.bearJawLower, { borderColor: withOpacity(signal, ghost ? 0.14 : 0.42) }]} />
      <View style={[styles.bearMouthGlow, { backgroundColor: withOpacity(signal, ghost ? 0.1 : 0.26) }]} />
      <View style={[styles.bearEyeGlow, { backgroundColor: withOpacity('#FFB84D', ghost ? 0.18 : 0.88) }]} />

      <View style={[styles.bearLegRearBack, { backgroundColor: withOpacity(edge, ghost ? 0.12 : 0.4) }]} />
      <View style={[styles.bearLegRearBackLower, { backgroundColor: withOpacity(edge, ghost ? 0.14 : 0.44) }]} />
      <View style={[styles.bearLegRearFront, { backgroundColor: withOpacity(edge, ghost ? 0.12 : 0.38) }]} />
      <View style={[styles.bearLegRearFrontLower, { backgroundColor: withOpacity(edge, ghost ? 0.14 : 0.44) }]} />
      <View style={[styles.bearLegFrontBack, { backgroundColor: withOpacity(edge, ghost ? 0.12 : 0.36) }]} />
      <View style={[styles.bearLegFrontBackLower, { backgroundColor: withOpacity(edge, ghost ? 0.14 : 0.42) }]} />
      <View style={[styles.bearLegFrontLead, { backgroundColor: withOpacity(edge, ghost ? 0.14 : 0.46) }]} />
      <View style={[styles.bearLegFrontLeadLower, { backgroundColor: withOpacity(edge, ghost ? 0.14 : 0.48) }]} />

      {BEAR_WIRE_SEGMENTS.map((segment) => (
        <View
          key={`${segment.left}-${segment.top}-${segment.width}`}
          style={[
            styles.bearWire,
            {
              left: segment.left,
              top: segment.top,
              width: segment.width,
              backgroundColor: withOpacity(edge, ghost ? 0.14 : 0.38),
              transform: [{ rotate: segment.rotate }],
            },
          ]}
        />
      ))}

      {BEAR_NODE_POINTS.map((node) => (
        <View
          key={`${node.left}-${node.top}-${node.size}`}
          style={[
            styles.bearNode,
            {
              left: node.left,
              top: node.top,
              width: node.size,
              height: node.size,
              borderRadius: node.size,
              backgroundColor: withOpacity(signal, ghost ? 0.18 : 0.66),
            },
          ]}
        />
      ))}
    </View>
  );
}

function MarketPulseStage({
  signal,
  accent,
  text,
}: {
  signal: string;
  accent: string;
  text: string;
}) {
  return (
    <View style={styles.marketStage}>
      <LinearGradient
        colors={[withOpacity(signal, 0.12), withOpacity(accent, 0.05), withOpacity('#050505', 0)]}
        start={{ x: 0, y: 0.1 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.marketStageGrid}>
        <View style={[styles.marketStageLine, { backgroundColor: withOpacity(text, 0.08) }]} />
        <View style={[styles.marketStageLine, { backgroundColor: withOpacity(text, 0.06) }]} />
        <View style={[styles.marketStageLine, { backgroundColor: withOpacity(text, 0.08) }]} />
      </View>
      <View style={styles.marketStageSignalRow}>
        {MARKET_SIGNAL_COLUMNS.map((column, index) => (
          <View
            key={`${column.left}-${index}-stage`}
            style={[
              styles.marketStageSignal,
              {
                height: column.height + 24,
                backgroundColor: withOpacity(index % 2 === 0 ? signal : accent, 0.12),
                borderColor: withOpacity(index % 2 === 0 ? signal : accent, 0.18),
              },
            ]}
          />
        ))}
      </View>
      <View style={[styles.marketStageGlow, { backgroundColor: withOpacity(signal, 0.16) }]} />
      <View style={[styles.marketStageGlowSmall, { backgroundColor: withOpacity(accent, 0.1) }]} />
    </View>
  );
}

function SignalHeroScene({
  signal,
  text,
}: {
  signal: string;
  text: string;
}) {
  return (
    <View style={styles.signalHero}>
      <LinearGradient
        colors={[withOpacity(signal, 0.26), withOpacity(signal, 0.06), withOpacity('#050505', 0)]}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 1, y: 1 }}
        style={styles.signalHeroGlow}
      />
      <View style={[styles.signalHeroBeamLong, { backgroundColor: withOpacity(signal, 0.16) }]} />
      <View style={[styles.signalHeroBeamShort, { backgroundColor: withOpacity(text, 0.1) }]} />
      <View style={[styles.signalHeroShardA, { backgroundColor: withOpacity(signal, 0.18) }]} />
      <View style={[styles.signalHeroShardB, { backgroundColor: withOpacity(text, 0.12) }]} />
      <View style={[styles.signalHeroShardC, { backgroundColor: withOpacity(signal, 0.14) }]} />
      <View style={[styles.signalHeroBody, { borderColor: withOpacity(signal, 0.46), backgroundColor: withOpacity(signal, 0.06) }]} />
      <View style={[styles.signalHeroChest, { borderColor: withOpacity(text, 0.28), backgroundColor: withOpacity(text, 0.04) }]} />
      <View style={[styles.signalHeroHead, { borderColor: withOpacity(signal, 0.46), backgroundColor: withOpacity(signal, 0.05) }]} />
      <View style={[styles.signalHeroSnout, { borderColor: withOpacity(text, 0.22), backgroundColor: withOpacity(text, 0.04) }]} />
      <View style={[styles.signalHeroHornLeft, { backgroundColor: withOpacity('#FFCF66', 0.88) }]} />
      <View style={[styles.signalHeroHornRight, { backgroundColor: withOpacity('#FFCF66', 0.88) }]} />
      <View style={[styles.signalHeroSpine, { backgroundColor: withOpacity(signal, 0.56) }]} />
      <View style={[styles.signalHeroLegBack, { backgroundColor: withOpacity(text, 0.28) }]} />
      <View style={[styles.signalHeroLegMid, { backgroundColor: withOpacity(text, 0.26) }]} />
      <View style={[styles.signalHeroLegFront, { backgroundColor: withOpacity(text, 0.28) }]} />
      <View style={[styles.signalHeroLegLead, { backgroundColor: withOpacity(text, 0.32) }]} />
      <View style={[styles.signalHeroEye, { backgroundColor: withOpacity('#FFCF66', 0.92) }]} />
    </View>
  );
}

export function Screen({
  children,
  scrollable = true,
  contentContainerStyle,
  backgroundMode = 'default',
}: ScreenProps) {
  const pathname = usePathname();
  const language = useOrbitStore((state) => state.settings.language);
  const { mode, colors, orbitMotionEnabled, orbitMotionPreset } = useAppTheme();
  const direction = getLocaleDirection(language);
  const isHomeRoute = pathname === '/home' || pathname.includes('/home');
  const isProfileRoute = pathname === '/profile' || pathname.includes('/profile');
  const backdropPreset = orbitMotionPreset;
  const mobileSafeBackdropPreset = backdropPreset;
  const shouldRenderMotionVideo =
    backgroundMode !== 'plain' &&
    mode === 'orbit' &&
    orbitMotionEnabled &&
    (isHomeRoute || isProfileRoute);
  const shouldRenderOrbitBackdrop = shouldRenderMotionVideo;
  const screenGradientColors = shouldRenderMotionVideo
    ? ([withOpacity(colors.backgroundAlt, 0.14), withOpacity(colors.background, 0.44)] as const)
    : ([colors.backgroundAlt, colors.background] as const);

  const sceneX = useSharedValue(0);
  const sceneY = useSharedValue(0);
  const sceneScale = useSharedValue(1);
  const sceneOpacity = useSharedValue(0.75);
  const ambientShift = useSharedValue(0);
  const accentPulse = useSharedValue(1);
  const chartShift = useSharedValue(0);
  const chargeScale = useSharedValue(1);
  const chargeX = useSharedValue(0);
  const chargeY = useSharedValue(0);
  const chargeOpacity = useSharedValue(0.56);

  useEffect(() => {
    const stopAllAnimations = () => {
      cancelAnimation(sceneX);
      cancelAnimation(sceneY);
      cancelAnimation(sceneScale);
      cancelAnimation(sceneOpacity);
      cancelAnimation(ambientShift);
      cancelAnimation(accentPulse);
      cancelAnimation(chartShift);
      cancelAnimation(chargeScale);
      cancelAnimation(chargeX);
      cancelAnimation(chargeY);
      cancelAnimation(chargeOpacity);
    };

    stopAllAnimations();

    sceneX.value = 0;
    sceneY.value = 0;
    sceneScale.value = 1;
    sceneOpacity.value = 0.75;
    ambientShift.value = 0;
    accentPulse.value = 1;
    chartShift.value = 0;
    chargeScale.value = 1;
    chargeX.value = 0;
    chargeY.value = 0;
    chargeOpacity.value = 0.56;

    if (!shouldRenderOrbitBackdrop) {
      return stopAllAnimations;
    }

    if (
      mobileSafeBackdropPreset === 'bull' ||
      mobileSafeBackdropPreset === 'bear' ||
      mobileSafeBackdropPreset === 'battle'
    ) {
      sceneOpacity.value = withTiming(0.7, { duration: 900 });
      sceneX.value = withRepeat(withSequence(withTiming(10, { duration: 5400 }), withTiming(-10, { duration: 5400 })), -1, true);
      sceneY.value = withRepeat(withSequence(withTiming(-8, { duration: 6200 }), withTiming(8, { duration: 6200 })), -1, true);
      sceneScale.value = withRepeat(withSequence(withTiming(1.04, { duration: 5600 }), withTiming(0.98, { duration: 5600 })), -1, true);
      accentPulse.value = withRepeat(withSequence(withTiming(1.02, { duration: 3400 }), withTiming(0.98, { duration: 3400 })), -1, true);

      if (isHomeRoute) {
        if (mobileSafeBackdropPreset === 'bull') {
          chargeScale.value = withRepeat(
            withSequence(withTiming(1.34, { duration: 1500 }), withTiming(0.92, { duration: 900 })),
            -1,
            false,
          );
          chargeX.value = withRepeat(
            withSequence(withTiming(-10, { duration: 520 }), withTiming(22, { duration: 1500 }), withTiming(-4, { duration: 380 })),
            -1,
            false,
          );
          chargeY.value = withRepeat(
            withSequence(withTiming(18, { duration: 1500 }), withTiming(-8, { duration: 900 })),
            -1,
            false,
          );
          chargeOpacity.value = withRepeat(
            withSequence(withTiming(0.82, { duration: 1500 }), withTiming(0.48, { duration: 900 })),
            -1,
            false,
          );
        } else {
          chargeScale.value = withRepeat(
            withSequence(withTiming(1.2, { duration: 1600 }), withTiming(0.92, { duration: 1000 })),
            -1,
            false,
          );
          chargeX.value = withRepeat(
            withSequence(withTiming(-6, { duration: 600 }), withTiming(10, { duration: 1600 }), withTiming(-2, { duration: 400 })),
            -1,
            false,
          );
          chargeY.value = withRepeat(
            withSequence(withTiming(12, { duration: 1600 }), withTiming(-8, { duration: 1000 })),
            -1,
            false,
          );
          chargeOpacity.value = withRepeat(
            withSequence(withTiming(0.76, { duration: 1600 }), withTiming(0.44, { duration: 1000 })),
            -1,
            false,
          );
        }
      }
    }
    return stopAllAnimations;
  }, [
    accentPulse,
    ambientShift,
    chartShift,
    chargeOpacity,
    chargeX,
    chargeScale,
    chargeY,
    isHomeRoute,
    mobileSafeBackdropPreset,
    sceneOpacity,
    sceneScale,
    sceneX,
    sceneY,
    shouldRenderOrbitBackdrop,
  ]);

  const trailOpacity = useDerivedValue(() => Math.max(0.18, sceneOpacity.value - 0.22));

  const primarySceneStyle = useAnimatedStyle(() => ({
    opacity: sceneOpacity.value,
    transform: [
      { translateX: sceneX.value },
      { translateY: sceneY.value },
      { scale: sceneScale.value },
    ],
  }));

  const secondarySceneStyle = useAnimatedStyle(() => ({
    opacity: trailOpacity.value,
    transform: [
      { translateX: ambientShift.value },
      { translateY: -sceneY.value * 0.6 },
      { scale: 1 + (accentPulse.value - 1) * 0.8 },
    ],
  }));

  const panelFrontStyle = useAnimatedStyle(() => ({
    opacity: sceneOpacity.value,
    transform: [
      { translateX: sceneX.value * 0.6 },
      { translateY: sceneY.value * 0.4 },
      { scale: 1 + (accentPulse.value - 1) * 0.7 },
    ],
  }));

  const panelRearStyle = useAnimatedStyle(() => ({
    opacity: trailOpacity.value,
    transform: [
      { translateX: -ambientShift.value * 0.5 },
      { translateY: sceneY.value * 0.2 },
      { scale: 1 + (accentPulse.value - 1) * 0.35 },
    ],
  }));

  const chartTrackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: chartShift.value }],
  }));

  const chartTrackOffsetStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: chartShift.value + CHART_RIBBON_WIDTH }],
  }));

  const creatureStyle = useAnimatedStyle(() => ({
    opacity: chargeOpacity.value,
    transform: [
      { perspective: 1000 },
      { translateX: chargeX.value },
      { translateY: chargeY.value },
      { scale: chargeScale.value },
    ],
  }));

  const creatureGhostStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0.08, chargeOpacity.value - 0.16),
    transform: [
      { perspective: 1000 },
      { translateX: chargeX.value * 0.42 - 18 },
      { translateY: chargeY.value * 0.48 - 12 },
      { scale: Math.max(0.72, chargeScale.value - 0.2) },
    ],
  }));

  const renderOrbitBackdrop = () => {
    if (
      mobileSafeBackdropPreset === 'bull' ||
      mobileSafeBackdropPreset === 'bear' ||
      mobileSafeBackdropPreset === 'battle'
    ) {
      const signal =
        mobileSafeBackdropPreset === 'bear'
          ? colors.loss
          : colors.profit;

      return (
        <>
          <Animated.View pointerEvents="none" style={[styles.marketStageWrap, primarySceneStyle]}>
            <MarketPulseStage signal={signal} accent={colors.primary} text={colors.text} />
          </Animated.View>
          {mobileSafeBackdropPreset === 'bull' ? (
            <Animated.View pointerEvents="none" style={[styles.creatureWrap, creatureStyle]}>
              <BullChargeScene accent={colors.primary} text={colors.text} signal={signal} />
            </Animated.View>
          ) : mobileSafeBackdropPreset === 'bear' ? (
            <Animated.View pointerEvents="none" style={[styles.creatureWrap, creatureStyle]}>
              <BearInfernoScene accent={colors.primary} text={colors.text} signal={signal} />
            </Animated.View>
          ) : (
            <Animated.View pointerEvents="none" style={[styles.creatureWrap, creatureStyle]}>
              <SignalHeroScene signal={colors.warning} text={colors.text} />
            </Animated.View>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, direction }]}>
      <OrbitMotionVideoBackground enabled={shouldRenderMotionVideo} />
      <LinearGradient
        colors={screenGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {shouldRenderOrbitBackdrop ? renderOrbitBackdrop() : null}
      <SafeAreaView edges={['top']} style={[styles.safeArea, { direction }]}>
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, { direction }, contentContainerStyle]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, { direction }, contentContainerStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 140,
    gap: SPACING.lg,
  },
  sceneBlockTop: {
    position: 'absolute',
    top: 6,
    right: -26,
    width: 252,
    height: 172,
  },
  sceneBlockBottom: {
    position: 'absolute',
    bottom: 146,
    left: -34,
    width: 236,
    height: 176,
  },
  panelBlockTop: {
    position: 'absolute',
    top: 14,
    right: -18,
    width: 250,
    height: 214,
  },
  panelBlockBottom: {
    position: 'absolute',
    bottom: 126,
    left: -28,
    width: 232,
    height: 214,
  },
  dustBlockTop: {
    position: 'absolute',
    top: 20,
    right: -8,
    width: 194,
    height: 194,
  },
  dustBlockBottom: {
    position: 'absolute',
    bottom: 104,
    left: -12,
    width: 194,
    height: 194,
  },
  chartShellPrimary: {
    position: 'absolute',
    top: 102,
    right: -32,
  },
  chartShellSecondary: {
    position: 'absolute',
    bottom: 118,
    left: -18,
  },
  marketStageWrapRear: {
    position: 'absolute',
    top: 64,
    left: -30,
    right: -30,
    height: 420,
  },
  marketStageWrap: {
    position: 'absolute',
    top: 74,
    left: -8,
    right: -8,
    height: 396,
  },
  signalHeroWrap: {
    position: 'absolute',
    top: 112,
    left: 18,
    right: 18,
    height: 252,
  },
  creatureGhostWrap: {
    position: 'absolute',
    top: 124,
    right: 8,
  },
  creatureWrap: {
    position: 'absolute',
    top: 86,
    right: -8,
  },
  driftBeam: {
    position: 'absolute',
  },
  haloBand: {
    position: 'absolute',
    borderWidth: 1,
  },
  panelCard: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 28,
    padding: 16,
    gap: 10,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  panelLine: {
    height: 7,
    borderRadius: 999,
  },
  panelMetric: {
    width: '62%',
    height: 24,
    borderRadius: 14,
  },
  dustCluster: {
    flex: 1,
  },
  dustParticle: {
    position: 'absolute',
  },
  chartFrame: {
    width: 272,
    height: 178,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: withOpacity('#050505', 0.14),
  },
  chartFrameSmall: {
    width: 218,
    height: 132,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: withOpacity('#050505', 0.1),
  },
  chartGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  chartGridLine: {
    height: 1,
    marginHorizontal: 18,
  },
  chartTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
  },
  chartScaleSmall: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    transform: [{ scale: 0.82 }],
  },
  chartTrackSmall: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  marketStage: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
  },
  signalHero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalHeroGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
  },
  signalHeroWord: {
    position: 'absolute',
    fontFamily: FONT.bold,
    fontSize: 72,
    letterSpacing: 10,
  },
  signalHeroBeamLong: {
    position: 'absolute',
    width: 204,
    height: 14,
    borderRadius: 8,
    transform: [{ rotate: '-18deg' }],
  },
  signalHeroBeamShort: {
    position: 'absolute',
    width: 132,
    height: 10,
    borderRadius: 8,
    top: 68,
    transform: [{ rotate: '12deg' }],
  },
  signalHeroShardA: {
    position: 'absolute',
    left: 58,
    top: 44,
    width: 36,
    height: 8,
    borderRadius: 4,
    transform: [{ rotate: '-26deg' }],
  },
  signalHeroShardB: {
    position: 'absolute',
    right: 64,
    top: 40,
    width: 28,
    height: 8,
    borderRadius: 4,
    transform: [{ rotate: '18deg' }],
  },
  signalHeroShardC: {
    position: 'absolute',
    right: 52,
    top: 84,
    width: 24,
    height: 6,
    borderRadius: 4,
    transform: [{ rotate: '-12deg' }],
  },
  signalHeroBody: {
    position: 'absolute',
    width: 126,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    top: 92,
    left: 108,
    transform: [{ rotate: '-6deg' }],
  },
  signalHeroChest: {
    position: 'absolute',
    width: 72,
    height: 42,
    borderRadius: 12,
    borderWidth: 2,
    top: 104,
    left: 82,
    transform: [{ rotate: '18deg' }],
  },
  signalHeroHead: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 2,
    top: 98,
    left: 54,
    transform: [{ rotate: '42deg' }],
  },
  signalHeroSnout: {
    position: 'absolute',
    width: 28,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    top: 118,
    left: 36,
    transform: [{ rotate: '12deg' }],
  },
  signalHeroHornLeft: {
    position: 'absolute',
    width: 30,
    height: 3,
    borderRadius: 999,
    top: 94,
    left: 32,
    transform: [{ rotate: '-24deg' }],
  },
  signalHeroHornRight: {
    position: 'absolute',
    width: 28,
    height: 3,
    borderRadius: 999,
    top: 84,
    left: 60,
    transform: [{ rotate: '16deg' }],
  },
  signalHeroSpine: {
    position: 'absolute',
    width: 92,
    height: 2,
    top: 104,
    left: 116,
    transform: [{ rotate: '-10deg' }],
  },
  signalHeroLegBack: {
    position: 'absolute',
    width: 10,
    height: 42,
    borderRadius: 6,
    top: 146,
    left: 126,
    transform: [{ rotate: '8deg' }],
  },
  signalHeroLegMid: {
    position: 'absolute',
    width: 10,
    height: 40,
    borderRadius: 6,
    top: 152,
    left: 160,
    transform: [{ rotate: '-6deg' }],
  },
  signalHeroLegFront: {
    position: 'absolute',
    width: 10,
    height: 42,
    borderRadius: 6,
    top: 146,
    left: 192,
    transform: [{ rotate: '6deg' }],
  },
  signalHeroLegLead: {
    position: 'absolute',
    width: 12,
    height: 48,
    borderRadius: 6,
    top: 140,
    left: 224,
    transform: [{ rotate: '16deg' }],
  },
  signalHeroEye: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 8,
    top: 114,
    left: 68,
  },
  marketStageGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 44,
    paddingHorizontal: 24,
  },
  marketStageLine: {
    height: 1,
  },
  marketStageSignalRow: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 58,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  marketStageSignal: {
    width: 18,
    borderRadius: 10,
    borderWidth: 1,
  },
  marketStageGlow: {
    position: 'absolute',
    left: 42,
    right: 42,
    bottom: 24,
    height: 92,
    borderRadius: 24,
    transform: [{ rotate: '-6deg' }],
  },
  marketStageGlowSmall: {
    position: 'absolute',
    right: 18,
    top: 36,
    width: 112,
    height: 56,
    borderRadius: 18,
    transform: [{ rotate: '14deg' }],
  },
  candleRibbon: {
    width: CHART_RIBBON_WIDTH,
    height: 136,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    gap: 10,
  },
  candleColumn: {
    width: 22,
    height: 136,
    justifyContent: 'center',
    alignItems: 'center',
  },
  candleWick: {
    width: 2,
    borderRadius: 2,
  },
  candleBody: {
    position: 'absolute',
    width: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  bullScene: {
    width: 316,
    height: 286,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bullWord: {
    position: 'absolute',
    top: 20,
    right: 14,
    fontFamily: FONT.bold,
    fontSize: 54,
    letterSpacing: 6,
  },
  bullSpeedRack: {
    position: 'absolute',
    left: 0,
    top: 28,
    width: 136,
    height: 178,
  },
  bullSpeedLine: {
    position: 'absolute',
    height: 1.5,
    borderRadius: 999,
  },
  bullShardLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  bullDigitalShard: {
    position: 'absolute',
    height: 10,
    borderRadius: 4,
    borderWidth: 1,
  },
  bullOrbitLayer: {
    position: 'absolute',
    left: 80,
    top: 34,
    width: 196,
    height: 190,
  },
  bullOrbitRingOuter: {
    position: 'absolute',
    left: 8,
    top: 10,
    width: 168,
    height: 148,
    borderRadius: 999,
    borderWidth: 1,
    transform: [{ rotate: '-10deg' }],
  },
  bullOrbitRingInner: {
    position: 'absolute',
    left: 30,
    top: 28,
    width: 132,
    height: 110,
    borderRadius: 999,
    borderWidth: 1,
    transform: [{ rotate: '14deg' }],
  },
  bullOrbitNode: {
    position: 'absolute',
  },
  bullChargeCone: {
    position: 'absolute',
    left: 0,
    top: 84,
    width: 256,
    height: 104,
    borderTopRightRadius: 72,
    borderBottomRightRadius: 72,
  },
  marketSignalBackdrop: {
    position: 'absolute',
    right: 8,
    top: 34,
    width: 230,
    height: 170,
  },
  marketSignalColumn: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  marketSignalWick: {
    width: 2,
    borderRadius: 2,
  },
  marketSignalBody: {
    position: 'absolute',
    width: 12,
    borderRadius: 7,
    borderWidth: 1,
  },
  bullFloorGlow: {
    position: 'absolute',
    bottom: 18,
    width: 196,
    height: 34,
    borderRadius: 999,
  },
  bullAura: {
    position: 'absolute',
    top: 74,
    left: 46,
    width: 220,
    height: 146,
    borderRadius: 999,
  },
  bullAuraGhost: {
    top: 82,
    left: 60,
    width: 204,
    height: 134,
  },
  bullNeonCore: {
    position: 'absolute',
    left: 144,
    top: 76,
    width: 124,
    height: 112,
    borderRadius: 999,
  },
  bullHeadCore: {
    position: 'absolute',
    left: 188,
    top: 78,
    width: 72,
    height: 60,
    borderRadius: 26,
    borderWidth: 1.3,
    transform: [{ rotate: '-8deg' }],
  },
  bullForeheadPlate: {
    position: 'absolute',
    left: 200,
    top: 92,
    width: 42,
    height: 20,
    borderRadius: 12,
    borderWidth: 1,
    transform: [{ rotate: '-8deg' }],
  },
  bullHornLeftWide: {
    position: 'absolute',
    left: 178,
    top: 58,
    width: 46,
    height: 18,
    borderTopWidth: 8,
    borderRadius: 999,
    transform: [{ rotate: '-28deg' }],
  },
  bullHornRightWide: {
    position: 'absolute',
    left: 228,
    top: 56,
    width: 48,
    height: 18,
    borderTopWidth: 8,
    borderRadius: 999,
    transform: [{ rotate: '18deg' }],
  },
  bullNoseBridge: {
    position: 'absolute',
    left: 218,
    top: 104,
    width: 10,
    height: 30,
    borderRadius: 999,
    transform: [{ rotate: '-8deg' }],
  },
  bullJawPlate: {
    position: 'absolute',
    left: 208,
    top: 118,
    width: 42,
    height: 22,
    borderRadius: 16,
    borderWidth: 1,
    transform: [{ rotate: '-8deg' }],
  },
  bullEyeLeft: {
    position: 'absolute',
    left: 204,
    top: 100,
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  bullEyeRight: {
    position: 'absolute',
    left: 232,
    top: 96,
    width: 9,
    height: 9,
    borderRadius: 9,
  },
  bullTickerWrap: {
    position: 'absolute',
    left: 18,
    bottom: 34,
    flexDirection: 'row',
    gap: 8,
  },
  bullTickerChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  bullTickerText: {
    fontFamily: FONT.medium,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  bullTorso: {
    position: 'absolute',
    left: 62,
    top: 92,
    width: 154,
    height: 90,
    borderRadius: 60,
    borderWidth: 1.5,
    transform: [{ rotate: '-8deg' }],
  },
  bullChest: {
    position: 'absolute',
    left: 152,
    top: 86,
    width: 86,
    height: 84,
    borderRadius: 44,
    borderWidth: 1.2,
    transform: [{ rotate: '18deg' }],
  },
  bullHeadFrame: {
    position: 'absolute',
    left: 214,
    top: 92,
    width: 70,
    height: 54,
    borderRadius: 30,
    borderWidth: 1.2,
    transform: [{ rotate: '-14deg' }],
  },
  bullSnoutFrame: {
    position: 'absolute',
    left: 244,
    top: 104,
    width: 42,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    transform: [{ rotate: '-10deg' }],
  },
  bullHornForward: {
    position: 'absolute',
    left: 216,
    top: 76,
    width: 56,
    height: 24,
    borderTopWidth: 8,
    borderRadius: 999,
    transform: [{ rotate: '-18deg' }],
  },
  bullHornRear: {
    position: 'absolute',
    left: 246,
    top: 74,
    width: 38,
    height: 18,
    borderTopWidth: 6,
    borderRadius: 999,
    transform: [{ rotate: '18deg' }],
  },
  bullTail: {
    position: 'absolute',
    left: 44,
    top: 106,
    width: 44,
    height: 2,
    borderRadius: 999,
    transform: [{ rotate: '-28deg' }],
  },
  bullTailTip: {
    position: 'absolute',
    left: 28,
    top: 92,
    width: 12,
    height: 12,
    borderRadius: 12,
  },
  bullLegBackRear: {
    position: 'absolute',
    left: 92,
    top: 156,
    width: 4,
    height: 58,
    borderRadius: 999,
    transform: [{ rotate: '8deg' }],
  },
  bullLegBackRearLower: {
    position: 'absolute',
    left: 88,
    top: 210,
    width: 4,
    height: 48,
    borderRadius: 999,
    transform: [{ rotate: '-10deg' }],
  },
  bullLegBackFront: {
    position: 'absolute',
    left: 134,
    top: 154,
    width: 4,
    height: 50,
    borderRadius: 999,
    transform: [{ rotate: '18deg' }],
  },
  bullLegBackFrontLower: {
    position: 'absolute',
    left: 144,
    top: 196,
    width: 4,
    height: 54,
    borderRadius: 999,
    transform: [{ rotate: '2deg' }],
  },
  bullLegFrontRear: {
    position: 'absolute',
    left: 188,
    top: 150,
    width: 4,
    height: 52,
    borderRadius: 999,
    transform: [{ rotate: '10deg' }],
  },
  bullLegFrontRearLower: {
    position: 'absolute',
    left: 194,
    top: 196,
    width: 4,
    height: 56,
    borderRadius: 999,
    transform: [{ rotate: '-6deg' }],
  },
  bullLegFrontLift: {
    position: 'absolute',
    left: 232,
    top: 150,
    width: 4,
    height: 46,
    borderRadius: 999,
    transform: [{ rotate: '34deg' }],
  },
  bullLegFrontLiftLower: {
    position: 'absolute',
    left: 252,
    top: 182,
    width: 4,
    height: 54,
    borderRadius: 999,
    transform: [{ rotate: '-28deg' }],
  },
  bullWire: {
    position: 'absolute',
    height: 1.5,
    borderRadius: 999,
  },
  bullNode: {
    position: 'absolute',
  },
  bullEye: {
    position: 'absolute',
    left: 232,
    top: 108,
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  bearScene: {
    width: 324,
    height: 292,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bearWord: {
    position: 'absolute',
    top: 20,
    right: 18,
    fontFamily: FONT.bold,
    fontSize: 54,
    letterSpacing: 4,
  },
  bearBackGeometry: {
    position: 'absolute',
    left: 0,
    top: 32,
    width: 136,
    height: 126,
  },
  bearGeoLine: {
    position: 'absolute',
    height: 1.5,
    borderRadius: 999,
  },
  bearFireBase: {
    position: 'absolute',
    left: 42,
    bottom: 18,
    width: 248,
    height: 82,
  },
  bearFireColumn: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 8,
    borderWidth: 1,
  },
  bearFlameMain: {
    position: 'absolute',
    right: 8,
    bottom: 4,
    width: 62,
    height: 42,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 24,
    transform: [{ rotate: '10deg' }],
  },
  bearFlameCore: {
    position: 'absolute',
    right: 22,
    bottom: 16,
    width: 22,
    height: 26,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    transform: [{ rotate: '8deg' }],
  },
  bearEmber: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 3,
    transform: [{ rotate: '26deg' }],
  },
  bearAura: {
    position: 'absolute',
    top: 74,
    left: 54,
    width: 220,
    height: 152,
    borderRadius: 999,
  },
  bearAuraGhost: {
    top: 82,
    left: 66,
    width: 206,
    height: 138,
  },
  bearFurSpike: {
    position: 'absolute',
    width: 2,
    borderRadius: 999,
  },
  bearTorsoFrame: {
    position: 'absolute',
    left: 64,
    top: 82,
    width: 150,
    height: 108,
    borderRadius: 52,
    borderWidth: 1.5,
    transform: [{ rotate: '4deg' }],
  },
  bearShoulderFrame: {
    position: 'absolute',
    left: 110,
    top: 72,
    width: 128,
    height: 104,
    borderRadius: 54,
    borderWidth: 1.2,
    transform: [{ rotate: '10deg' }],
  },
  bearHeadFrameWide: {
    position: 'absolute',
    left: 212,
    top: 82,
    width: 80,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.2,
    transform: [{ rotate: '-6deg' }],
  },
  bearSnoutFrameWide: {
    position: 'absolute',
    left: 246,
    top: 94,
    width: 40,
    height: 26,
    borderRadius: 14,
    borderWidth: 1,
    transform: [{ rotate: '-6deg' }],
  },
  bearEarLeftWide: {
    position: 'absolute',
    left: 226,
    top: 60,
    width: 24,
    height: 24,
    borderRadius: 24,
    borderWidth: 1.2,
  },
  bearEarRightWide: {
    position: 'absolute',
    left: 246,
    top: 56,
    width: 22,
    height: 22,
    borderRadius: 22,
    borderWidth: 1.2,
  },
  bearJawUpper: {
    position: 'absolute',
    left: 246,
    top: 104,
    width: 34,
    height: 12,
    borderRadius: 10,
    borderWidth: 1,
    transform: [{ rotate: '-8deg' }],
  },
  bearJawLower: {
    position: 'absolute',
    left: 250,
    top: 116,
    width: 30,
    height: 12,
    borderRadius: 10,
    borderWidth: 1,
    transform: [{ rotate: '18deg' }],
  },
  bearMouthGlow: {
    position: 'absolute',
    left: 250,
    top: 112,
    width: 24,
    height: 18,
    borderRadius: 12,
    transform: [{ rotate: '12deg' }],
  },
  bearEyeGlow: {
    position: 'absolute',
    left: 244,
    top: 96,
    width: 9,
    height: 9,
    borderRadius: 9,
  },
  bearLegRearBack: {
    position: 'absolute',
    left: 88,
    top: 160,
    width: 6,
    height: 56,
    borderRadius: 999,
    transform: [{ rotate: '-2deg' }],
  },
  bearLegRearBackLower: {
    position: 'absolute',
    left: 84,
    top: 208,
    width: 6,
    height: 52,
    borderRadius: 999,
    transform: [{ rotate: '4deg' }],
  },
  bearLegRearFront: {
    position: 'absolute',
    left: 132,
    top: 162,
    width: 6,
    height: 54,
    borderRadius: 999,
    transform: [{ rotate: '4deg' }],
  },
  bearLegRearFrontLower: {
    position: 'absolute',
    left: 136,
    top: 208,
    width: 6,
    height: 52,
    borderRadius: 999,
    transform: [{ rotate: '-4deg' }],
  },
  bearLegFrontBack: {
    position: 'absolute',
    left: 190,
    top: 160,
    width: 6,
    height: 54,
    borderRadius: 999,
    transform: [{ rotate: '2deg' }],
  },
  bearLegFrontBackLower: {
    position: 'absolute',
    left: 194,
    top: 208,
    width: 6,
    height: 52,
    borderRadius: 999,
    transform: [{ rotate: '0deg' }],
  },
  bearLegFrontLead: {
    position: 'absolute',
    left: 244,
    top: 154,
    width: 6,
    height: 58,
    borderRadius: 999,
    transform: [{ rotate: '12deg' }],
  },
  bearLegFrontLeadLower: {
    position: 'absolute',
    left: 252,
    top: 206,
    width: 6,
    height: 54,
    borderRadius: 999,
    transform: [{ rotate: '-10deg' }],
  },
  bearWire: {
    position: 'absolute',
    height: 1.5,
    borderRadius: 999,
  },
  bearNode: {
    position: 'absolute',
  },
  creatureScene: {
    width: 258,
    height: 252,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatureWord: {
    position: 'absolute',
    top: 12,
    right: 26,
    fontFamily: FONT.bold,
    fontSize: 48,
    letterSpacing: 4,
  },
  creatureTrails: {
    position: 'absolute',
    left: 36,
    top: 110,
    gap: 10,
    alignItems: 'flex-start',
  },
  creatureTrail: {
    height: 9,
    borderRadius: 999,
  },
  creatureBody: {
    width: 176,
    height: 118,
    borderRadius: 78,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  bullBody: {
    marginTop: 32,
  },
  bearBody: {
    marginTop: 36,
  },
  bullHornLeft: {
    position: 'absolute',
    top: -18,
    left: 18,
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderBottomWidth: 18,
    borderRightWidth: 32,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-28deg' }],
  },
  bullHornRight: {
    position: 'absolute',
    top: -18,
    right: 18,
    width: 0,
    height: 0,
    borderTopWidth: 12,
    borderBottomWidth: 18,
    borderLeftWidth: 32,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '28deg' }],
  },
  bullSnout: {
    position: 'absolute',
    bottom: 18,
    width: 70,
    height: 32,
    borderRadius: 18,
  },
  bearEarLeft: {
    position: 'absolute',
    top: -10,
    left: 26,
    width: 28,
    height: 28,
    borderRadius: 28,
  },
  bearEarRight: {
    position: 'absolute',
    top: -10,
    right: 26,
    width: 28,
    height: 28,
    borderRadius: 28,
  },
  bearSnout: {
    position: 'absolute',
    bottom: 20,
    width: 74,
    height: 34,
    borderRadius: 18,
  },
  bearClawLeft: {
    position: 'absolute',
    right: 40,
    top: 18,
    width: 5,
    height: 34,
    borderRadius: 999,
    transform: [{ rotate: '16deg' }],
  },
  bearClawMiddle: {
    position: 'absolute',
    right: 52,
    top: 12,
    width: 5,
    height: 38,
    borderRadius: 999,
    transform: [{ rotate: '10deg' }],
  },
  bearClawRight: {
    position: 'absolute',
    right: 64,
    top: 18,
    width: 5,
    height: 34,
    borderRadius: 999,
    transform: [{ rotate: '4deg' }],
  },
});
