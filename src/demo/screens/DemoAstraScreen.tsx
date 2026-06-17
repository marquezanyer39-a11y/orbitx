import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { DEMO_MODE_LABEL, QVEX_DEMO_ASTRA_INSIGHTS } from '../qvexDemoData';

interface Props {
  onOpenSimulation: () => void;
  onOpenAstraLayer: () => void;
}

export function DemoAstraScreen({ onOpenSimulation, onOpenAstraLayer }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.demoBanner}>{DEMO_MODE_LABEL}</Text>
      <Text style={styles.title}>ASTRA demo</Text>
      <Text style={styles.subtitle}>
        Insights simulados sobre riesgo, portafolio, wallet demo y escenarios de mercado.
      </Text>

      <View style={styles.cards}>
        {QVEX_DEMO_ASTRA_INSIGHTS.map((insight) => (
          <View key={insight.id} style={[styles.card, { borderColor: `${insight.tone}40` }]}>
            <Text style={[styles.tag, { color: insight.tone }]}>{insight.tag}</Text>
            <Text style={styles.cardTitle}>{insight.title}</Text>
            <Text style={styles.cardBody}>{insight.body}</Text>
          </View>
        ))}
      </View>

      <View style={styles.ctaRow}>
        <Pressable onPress={onOpenSimulation} style={styles.primaryCta}>
          <Text style={styles.primaryCtaText}>Abrir ASTRA Simulation</Text>
        </Pressable>
        <Pressable onPress={onOpenAstraLayer} style={styles.secondaryCta}>
          <Text style={styles.secondaryCtaText}>Ver capa ASTRA demo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(12,17,28,0.94)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  cardBody: {
    color: '#8EA2B9',
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  cardTitle: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  cards: {
    gap: 12,
  },
  ctaRow: {
    gap: 10,
  },
  demoBanner: {
    color: '#8BD8FF',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryCta: {
    backgroundColor: '#00E5FF',
    borderRadius: 16,
    paddingVertical: 14,
  },
  primaryCtaText: {
    color: '#07131E',
    fontFamily: FONT.semibold,
    fontSize: 14,
    textAlign: 'center',
  },
  screen: {
    gap: 18,
  },
  secondaryCta: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
  },
  secondaryCtaText: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 14,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A2B8',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  tag: {
    fontFamily: FONT.medium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 22,
  },
});
