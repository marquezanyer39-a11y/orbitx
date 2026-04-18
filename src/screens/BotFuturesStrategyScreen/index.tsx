import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '../../../hooks/useAppTheme';
import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotQuickSummaryCard } from '../../components/botFutures/BotQuickSummaryCard';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { BotSegmentedModeTabs } from '../../components/botFutures/BotSegmentedModeTabs';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { StrategyPresetCard } from '../../components/botFutures/StrategyPresetCard';

const modeOptions = [
  { id: 'simulated', label: 'Simulado' },
  { id: 'testnet', label: 'Testnet' },
  { id: 'real', label: 'Real' },
];

const presets = [
  {
    id: 'trend',
    title: 'Trend Following',
    summary: 'Pensada para mercados con direccion clara y ejecucion mas paciente.',
    bullets: ['Sesgo direccional', 'Entradas limpias', 'Menor ruido operativo'],
  },
  {
    id: 'range',
    title: 'Range Control',
    summary: 'Enfoque visual para escenarios laterales con control mas fino del contexto.',
    bullets: ['Lectura de zonas', 'Reaccion menos agresiva', 'Buena para testnet'],
  },
  {
    id: 'breakout',
    title: 'Breakout',
    summary: 'Preset pensado para rupturas con confirmacion y mayor intensidad operativa.',
    bullets: ['Mas dinamica', 'Necesita mejor contexto', 'Ideal para evaluacion avanzada'],
  },
];

export default function BotFuturesStrategyScreen() {
  const { colors } = useAppTheme();
  const [mode, setMode] = useState('simulated');
  const [preset, setPreset] = useState('trend');

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Estrategia"
        subtitle="Elige la forma en que el bot futures se presentara operativamente dentro del modulo, sin logica real por ahora."
      />

      <BotSectionTitle
        title="Modo visible"
        subtitle="La estrategia se puede visualizar en Simulado, Testnet o Real sin romper la consistencia del flujo."
      />
      <BotSegmentedModeTabs options={modeOptions} value={mode} onChange={setMode} />

      <BotSectionTitle
        title="Preset estrategico"
        subtitle="Estos presets son visuales y sirven para jerarquizar la experiencia del modulo antes de conectar logica real."
      />

      <View style={styles.presetList}>
        {presets.map((item) => (
          <StrategyPresetCard
            key={item.id}
            title={item.title}
            summary={item.summary}
            bullets={item.bullets}
            active={preset === item.id}
            onPress={() => setPreset(item.id)}
          />
        ))}
      </View>

      <View style={styles.summaryGrid}>
        <BotQuickSummaryCard
          label="Preset activo"
          value={presets.find((item) => item.id === preset)?.title ?? 'Trend Following'}
          note="Base visual para conectar despues con reglas y ejecucion reales."
        />
        <BotQuickSummaryCard
          label="Siguiente paso"
          value="Risk Manager"
          note="Ahora puedes definir guardrails, limites y bloqueos de la interfaz."
        />
      </View>

      <BotControlBar
        primaryLabel="Ir a Risk Manager"
        secondaryLabel="Volver a Configuracion"
        onPrimary={() => router.push('/bot-futures/risk-manager')}
        onSecondary={() => router.push('/bot-futures/configuration')}
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
  presetList: {
    gap: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
