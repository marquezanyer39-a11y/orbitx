import { router } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { ASTRA_DEMO_INSIGHTS, ASTRA_DEMO_VERSION } from '../../constants/astraDemoMock';
import { FONT } from '../../constants/theme';

export const ASTRA_DEMO_CTA_ROUTE = '/dev/astra-simulation';
export const ASTRA_DEMO_HEADER_TITLE = 'ASTRA AI';
export const ASTRA_DEMO_SCREEN_TITLE = 'Panel Demo ASTRA';

function getInsightBorderStyle(color: string): ViewStyle {
  return {
    borderColor: `${color}4D`,
  };
}

function AstraDemoOrb() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [pulse]);

  const orbScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.28],
  });

  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.38],
  });

  return (
    <View style={styles.orbShell}>
      <Animated.View
        testID="astra-demo-orb"
        style={[
          styles.orbHalo,
          {
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orbCore,
          {
            transform: [{ scale: orbScale }],
          },
        ]}
      >
        <View style={styles.orbInnerRing} />
        <View style={styles.orbTail} />
      </Animated.View>
    </View>
  );
}

export function openAstraSimulationDemo() {
  router.push(ASTRA_DEMO_CTA_ROUTE);
}

export default function AstraDemoScreen() {
  const totalConfidence = useMemo(() => {
    const aggregate = ASTRA_DEMO_INSIGHTS.reduce((sum, insight) => sum + insight.confidence, 0);
    return Math.round(aggregate / ASTRA_DEMO_INSIGHTS.length);
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.versionBadge}>Demo local {ASTRA_DEMO_VERSION}</Text>
          <Text style={styles.disclaimerChip}>Sin conexion externa</Text>
        </View>

        <Text style={styles.heroDisclaimer}>
          Simulacion local con datos ficticios. No es asesoria financiera.
        </Text>

        <AstraDemoOrb />

        <Text style={styles.heroTitle}>{ASTRA_DEMO_HEADER_TITLE}</Text>
        <Text style={styles.heroSubtitle}>
          Copiloto visual de escenarios con insights mock, lectura educativa y simulacion aislada.
        </Text>

        <View style={styles.summaryStrip}>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryValue}>{ASTRA_DEMO_INSIGHTS.length}</Text>
            <Text style={styles.summaryLabel}>Insights demo</Text>
          </View>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryValue}>{totalConfidence}%</Text>
            <Text style={styles.summaryLabel}>Confianza media</Text>
          </View>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryValue}>Offline</Text>
            <Text style={styles.summaryLabel}>Modo seguro</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{ASTRA_DEMO_SCREEN_TITLE}</Text>
        <Text style={styles.sectionSubtitle}>
          Lecturas mock para mostrar el valor de ASTRA sin tocar backend, wallet ni trading.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.insightsRow}
      >
        {ASTRA_DEMO_INSIGHTS.map((insight) => (
          <View
            key={insight.id}
            style={[styles.insightCard, getInsightBorderStyle(insight.color)]}
          >
            <View style={styles.insightHeader}>
              <Text style={styles.insightTag}>{insight.tag}</Text>
              <Text style={[styles.insightType, { color: insight.color }]}>{insight.type}</Text>
            </View>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightBody}>{insight.body}</Text>

            <View style={styles.confidenceBlock}>
              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>Confianza demo</Text>
                <Text style={styles.confidenceValue}>{insight.confidence}%</Text>
              </View>
              <View style={styles.confidenceTrack}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      backgroundColor: insight.color,
                      width: `${insight.confidence}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>Escenarios seguros y locales</Text>
        <Text style={styles.ctaBody}>
          Revisa una simulacion educativa multi-escenario con categorias de cripto, portafolio,
          QVEX, macro, social y riesgo.
        </Text>

        <Pressable
          testID="astra-demo-simulate-button"
          onPress={openAstraSimulationDemo}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaButtonText}>Simular escenario</Text>
        </Pressable>

        <Text style={styles.footerNote}>
          No usa precios reales. No ejecuta operaciones. No conecta wallet.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  confidenceBlock: {
    gap: 8,
    marginTop: 'auto',
  },
  confidenceFill: {
    borderRadius: 999,
    height: '100%',
  },
  confidenceLabel: {
    color: '#8AA1B8',
    fontFamily: FONT.medium,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  confidenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confidenceTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  confidenceValue: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  content: {
    gap: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  ctaBody: {
    color: '#91A0B6',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: '#00E5FF',
    borderRadius: 20,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  ctaButtonText: {
    color: '#041018',
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  ctaCard: {
    backgroundColor: 'rgba(10, 16, 28, 0.96)',
    borderColor: 'rgba(0,229,255,0.18)',
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 20,
  },
  ctaTitle: {
    color: '#F8FBFF',
    fontFamily: FONT.bold,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  disclaimerChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    color: '#A3B5C8',
    fontFamily: FONT.medium,
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  footerNote: {
    color: '#7F91A5',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 13, 24, 0.98)',
    borderColor: 'rgba(0,229,255,0.18)',
    borderRadius: 32,
    borderWidth: 1,
    gap: 14,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingVertical: 26,
  },
  heroDisclaimer: {
    color: '#B6C8D8',
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#8DA1B7',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 320,
    textAlign: 'center',
  },
  heroTitle: {
    color: '#00E5FF',
    fontFamily: FONT.bold,
    fontSize: 18,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  insightBody: {
    color: '#D0DBE8',
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  insightCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    minHeight: 232,
    padding: 18,
    width: 280,
  },
  insightHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightTag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    color: '#F8FBFF',
    fontFamily: FONT.medium,
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  insightTitle: {
    color: '#F8FBFF',
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  insightType: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  insightsRow: {
    gap: 16,
    paddingRight: 20,
  },
  orbCore: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,229,255,0.14)',
    borderColor: 'rgba(0,229,255,0.46)',
    borderRadius: 60,
    borderWidth: 1,
    height: 120,
    justifyContent: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    width: 120,
  },
  orbHalo: {
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderRadius: 84,
    height: 168,
    position: 'absolute',
    width: 168,
  },
  orbInnerRing: {
    borderColor: '#00E5FF',
    borderRadius: 22,
    borderWidth: 3,
    height: 44,
    width: 44,
  },
  orbShell: {
    alignItems: 'center',
    height: 180,
    justifyContent: 'center',
    width: '100%',
  },
  orbTail: {
    backgroundColor: '#00E5FF',
    borderRadius: 999,
    height: 3,
    position: 'absolute',
    right: 34,
    top: 96,
    transform: [{ rotate: '42deg' }],
    width: 18,
  },
  screen: {
    backgroundColor: '#050916',
    flex: 1,
  },
  sectionHeader: {
    gap: 8,
  },
  sectionSubtitle: {
    color: '#8A9CB0',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  sectionTitle: {
    color: '#F8FBFF',
    fontFamily: FONT.bold,
    fontSize: 24,
    letterSpacing: -0.6,
  },
  summaryLabel: {
    color: '#7E93A8',
    fontFamily: FONT.medium,
    fontSize: 11,
    marginTop: 4,
  },
  summaryMetric: {
    alignItems: 'center',
    flex: 1,
  },
  summaryStrip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 14,
    width: '100%',
  },
  summaryValue: {
    color: '#F8FBFF',
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  versionBadge: {
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderRadius: 999,
    color: '#00E5FF',
    fontFamily: FONT.semibold,
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
