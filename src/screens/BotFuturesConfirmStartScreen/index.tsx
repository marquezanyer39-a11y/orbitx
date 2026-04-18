import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AstraLiveHintCard } from '../../components/botFutures/AstraLiveHintCard';
import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotQuickSummaryCard } from '../../components/botFutures/BotQuickSummaryCard';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { ConfirmStartCard } from '../../components/botFutures/ConfirmStartCard';
import { EmergencyActionCard } from '../../components/botFutures/EmergencyActionCard';
import { ScreenContainer } from '../../components/common/ScreenContainer';

export default function BotFuturesConfirmStartScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Confirmacion previa"
        subtitle="Ultima capa visual antes de iniciar el bot futures: riesgo, modo, estrategia y capital asignado en una sola vista."
      />

      <BotSectionTitle
        title="Checklist operativo"
        subtitle="Esta pantalla refuerza responsabilidad final, claridad del setup y disciplina antes del inicio."
      />

      <View style={styles.cardList}>
        <ConfirmStartCard
          title="Modo actual"
          body="Testnet activo. El entorno conserva estructura operativa y lectura seria de riesgo, pero sin exponer capital real."
        />
        <ConfirmStartCard
          title="Estrategia visible"
          body="Trend Following con entrada conservadora. Astra favorece esperar confirmacion estructural antes de habilitar agresividad."
        />
        <ConfirmStartCard
          title="Capital asignado"
          body="12% del portafolio base del modulo. La idea es trabajar con exposicion definida y guardrails claros desde el inicio."
        />
        <ConfirmStartCard
          title="Responsabilidad y riesgo"
          body="OrbitX y Astra entregan analisis y asistencia operativa. La decision final sigue siendo del usuario y el modo Real implica riesgo de perdidas reales."
        />
      </View>

      <AstraLiveHintCard
        title="Lectura previa de Astra"
        hint="Astra valida que el setup este ordenado, pero recuerda que la entrada solo debe existir si la estructura confirma. Si cambia la idea, no abrir sigue siendo una decision valida."
        tone="watch"
      />

      <View style={styles.summaryGrid}>
        <BotQuickSummaryCard
          label="Exchange"
          value="Binance Futures"
          note="Preparado para futura integracion real sin amarrar el diseno a un solo exchange."
        />
        <BotQuickSummaryCard
          label="Estado"
          value="Listo para iniciar"
          note="La UX ya se siente de sistema completo, aunque aun no exista ejecucion real."
        />
      </View>

      <EmergencyActionCard
        body="Incluso antes de iniciar, OrbitX deja visible la salida de contencion para reforzar confianza, control y disciplina institucional."
      />

      <BotControlBar
        primaryLabel="Continuar al Overview"
        secondaryLabel="Volver al Disclosure"
        onPrimary={() => router.push('/bot-futures/overview')}
        onSecondary={() => router.push('/bot-futures/disclaimer')}
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
  cardList: {
    gap: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
