import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AstraLiveHintCard } from '../../components/botFutures/AstraLiveHintCard';
import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotEmptyStateCard } from '../../components/botFutures/BotEmptyStateCard';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { LivePositionCard } from '../../components/botFutures/LivePositionCard';
import { ScreenContainer } from '../../components/common/ScreenContainer';

const positions = [
  {
    symbol: 'BTCUSDT',
    side: 'Long',
    entry: '68,420',
    pnl: '+2.4%',
    riskState: 'Astra sugiere mover stop a break-even y evaluar cierre parcial',
  },
  {
    symbol: 'ETHUSDT',
    side: 'Short',
    entry: '3,210',
    pnl: '-0.7%',
    riskState: 'Astra ve estructura debilitada y evita sumar riesgo',
  },
];

export default function BotFuturesLivePositionsScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Posiciones en Vivo"
        subtitle="Una vista limpia y profesional de la exposicion actual del bot futures, preparada para futura conexion real."
      />

      <AstraLiveHintCard
        title="Gestion en vivo"
        hint="BTCUSDT mantiene ventaja tactica, pero la gestion ideal ya no es perseguir precio: Astra prefiere asegurar parcial y subir proteccion. En ETHUSDT, si la estructura cambia de nuevo, la lectura pasa a salida."
        tone="action"
      />

      <BotSectionTitle
        title="Exposicion abierta"
        subtitle="Cada posicion muestra direccion, entrada, pnl visual y lectura de gestion: break-even, cierre parcial, salida o espera."
      />

      <View style={styles.list}>
        {positions.map((position) => (
          <LivePositionCard key={position.symbol} {...position} />
        ))}
      </View>

      <BotEmptyStateCard
        icon="swap-horizontal-outline"
        title="Sin posiciones adicionales"
        body="Cuando no haya exposicion abierta, esta vista podra mantenerse limpia con un estado elegante en lugar de un panel vacio."
      />

      <BotControlBar
        primaryLabel="Abrir Detalle del Trade"
        secondaryLabel="Ver Senales"
        onPrimary={() => router.push('/bot-futures/trade-detail')}
        onSecondary={() => router.push('/bot-futures/signals')}
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
  list: {
    gap: 14,
  },
});
