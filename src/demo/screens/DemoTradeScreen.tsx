import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import {
  DEMO_BLOCKED_ACTION_LABEL,
  DEMO_MODE_LABEL,
  type DemoMarketItem,
  QVEX_DEMO_CHART,
  QVEX_DEMO_POSITIONS,
} from '../qvexDemoData';

interface Props {
  market: DemoMarketItem;
  onBlockedAction: (message?: string) => void;
}

export function DemoTradeScreen({ market, onBlockedAction }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.demoBanner}>{DEMO_MODE_LABEL}</Text>
      <Text style={styles.title}>Trade demo</Text>
      <Text style={styles.subtitle}>
        Ticket visual y grafico local para explorar escenarios, sin ejecucion ni ordenes reales.
      </Text>

      <View style={styles.marketHeader}>
        <Text style={styles.marketSymbol}>{market.symbol}</Text>
        <Text style={styles.marketPrice}>{market.priceLabel}</Text>
        <Text style={[styles.marketChange, market.positive ? styles.positive : styles.negative]}>
          {market.changeLabel}
        </Text>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Grafico local/mock</Text>
        <View style={styles.chartBars}>
          {QVEX_DEMO_CHART.map((point, index) => (
            <View
              key={`${point}-${index}`}
              style={[
                styles.chartBar,
                {
                  height: point * 1.6,
                  backgroundColor: market.positive ? '#34D399' : '#F87171',
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.chartFoot}>Escala ilustrativa de momentum y retroceso demo.</Text>
      </View>

      <View style={styles.ticketCard}>
        <Text style={styles.ticketTitle}>Ticket de operacion demo</Text>
        <View style={styles.ticketGrid}>
          <Metric label="Activo" value={market.symbol} />
          <Metric label="Entrada mock" value={market.priceLabel} />
          <Metric label="Tamano" value="$1,500" />
          <Metric label="Riesgo" value="Medio" />
        </View>
        <Text style={styles.ticketWarning}>Trading real desactivado en demo segura.</Text>
        <View style={styles.tradeButtonRow}>
          <Pressable onPress={() => onBlockedAction(DEMO_BLOCKED_ACTION_LABEL)} style={styles.buyButton}>
            <Text style={styles.tradeButtonText}>Comprar</Text>
          </Pressable>
          <Pressable onPress={() => onBlockedAction(DEMO_BLOCKED_ACTION_LABEL)} style={styles.sellButton}>
            <Text style={styles.tradeButtonText}>Vender</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Posiciones demo</Text>
        <View style={styles.positionsList}>
          {QVEX_DEMO_POSITIONS.map((position) => (
            <View key={position.id} style={styles.positionCard}>
              <View>
                <Text style={styles.positionSymbol}>{position.symbol}</Text>
                <Text style={styles.positionMeta}>{position.side} - {position.exposureLabel}</Text>
              </View>
              <View style={styles.positionRight}>
                <Text style={styles.positionPnl}>{position.pnlLabel}</Text>
                <Text style={styles.positionConfidence}>Confianza demo {position.confidence}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  buyButton: {
    backgroundColor: 'rgba(52,211,153,0.2)',
    borderColor: 'rgba(52,211,153,0.36)',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  chartBar: {
    borderRadius: 999,
    width: 12,
  },
  chartBars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    height: 104,
  },
  chartCard: {
    backgroundColor: 'rgba(12,17,27,0.95)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  chartFoot: {
    color: '#8DA2B8',
    fontFamily: FONT.regular,
    fontSize: 12,
  },
  chartTitle: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  demoBanner: {
    color: '#8BD8FF',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  marketChange: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  marketHeader: {
    backgroundColor: 'rgba(14,20,33,0.95)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    padding: 18,
  },
  marketPrice: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 26,
  },
  marketSymbol: {
    color: '#93A3BA',
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  metricCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    flex: 1,
    gap: 6,
    minWidth: 130,
    padding: 14,
  },
  metricLabel: {
    color: '#8DA2B8',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  metricValue: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  negative: {
    color: '#F87171',
  },
  positionCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  positionConfidence: {
    color: '#8DA2B8',
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  positionMeta: {
    color: '#8DA2B8',
    fontFamily: FONT.regular,
    fontSize: 12,
  },
  positionPnl: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  positionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  positionSymbol: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  positionsList: {
    gap: 10,
  },
  positive: {
    color: '#34D399',
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
  sellButton: {
    backgroundColor: 'rgba(248,113,113,0.18)',
    borderColor: 'rgba(248,113,113,0.34)',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  subtitle: {
    color: '#94A2B8',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  ticketCard: {
    backgroundColor: 'rgba(12,17,27,0.95)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  ticketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ticketTitle: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  ticketWarning: {
    color: '#F59E0B',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  title: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 22,
  },
  tradeButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tradeButtonText: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 14,
    textAlign: 'center',
  },
});
