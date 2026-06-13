import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ApiKeysFormCard } from '../../components/botFutures/ApiKeysFormCard';
import { BotFuturesWizardHeader } from '../../components/botFutures/BotFuturesWizardHeader';
import { BotFuturesWizardStepBar } from '../../components/botFutures/BotFuturesWizardStepBar';
import {
  BOT_FUTURES_MODE_DEFINITIONS,
  useBotFuturesOnboarding,
} from '../../components/botFutures/useBotFuturesOnboarding';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

export default function BotFuturesConnectKeysScreen() {
  const selectedMode = useBotFuturesOnboarding((state) => state.selectedMode);
  const setWizardStep = useBotFuturesOnboarding((state) => state.setWizardStep);
  const resetConnectionState = useBotFuturesOnboarding((state) => state.resetConnectionState);
  const { colors } = useAppTheme();

  const mode = BOT_FUTURES_MODE_DEFINITIONS[selectedMode ?? 'testnet'];

  useEffect(() => {
    setWizardStep(4);
    resetConnectionState();
  }, [resetConnectionState, setWizardStep]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesWizardHeader
        title="Backend seguro pendiente"
        subtitle="La conexion real con exchanges sigue bloqueada dentro de la app"
        onBack={() => router.back()}
      />

      <BotFuturesWizardStepBar
        currentStep={4}
        totalSteps={5}
        label="Pasos para conectar: 4/5"
      />

      <ApiKeysFormCard modeLabel={mode.name} />

      <View
        style={[
          styles.noticeCard,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.86),
            borderColor: withOpacity(colors.borderStrong, 0.18),
          },
        ]}
      >
        <Text style={[styles.noticeTitle, { color: colors.text }]}>QVEX bloqueara este paso</Text>
        <Text style={[styles.noticeBody, { color: colors.textMuted }]}>
          Las API secrets deben vivir solo en backend seguro. El frontend solo debera iniciar un
          flujo protegido u OAuth cuando QVEX apruebe la integracion del broker.
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <PrimaryButton
          label="Conexion segura proximamente"
          tone="secondary"
          onPress={() => undefined}
          disabled
          style={styles.secondaryButton}
        />
        <PrimaryButton
          label="Volver al bot"
          onPress={() => router.push('/bot-futures/overview')}
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
  noticeCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  noticeTitle: {
    fontFamily: FONT.semibold,
    fontSize: 15,
    lineHeight: 19,
  },
  noticeBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
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
