import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ApiKeysFormCard } from '../../components/botFutures/ApiKeysFormCard';
import { BotFuturesWizardHeader } from '../../components/botFutures/BotFuturesWizardHeader';
import { BotFuturesWizardStepBar } from '../../components/botFutures/BotFuturesWizardStepBar';
import { ConnectionStatusCard } from '../../components/botFutures/ConnectionStatusCard';
import {
  BOT_FUTURES_MODE_DEFINITIONS,
  useBotFuturesOnboarding,
} from '../../components/botFutures/useBotFuturesOnboarding';
import { ScreenContainer } from '../../components/common/ScreenContainer';

export default function BotFuturesConnectKeysScreen() {
  const apiKey = useBotFuturesOnboarding((state) => state.apiKey);
  const secretKey = useBotFuturesOnboarding((state) => state.secretKey);
  const selectedMode = useBotFuturesOnboarding((state) => state.selectedMode);
  const connectionStatus = useBotFuturesOnboarding((state) => state.connectionStatus);
  const validationError = useBotFuturesOnboarding((state) => state.validationError);
  const setApiKey = useBotFuturesOnboarding((state) => state.setApiKey);
  const setSecretKey = useBotFuturesOnboarding((state) => state.setSecretKey);
  const setConnectionStatus = useBotFuturesOnboarding((state) => state.setConnectionStatus);
  const completeValidation = useBotFuturesOnboarding((state) => state.completeValidation);
  const setWizardStep = useBotFuturesOnboarding((state) => state.setWizardStep);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mode = BOT_FUTURES_MODE_DEFINITIONS[selectedMode ?? 'testnet'];

  useEffect(() => {
    setWizardStep(4);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [setWizardStep]);

  const handleValidate = () => {
    const normalizedApiKey = apiKey.trim();
    const normalizedSecretKey = secretKey.trim();

    if (normalizedApiKey.length < 10 || normalizedSecretKey.length < 10) {
      setConnectionStatus(
        'error',
        'Las claves deben verse completas para simular una validacion correcta.',
      );
      return;
    }

    setConnectionStatus('validating');

    timeoutRef.current = setTimeout(() => {
      if (/demo|test|fake/i.test(normalizedApiKey) || /demo|test|fake/i.test(normalizedSecretKey)) {
        setConnectionStatus(
          'error',
          'Las claves de ejemplo no pueden pasar la validacion visual.',
        );
        return;
      }

      completeValidation();
    }, 1100);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesWizardHeader
        title="Pega tus claves"
        subtitle="Introduce las claves del exchange para continuar"
        onBack={() => router.back()}
      />

      <BotFuturesWizardStepBar
        currentStep={4}
        totalSteps={5}
        label="Pasos para conectar: 4/5"
      />

      <ApiKeysFormCard
        apiKey={apiKey}
        secretKey={secretKey}
        modeLabel={mode.name}
        onApiKeyChange={setApiKey}
        onSecretKeyChange={setSecretKey}
      />

      <ConnectionStatusCard status={connectionStatus} error={validationError} />

      <View style={styles.buttonRow}>
        <PrimaryButton
          label="Validar"
          tone="secondary"
          onPress={handleValidate}
          disabled={connectionStatus === 'validating'}
          style={styles.secondaryButton}
        />
        <PrimaryButton
          label="Validar y Continuar"
          onPress={() => router.push('/bot-futures/connect-success')}
          disabled={connectionStatus !== 'connected'}
          style={styles.primaryButton}
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1.3,
  },
});
