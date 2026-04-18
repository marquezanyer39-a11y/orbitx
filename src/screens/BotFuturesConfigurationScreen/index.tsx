import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { BotConfigFieldCard } from '../../components/botFutures/BotConfigFieldCard';
import { BotConfigOptionRow } from '../../components/botFutures/BotConfigOptionRow';
import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotQuickSummaryCard } from '../../components/botFutures/BotQuickSummaryCard';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { BotSegmentedModeTabs } from '../../components/botFutures/BotSegmentedModeTabs';
import { ExchangeAvailabilityPill } from '../../components/botFutures/ExchangeAvailabilityPill';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import {
  BOT_FUTURES_EXCHANGE_DEFINITIONS,
  type BotFuturesModeId,
  useBotFuturesStore,
} from '../../store/botFuturesStore';

const modeOptions = [
  { id: 'simulated', label: 'Simulado' },
  { id: 'testnet', label: 'Testnet' },
  { id: 'real', label: 'Real' },
];

export default function BotFuturesConfigurationScreen() {
  const { colors } = useAppTheme();
  const selectedMode = useBotFuturesStore((state) => state.selectedMode);
  const selectedExchange = useBotFuturesStore((state) => state.selectedExchange);
  const cadence = useBotFuturesStore((state) => state.cadence);
  const riskProfile = useBotFuturesStore((state) => state.riskProfile);
  const setSelectedMode = useBotFuturesStore((state) => state.setSelectedMode);
  const setCadence = useBotFuturesStore((state) => state.setCadence);
  const setRiskProfile = useBotFuturesStore((state) => state.setRiskProfile);

  const mode = selectedMode ?? 'simulated';
  const exchange = selectedExchange
    ? BOT_FUTURES_EXCHANGE_DEFINITIONS[selectedExchange].name
    : 'Sin exchange';
  const cadenceLabel = cadence === '1h' ? 'Cada 1 h' : 'Cada 15 min';
  const exposure = riskProfile === 'aggressive' ? 'Agresiva' : riskProfile === 'conservative' ? 'Conservadora' : 'Moderada';

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Configuracion del Bot"
        subtitle="Organiza el exchange, el modo operativo y los parametros visuales base antes de definir estrategia y riesgo."
      />

      <View
        style={[
          styles.topShell,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.78),
            borderColor: withOpacity(colors.borderStrong, 0.18),
          },
        ]}
      >
        <BotSectionTitle
          title="Contexto operativo"
          subtitle="Esta pantalla deja lista la estructura del bot para multiples exchanges y diferentes niveles de simulacion."
        />
        <ExchangeAvailabilityPill
          label={exchange}
          tone="featured"
        />
      </View>

      <BotSectionTitle
        title="Modo del modulo"
        subtitle="El mismo flujo queda preparado para Simulado, Testnet y Real desde la interfaz."
      />
      <BotSegmentedModeTabs
        options={modeOptions}
        value={mode}
        onChange={(next) => setSelectedMode(next as BotFuturesModeId)}
      />

      <View style={styles.fieldGrid}>
        <BotConfigFieldCard
          label="Exchange visible"
          value={exchange}
          hint="Visualmente listo para multi-exchange sin solicitar credenciales en esta fase."
        />
        <BotConfigFieldCard
          label="Cadencia del bot"
          value={cadenceLabel}
          hint="Frecuencia referencial para la UI del modulo, sin scheduler real todavia."
        />
      </View>

      <BotSectionTitle
        title="Parametros base"
        subtitle="Opciones visuales jerarquizadas para dejar lista la configuracion inicial del bot futures."
      />

      <View style={styles.optionList}>
        <BotConfigOptionRow
          label="Exchange principal"
          value={exchange}
          description="Binance Futures aparece como referencia principal para la integracion futura."
          active={Boolean(selectedExchange)}
          onPress={() => router.push('/bot-futures/connect-exchange')}
        />
        <BotConfigOptionRow
          label="Frecuencia de evaluacion"
          value={cadenceLabel}
          description="Solo presentacion visual por ahora. Luego podra ligarse a scheduler real."
          onPress={() => setCadence(cadence === '15m' ? '1h' : '15m')}
        />
        <BotConfigOptionRow
          label="Exposicion objetivo"
          value={exposure}
          description="Base para conectar despues con estrategia y risk manager."
          onPress={() =>
            setRiskProfile(
              riskProfile === 'moderate' ? 'conservative' : riskProfile === 'conservative' ? 'aggressive' : 'moderate',
            )
          }
        />
        <BotConfigOptionRow
          label="Risk Disclosure"
          value="Requerido"
          description="Puerta de entrada al entorno live avanzado, con descargo profesional y serio."
          onPress={() => router.push('/bot-futures/disclaimer')}
        />
      </View>

      <View style={styles.summaryGrid}>
        <BotQuickSummaryCard
          label="Modo"
          value={modeOptions.find((item) => item.id === mode)?.label ?? 'Simulado'}
          note="El modulo conserva el mismo lenguaje visual en los tres niveles."
        />
        <BotQuickSummaryCard
          label="Siguiente paso"
          value={selectedExchange ? 'Estrategia' : 'Conectar Exchange'}
          note={
            selectedExchange
              ? 'Despues de esta configuracion puedes definir el perfil operativo del bot.'
              : 'Primero conviene completar el onboarding del exchange para evitar contradicciones.'
          }
        />
      </View>

      <BotControlBar
        primaryLabel="Ir a Estrategia"
        secondaryLabel="Risk Manager"
        onPrimary={() => router.push('/bot-futures/strategy')}
        onSecondary={() => router.push('/bot-futures/risk-manager')}
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
  topShell: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionList: {
    gap: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
