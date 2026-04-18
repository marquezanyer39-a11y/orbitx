import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '../../components/common/PrimaryButton';
import { BotFuturesWizardHeader } from '../../components/botFutures/BotFuturesWizardHeader';
import { BotFuturesWizardStepBar } from '../../components/botFutures/BotFuturesWizardStepBar';
import { ModeSelectionCard } from '../../components/botFutures/ModeSelectionCard';
import {
  BOT_FUTURES_MODE_DEFINITIONS,
  useBotFuturesOnboarding,
  type BotFuturesModeId,
} from '../../components/botFutures/useBotFuturesOnboarding';
import { ScreenContainer } from '../../components/common/ScreenContainer';

const modeOrder: BotFuturesModeId[] = ['simulated', 'testnet', 'real'];

export default function BotFuturesModeScreen() {
  const selectedMode = useBotFuturesOnboarding((state) => state.selectedMode);
  const setSelectedMode = useBotFuturesOnboarding((state) => state.setSelectedMode);
  const resetConnectionState = useBotFuturesOnboarding((state) => state.resetConnectionState);
  const setWizardStep = useBotFuturesOnboarding((state) => state.setWizardStep);

  useEffect(() => {
    setWizardStep(2);
  }, [setWizardStep]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesWizardHeader
        title="Elegir modo"
        subtitle="Define como quieres operar"
        onBack={() => router.back()}
      />

      <BotFuturesWizardStepBar
        currentStep={2}
        totalSteps={5}
        label="Pasos para conectar: 2/5"
      />

      <View style={styles.cardList}>
        {modeOrder.map((modeId) => {
          const mode = BOT_FUTURES_MODE_DEFINITIONS[modeId];
          return (
            <ModeSelectionCard
              key={modeId}
              title={mode.name}
              description={mode.description}
              riskLabel={mode.riskLabel}
              accent={mode.accent}
              selected={selectedMode === modeId}
              onPress={() => {
                setSelectedMode(modeId);
                resetConnectionState();
                setWizardStep(2);
              }}
            />
          );
        })}
      </View>

      <PrimaryButton
        label="Continuar"
        onPress={() =>
          router.push(selectedMode === 'simulated' ? '/bot-futures/connect-success' : '/bot-futures/connect-guide')
        }
        disabled={!selectedMode}
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
