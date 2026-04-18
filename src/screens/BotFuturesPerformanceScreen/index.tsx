import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotEmptyStateCard } from '../../components/botFutures/BotEmptyStateCard';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { PerformanceBreakdownCard } from '../../components/botFutures/PerformanceBreakdownCard';
import { PerformanceKpiCard } from '../../components/botFutures/PerformanceKpiCard';
import { ScreenContainer } from '../../components/common/ScreenContainer';

const kpis = [
  { label: 'Win rate', value: '62%', note: 'Indicador visual listo para conectarse a datos reales.' },
  { label: 'Profit factor', value: '1.48', note: 'Referencia simulada de eficiencia del sistema.' },
  { label: 'Max drawdown', value: '-3.2%', note: 'Preparado para medir deterioro operativo real.' },
  { label: 'Trades', value: '24', note: 'Volumen operativo mostrado solo como estructura UI.' },
];

export default function BotFuturesPerformanceScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Rendimiento / Performance"
        subtitle="KPIs y breakdowns visuales listos para conectar luego con datos reales del bot futures."
      />

      <BotSectionTitle
        title="KPIs principales"
        subtitle="La capa visual ya esta preparada para mostrar eficiencia, consistencia y deterioro operativo."
      />

      <View style={styles.grid}>
        {kpis.map((kpi) => (
          <PerformanceKpiCard key={kpi.label} {...kpi} />
        ))}
      </View>

      <View style={styles.breakdownList}>
        <PerformanceBreakdownCard
          title="Desglose operativo"
          rows={[
            { label: 'Modo actual', value: 'Testnet' },
            { label: 'Exchange visible', value: 'Binance Futures' },
            { label: 'Estrategia activa', value: 'Trend Following' },
            { label: 'Capital asignado', value: '12% del portafolio' },
          ]}
        />
        <PerformanceBreakdownCard
          title="Lectura de consistencia"
          rows={[
            { label: 'Sesiones favorables', value: 'Asia / Apertura US' },
            { label: 'Sensibilidad al ruido', value: 'Media' },
            { label: 'Disciplina de stop', value: 'Alta' },
            { label: 'Salidas parciales', value: 'Configuradas' },
          ]}
        />
      </View>

      <BotEmptyStateCard
        icon="stats-chart-outline"
        title="Sin rendimiento liquidado final"
        body="Hasta conectar la capa real, los KPI se muestran como estructura premium. Luego podran reflejar resultados historicos, equity curve y calidad de ejecucion."
      />

      <BotControlBar
        primaryLabel="Ver Historial"
        secondaryLabel="Volver al Overview"
        onPrimary={() => router.push('/bot-futures/history')}
        onSecondary={() => router.push('/bot-futures/overview')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  breakdownList: {
    gap: 12,
  },
});
