import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '../../components/common/PrimaryButton';
import { BotFuturesWizardHeader } from '../../components/botFutures/BotFuturesWizardHeader';
import { BotFuturesWizardStepBar } from '../../components/botFutures/BotFuturesWizardStepBar';
import { ExchangeSelectionCard } from '../../components/botFutures/ExchangeSelectionCard';
import {
  BOT_FUTURES_EXCHANGE_DEFINITIONS,
  useBotFuturesOnboarding,
  type BotFuturesExchangeId,
} from '../../components/botFutures/useBotFuturesOnboarding';
import { ScreenContainer } from '../../components/common/ScreenContainer';

const exchangeOrder: BotFuturesExchangeId[] = ['binance', 'okx', 'bybit', 'other'];

export default function BotFuturesConnectExchangeScreen() {
  const selectedExchange = useBotFuturesOnboarding((state) => state.selectedExchange);
  const setSelectedExchange = useBotFuturesOnboarding((state) => state.setSelectedExchange);
  const resetConnectionState = useBotFuturesOnboarding((state) => state.resetConnectionState);
  const setWizardStep = useBotFuturesOnboarding((state) => state.setWizardStep);
  const canContinue = Boolean(selectedExchange && selectedExchange !== 'other');

  useEffect(() => {
    setWizardStep(1);
  }, [setWizardStep]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesWizardHeader
        title="Conectar Exchange"
        subtitle="Selecciona el exchange que usaras con OrbitX"
        onBack={() => router.back()}
      />

      <BotFuturesWizardStepBar
        currentStep={1}
        totalSteps={5}
        label="Pasos para conectar: 1/5"
      />

      <View style={styles.cardList}>
        {exchangeOrder.map((exchangeId) => {
          const exchange = BOT_FUTURES_EXCHANGE_DEFINITIONS[exchangeId];
          return (
            <ExchangeSelectionCard
              key={exchangeId}
              title={exchange.name}
              status={exchange.status}
              description={exchange.description}
              shortName={exchange.shortName}
              accent={exchange.accent}
              selected={selectedExchange === exchangeId}
              onPress={() => {
                setSelectedExchange(exchangeId);
                resetConnectionState();
                setWizardStep(1);
              }}
            />
          );
        })}
      </View>

      <PrimaryButton
        label={selectedExchange === 'other' ? 'Disponible pronto' : 'Continuar'}
        onPress={() => router.push('/bot-futures/mode')}
        disabled={!canContinue}
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
    gap: 14,
  },
});
