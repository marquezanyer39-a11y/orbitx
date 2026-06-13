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
  const isSimulated = selectedMode === 'simulated';

  const body = isSimulated
      ? 'Modo simulado listo. No se solicitaron claves y el flujo queda preparado para practicar sin riesgo.'
      : `La conexión real para ${exchange.name} sigue bloqueada hasta que QVEX habilite backend seguro. No se guardaron claves ni secrets en la app.`;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesWizardHeader
        title={isSimulated ? 'Confirmación' : 'Próximamente'}
        subtitle={
          isSimulated
            ? 'La conexión quedó lista dentro del flujo del módulo'
            : 'El broker real sigue bloqueado hasta habilitar autorización segura'
        }
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
          label="Ir a configuración"
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
