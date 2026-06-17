import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import {
  DEMO_MODE_LABEL,
  QVEX_DEMO_BALANCES,
  QVEX_DEMO_PORTFOLIO,
  QVEX_DEMO_TOP_MOVERS,
} from '../qvexDemoData';

interface Props {
  onOpenWallet: () => void;
  onOpenTrade: () => void;
  onOpenAstra: () => void;
}

export function DemoHomeScreen({ onOpenWallet, onOpenTrade, onOpenAstra }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.demoBanner}>{DEMO_MODE_LABEL}</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>QVEX Demo Experience</Text>
        <Text style={styles.heroTitle}>Visualiza la super app completa sin operaciones reales</Text>
        <Text style={styles.heroBody}>
          Balance, mercado, wallet, trade y ASTRA quedan simulados para exploracion segura.
        </Text>
      </View>

      <View style={styles.balanceGrid}>
        {QVEX_DEMO_BALANCES.map((item) => (
          <View key={item.id} style={[styles.balanceCard, { borderColor: `${item.accent}40` }]}>
            <Text style={styles.balanceLabel}>{item.label}</Text>
            <Text style={styles.balanceValue}>{item.value}</Text>
            <Text style={[styles.balanceChange, { color: item.accent }]}>{item.change}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portafolio demo</Text>
        <View style={styles.portfolioTrack}>
          {QVEX_DEMO_PORTFOLIO.map((slice) => (
            <View
              key={slice.id}
              style={[styles.portfolioFill, { width: `${slice.percent}%`, backgroundColor: slice.color }]}
            />
          ))}
        </View>
        <View style={styles.portfolioLegend}>
          {QVEX_DEMO_PORTFOLIO.map((slice) => (
            <View key={slice.id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
              <Text style={styles.legendText}>{slice.label} {slice.percent}%</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top movers demo</Text>
        <View style={styles.moversStack}>
          {QVEX_DEMO_TOP_MOVERS.map((item) => (
            <View key={item.id} style={styles.moverCard}>
              <Text style={styles.moverTitle}>{item.label}</Text>
              <Text style={styles.moverBody}>{item.body}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.ctaRow}>
        <DemoCta label="Wallet demo" caption="Balances y actividad" onPress={onOpenWallet} />
        <DemoCta label="Trade demo" caption="Chart y ticket visual" onPress={onOpenTrade} />
        <DemoCta label="ASTRA demo" caption="Insights e IA simulada" onPress={onOpenAstra} />
      </View>
    </View>
  );
}

function DemoCta({
  label,
  caption,
  onPress,
}: {
  label: string;
  caption: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.ctaCard}>
      <Text style={styles.ctaLabel}>{label}</Text>
      <Text style={styles.ctaCaption}>{caption}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: 'rgba(14,20,33,0.9)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    minWidth: 160,
    padding: 16,
  },
  balanceChange: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  balanceGrid: {
    gap: 12,
  },
  balanceLabel: {
    color: '#91A0B6',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  balanceValue: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 20,
  },
  ctaCaption: {
    color: '#90A2BA',
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  ctaCard: {
    backgroundColor: 'rgba(8,15,28,0.92)',
    borderColor: 'rgba(0,229,255,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    minWidth: 92,
    padding: 14,
  },
  ctaLabel: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  demoBanner: {
    color: '#8BD8FF',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  heroBody: {
    color: '#94A2B8',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: 'rgba(12,17,28,0.96)',
    borderColor: 'rgba(0,229,255,0.18)',
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    padding: 20,
  },
  heroEyebrow: {
    color: '#00E5FF',
    fontFamily: FONT.medium,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 24,
    lineHeight: 30,
  },
  legendDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  legendText: {
    color: '#92A0B6',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  moverBody: {
    color: '#8FA3BB',
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  moverCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  moverTitle: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  moversStack: {
    gap: 10,
  },
  portfolioFill: {
    height: '100%',
  },
  portfolioLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  portfolioTrack: {
    borderRadius: 999,
    flexDirection: 'row',
    height: 12,
    overflow: 'hidden',
    width: '100%',
  },
  screen: {
    gap: 18,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 16,
  },
});
