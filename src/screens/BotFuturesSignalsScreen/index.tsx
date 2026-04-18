import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AstraLiveHintCard } from '../../components/botFutures/AstraLiveHintCard';
import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotEmptyStateCard } from '../../components/botFutures/BotEmptyStateCard';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { BotSignalCard } from '../../components/botFutures/BotSignalCard';
import { ScreenContainer } from '../../components/common/ScreenContainer';

const signals = [
  {
    title: 'BTCUSDT zone reclaim',
    action: 'Esperar',
    summary: 'Astra marca una zona optima de entrada solo si el precio confirma sobre el ultimo nivel recuperado.',
    executionPlan:
      'Entrada conservadora: esperar retesteo limpio. Entrada agresiva: solo si la extension sostiene volumen y no rompe la invalidacion.',
    riskNote: 'Riesgo: riesgo/beneficio aun insuficiente si el precio entra demasiado extendido.',
  },
  {
    title: 'ETHUSDT structure under pressure',
    action: 'Cerrar parcial',
    summary: 'La idea sigue abierta, pero Astra detecta fatiga de continuidad y recomienda reducir exposicion.',
    executionPlan:
      'Gestion sugerida: tomar beneficio parcial y dejar remanente protegido. Si pierde soporte, la idea queda invalidada.',
    riskNote: 'Riesgo: degradacion del momentum intradia y rotacion en contra.',
  },
  {
    title: 'SOLUSDT extension without reset',
    action: 'No entrar',
    summary: 'Astra detecta desplazamiento rapido, pero aun no hay pullback util ni confirmacion suficiente.',
    executionPlan:
      'Plan sugerido: esperar pullback o no abrir. Si la estructura cambia y pierde el ultimo minimo valido, la idea se descarta.',
    riskNote: 'Riesgo: volatilidad alta, sin invalidacion corta y con estructura todavia inmadura.',
  },
];

export default function BotFuturesSignalsScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Senales del Bot"
        subtitle="Feed visual de entradas, esperas, salidas parciales y cierres sugeridos dentro del sistema futures."
      />

      <AstraLiveHintCard
        title="Astra en vivo"
        hint="Una senal util no es solo direccion. Astra evalua zona, confirmacion, invalidacion y calidad del riesgo/beneficio antes de sugerir entrada o descarte."
        tone="risk"
      />

      <BotSectionTitle
        title="Feed de senales"
        subtitle="Senales simuladas con tono de mesa operativa: zona de entrada, espera, invalidacion, cierre parcial o salida."
      />

      <View style={styles.list}>
        {signals.map((signal) => (
          <BotSignalCard key={signal.title} {...signal} />
        ))}
      </View>

      <BotEmptyStateCard
        icon="pulse-outline"
        title="Sin nuevas senales para este bloque"
        body="Cuando el bot no encuentre setups validos, el modulo mostrara este estado vacio elegante en lugar de forzar actividad artificial."
      />

      <BotControlBar
        primaryLabel="Abrir Detalle del Trade"
        secondaryLabel="Ver Actividad"
        onPrimary={() => router.push('/bot-futures/trade-detail')}
        onSecondary={() => router.push('/bot-futures/activity')}
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
