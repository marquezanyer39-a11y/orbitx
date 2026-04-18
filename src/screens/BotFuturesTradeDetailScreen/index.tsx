import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AstraLivePanel } from '../../components/botFutures/AstraLivePanel';
import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { EmergencyActionCard } from '../../components/botFutures/EmergencyActionCard';
import { TradeDetailHeroCard } from '../../components/botFutures/TradeDetailHeroCard';
import { TradeLevelCard } from '../../components/botFutures/TradeLevelCard';
import { TradeManagementCard } from '../../components/botFutures/TradeManagementCard';
import { ScreenContainer } from '../../components/common/ScreenContainer';

export default function BotFuturesTradeDetailScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Detalle del Trade"
        subtitle="Vista operativa del setup actual con niveles, invalidacion, gestion sugerida y lectura tecnica de Astra."
      />

      <TradeDetailHeroCard
        symbol="BTCUSDT"
        side="Long setup"
        exchange="Binance Futures"
        mode="Testnet"
        setupLabel="Reclaim estructural con confirmacion parcial sobre soporte intradia."
      />

      <BotSectionTitle
        title="Niveles principales"
        subtitle="Entrada, stop, invalidacion y take profit presentados como capas claras para futura conexion real."
      />

      <View style={styles.levelGrid}>
        <TradeLevelCard
          label="Zona de entrada"
          value="68,180 - 68,320"
          note="Entrada conservadora si el retesteo mantiene orden y no pierde el nivel."
        />
        <TradeLevelCard
          label="Invalidacion"
          value="67,940"
          note="Si la estructura pierde este pivote, la idea deja de compensar."
          tone="risk"
        />
        <TradeLevelCard
          label="Stop ideal"
          value="67,980"
          note="Ubicacion tecnica pensada para proteger la idea sin dejarla sin aire."
          tone="risk"
        />
        <TradeLevelCard
          label="Take profit"
          value="68,760 / 69,020"
          note="Salida parcial en primera extension y remanente si el impulso sostiene."
          tone="reward"
        />
      </View>

      <AstraLivePanel
        stance="Astra mantiene sesgo favorable, pero no valida persecucion de precio fuera de la zona optima."
        action="Gestion sugerida: esperar confirmacion limpia o mantener disciplina. Si entra y gana extension, pasar a proteccion activa."
        context="La lectura actual prioriza calidad de entrada sobre velocidad. La idea sigue viva mientras la estructura no pierda su pivote operativo."
        entryGuide="Zona optima: pullback contenido sobre soporte recuperado. Entrada agresiva solo con volumen y cierre firme; entrada conservadora con retesteo limpio."
        managementGuide="Si el precio alcanza la primera extension, Astra sugiere cierre parcial y movimiento de stop a break-even. Si cambia la estructura, conviene salir sin insistir."
        onPrimary={() => router.push('/bot-futures/performance')}
        onSecondary={() => router.push('/bot-futures/history')}
      />

      <BotSectionTitle
        title="Gestion sugerida"
        subtitle="El trade ya se presenta como una ficha operativa profesional, sin ejecucion real todavia."
      />

      <View style={styles.managementList}>
        <TradeManagementCard
          title="Plan de ejecucion"
          body="No abrir si el precio se extiende sin reset. Si vuelve a zona y confirma, el trade puede tomarse con riesgo definido y estructura valida."
        />
        <TradeManagementCard
          title="Lectura de riesgo"
          body="La relacion riesgo/beneficio sigue siendo atractiva solo dentro de la zona. Fuera de ella, Astra baja conviccion y prioriza esperar."
        />
        <TradeManagementCard
          title="Gestion de salida"
          body="Si el primer objetivo se cumple, la gestion ideal es asegurar parcial y proteger el resto con stop ajustado a break-even."
        />
      </View>

      <EmergencyActionCard
        body="Bloque institucional de contencion para salir de la exposicion visible y detener el bot sin improvisacion. En esta fase solo presenta la UX y el criterio operativo."
      />

      <BotControlBar
        primaryLabel="Volver a Posiciones"
        secondaryLabel="Ver Senales"
        onPrimary={() => router.push('/bot-futures/live-positions')}
        onSecondary={() => router.push('/bot-futures/signals')}
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
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  managementList: {
    gap: 12,
  },
});
