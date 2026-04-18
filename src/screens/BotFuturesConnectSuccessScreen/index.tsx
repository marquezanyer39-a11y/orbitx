import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '../../components/common/PrimaryButton';
import { BotFuturesWizardHeader } from '../../components/botFutures/BotFuturesWizardHeader';
import { BotFuturesWizardStepBar } from '../../components/botFutures/BotFuturesWizardStepBar';
import { ConnectionSuccessCard } from '../../components/botFutures/ConnectionSuccessCard';
import {
  BOT_FUTURES_EXCHANGE_DEFINITIONS,
  BOT_FUTURES_MODE_DEFINITIONS,
  useBotFuturesOnboarding,
} from '../../components/botFutures/useBotFuturesOnboarding';
import { ScreenContainer } from '../../components/common/ScreenContainer';

export default function BotFuturesConnectSuccessScreen() {
  const selectedExchange = useBotFuturesOnboarding((state) => state.selectedExchange);
  const selectedMode = useBotFuturesOnboarding((state) => state.selectedMode);
  const resetWizard = useBotFuturesOnboarding((state) => state.resetWizard);
  const setWizardStep = useBotFuturesOnboarding((state) => state.setWizardStep);

  useEffect(() => {
    setWizardStep(5);
  }, [setWizardStep]);

  const exchange = BOT_FUTURES_EXCHANGE_DEFINITIONS[selectedExchange ?? 'binance'];
  const mode = BOT_FUTURES_MODE_DEFINITIONS[selectedMode ?? 'simulated'];

  const body =
    selectedMode === 'simulated'
      ? 'Modo simulado listo. No se solicitaron claves y el flujo queda preparado para practicar sin riesgo.'
      : `Cuenta ${mode.name} conectada visualmente. El bot queda listo para pasar a configuracion sin contradicciones de modo.`;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesWizardHeader
        title="Confirmacion"
        subtitle="La conexion quedo lista dentro del flujo del modulo"
        onBack={() => router.back()}
      />

      <BotFuturesWizardStepBar
        currentStep={5}
        totalSteps={5}
        label="Pasos para conectar: 5/5"
      />

      <ConnectionSuccessCard exchange={exchange.name} mode={mode.name} body={body} />

      <View style={styles.buttonStack}>
        <PrimaryButton
          label="Ir a configuracion"
          onPress={() => router.push('/bot-futures/configuration')}
        />
        <PrimaryButton
          label="Ir al bot"
          tone="secondary"
          onPress={() => router.push('/bot-futures/overview')}
        />
        <PrimaryButton
          label="Reiniciar wizard"
          tone="ghost"
          onPress={() => {
            resetWizard();
            router.push('/bot-futures/connect-exchange');
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 40,
  },
  buttonStack: {
    gap: 12,
  },
});
