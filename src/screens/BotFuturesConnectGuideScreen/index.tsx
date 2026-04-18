import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { PrimaryButton } from '../../components/common/PrimaryButton';
import { BotFuturesWizardHeader } from '../../components/botFutures/BotFuturesWizardHeader';
import { BotFuturesWizardStepBar } from '../../components/botFutures/BotFuturesWizardStepBar';
import { ConnectionGuideCard } from '../../components/botFutures/ConnectionGuideCard';
import {
  BOT_FUTURES_EXCHANGE_DEFINITIONS,
  BOT_FUTURES_MODE_DEFINITIONS,
  useBotFuturesOnboarding,
} from '../../components/botFutures/useBotFuturesOnboarding';
import { ScreenContainer } from '../../components/common/ScreenContainer';

function getGuideSteps(exchangeName: string) {
  return [
    `Inicia sesion en ${exchangeName} y abre API Management.`,
    'Crea una nueva clave para OrbitX con permisos de trading.',
    'No habilites retiros y guarda la API Key y la Secret Key en un lugar seguro.',
  ];
}

export default function BotFuturesConnectGuideScreen() {
  const selectedExchange = useBotFuturesOnboarding((state) => state.selectedExchange);
  const selectedMode = useBotFuturesOnboarding((state) => state.selectedMode);
  const setWizardStep = useBotFuturesOnboarding((state) => state.setWizardStep);
  const completeGuide = useBotFuturesOnboarding((state) => state.completeGuide);

  const exchange =
    BOT_FUTURES_EXCHANGE_DEFINITIONS[selectedExchange ?? 'binance'];
  const mode = BOT_FUTURES_MODE_DEFINITIONS[selectedMode ?? 'testnet'];

  useEffect(() => {
    setWizardStep(3);
  }, [setWizardStep]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesWizardHeader
        title={`Como conectar ${exchange.name}`}
        subtitle="Guia corta y clara para conectar el exchange con seguridad"
        onBack={() => router.back()}
      />

      <BotFuturesWizardStepBar
        currentStep={3}
        totalSteps={5}
        label="Pasos para conectar: 3/5"
      />

      <ConnectionGuideCard
        title={`Paso 3: Como conectar ${exchange.name}`}
        steps={getGuideSteps(exchange.name)}
        warning={`Modo seleccionado: ${mode.name}. Nunca habilites retiros para OrbitX.`}
      />

      <PrimaryButton
        label="Ya tengo mis claves"
        onPress={() => {
          completeGuide();
          router.push('/bot-futures/connect-keys');
        }}
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
});
