import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { BotSegmentedModeTabs } from '../../components/botFutures/BotSegmentedModeTabs';
import { ExchangeAvailabilityPill } from '../../components/botFutures/ExchangeAvailabilityPill';
import { RiskDisclosureCard } from '../../components/botFutures/RiskDisclosureCard';
import { RiskModeNoticeCard } from '../../components/botFutures/RiskModeNoticeCard';
import { ScreenContainer } from '../../components/common/ScreenContainer';

const modeOptions = [
  { id: 'simulated', label: 'Simulado' },
  { id: 'testnet', label: 'Testnet' },
  { id: 'real', label: 'Real' },
];

export default function BotFuturesDisclaimerScreen() {
  const { colors } = useAppTheme();
  const [mode, setMode] = useState('simulated');

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Risk Disclosure"
        subtitle="Antes de entrar al entorno avanzado del bot futures, OrbitX deja claro el alcance de Astra, el riesgo del producto y la responsabilidad final del usuario."
      />

      <View
        style={[
          styles.banner,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
            borderColor: withOpacity(colors.borderStrong, 0.18),
          },
        ]}
      >
        <ExchangeAvailabilityPill label="Binance Futures" tone="featured" />
        <BotSectionTitle
          title="Analisis y asistencia operativa, no promesa de ganancias"
          subtitle="OrbitX y Astra brindan analisis, senales y apoyo tactico de entrada o salida. No garantizan rendimiento ni reemplazan el criterio del usuario."
        />
      </View>

      <BotSectionTitle
        title="Modo de acceso"
        subtitle="La advertencia se adapta a Simulado, Testnet y Real, con mas rigor visual cuando el usuario se acerca a un entorno real."
      />
      <BotSegmentedModeTabs options={modeOptions} value={mode} onChange={setMode} />

      <View style={styles.modeList}>
        <RiskModeNoticeCard
          label="Simulado"
          title="Entorno de practica visual"
          body="Pensado para revisar analisis, niveles y flujo operativo sin dinero real y sin ejecucion efectiva."
          active={mode === 'simulated'}
          tone="safe"
          onPress={() => setMode('simulated')}
        />
        <RiskModeNoticeCard
          label="Testnet"
          title="Pruebas controladas"
          body="Preparado para validar decisiones, entradas y manejo de riesgo con mayor realismo, aun sin exposicion financiera real."
          active={mode === 'testnet'}
          tone="test"
          onPress={() => setMode('testnet')}
        />
        <RiskModeNoticeCard
          label="Real"
          title="Mayor responsabilidad"
          body="En modo real, OrbitX y Astra solo asisten con analisis y lectura operativa. El usuario mantiene la responsabilidad final sobre la operacion."
          active={mode === 'real'}
          tone="real"
          onPress={() => setMode('real')}
        />
      </View>

      <RiskDisclosureCard
        title="Lectura profesional del riesgo"
        body="El modulo Bot Futures esta pensado como una capa seria de analisis y asistencia. Astra puede sugerir zona de entrada, invalidacion, stop ideal, take profit, cierre parcial o salida completa, pero nunca garantiza ganancias."
        emphasis={mode === 'real'}
      />

      <BotControlBar
        primaryLabel={mode === 'real' ? 'Entiendo el riesgo y revisar inicio' : 'Continuar a confirmacion'}
        secondaryLabel="Volver a Configuracion"
        onPrimary={() => router.push('/bot-futures/confirm-start')}
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
  banner: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  modeList: {
    gap: 14,
  },
});
