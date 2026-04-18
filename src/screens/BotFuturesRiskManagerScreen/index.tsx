import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { BotConfigOptionRow } from '../../components/botFutures/BotConfigOptionRow';
import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotQuickSummaryCard } from '../../components/botFutures/BotQuickSummaryCard';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { BotSegmentedModeTabs } from '../../components/botFutures/BotSegmentedModeTabs';
import { RiskLimitCard } from '../../components/botFutures/RiskLimitCard';
import { RiskWarningCard } from '../../components/botFutures/RiskWarningCard';
import { ScreenContainer } from '../../components/common/ScreenContainer';

const modeOptions = [
  { id: 'simulated', label: 'Simulado' },
  { id: 'testnet', label: 'Testnet' },
  { id: 'real', label: 'Real' },
];

export default function BotFuturesRiskManagerScreen() {
  const { colors } = useAppTheme();
  const [mode, setMode] = useState('simulated');
  const [riskProfile, setRiskProfile] = useState('Conservador');
  const [positionCap, setPositionCap] = useState('1.5%');
  const [dailyLoss, setDailyLoss] = useState('2.0%');

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Risk Manager"
        subtitle="Define la capa visual de limites, warnings y control del bot futures sin conectar todavia la politica real."
      />

      <BotSectionTitle
        title="Modo de riesgo"
        subtitle="La pantalla mantiene preparados Simulado, Testnet y Real con la misma jerarquia visual del modulo."
      />
      <BotSegmentedModeTabs options={modeOptions} value={mode} onChange={setMode} />

      <View
        style={[
          styles.limitShell,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.78),
            borderColor: withOpacity(colors.borderStrong, 0.18),
          },
        ]}
      >
        <BotSectionTitle
          title="Limites principales"
          subtitle="Valores visuales para maximo por posicion, perdida diaria y perfil operativo."
        />
        <View style={styles.limitGrid}>
          <RiskLimitCard
            label="Max por posicion"
            value={positionCap}
            note="Base para limitar exposicion del bot futures."
          />
          <RiskLimitCard
            label="Perdida diaria"
            value={dailyLoss}
            note="Referencia visual para frenar operativa cuando haga falta."
          />
          <RiskLimitCard
            label="Perfil"
            value={riskProfile}
            note="Luego se conectara con la policy real del bot."
          />
        </View>
      </View>

      <BotSectionTitle
        title="Guardrails visuales"
        subtitle="Opciones claras y jerarquizadas para que la experiencia del risk manager ya se sienta de producto real."
      />

      <View style={styles.optionList}>
        <BotConfigOptionRow
          label="Perfil de riesgo"
          value={riskProfile}
          description="Conservador, Moderado o Avanzado como base de la UI."
          active={riskProfile === 'Conservador'}
          onPress={() =>
            setRiskProfile((current) =>
              current === 'Conservador' ? 'Moderado' : current === 'Moderado' ? 'Avanzado' : 'Conservador',
            )
          }
        />
        <BotConfigOptionRow
          label="Tope por posicion"
          value={positionCap}
          description="Representa el maximo capital por idea dentro del bot futures."
          onPress={() => setPositionCap(positionCap === '1.5%' ? '3.0%' : '1.5%')}
        />
        <BotConfigOptionRow
          label="Stop diario"
          value={dailyLoss}
          description="Sirve para mostrar un guardrail claro antes de implementar politica real."
          onPress={() => setDailyLoss(dailyLoss === '2.0%' ? '4.0%' : '2.0%')}
        />
      </View>

      <RiskWarningCard
        title="Capa visual sin ejecucion real"
        body="En esta fase, el Risk Manager solo presenta jerarquia, limites y advertencias. No bloquea operativa real ni se conecta a exchange todavia."
      />

      <View style={styles.summaryGrid}>
        <BotQuickSummaryCard
          label="Estado"
          value="Guardrails listos"
          note="La estructura visual ya esta preparada para conectar policies y validaciones futuras."
        />
        <BotQuickSummaryCard
          label="Modulo"
          value="Bot Futures"
          note="La navegacion interna ya conecta Configuracion, Estrategia y Risk Manager."
        />
      </View>

      <BotControlBar
        primaryLabel="Ir al Disclosure"
        secondaryLabel="Volver a Estrategia"
        onPrimary={() => router.push('/bot-futures/disclaimer')}
        onSecondary={() => router.push('/bot-futures/strategy')}
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
  limitShell: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  limitGrid: {
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
