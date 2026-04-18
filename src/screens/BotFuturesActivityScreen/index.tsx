import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AstraLivePanel } from '../../components/botFutures/AstraLivePanel';
import { BotActivityLogCard } from '../../components/botFutures/BotActivityLogCard';
import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotEmptyStateCard } from '../../components/botFutures/BotEmptyStateCard';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { ScreenContainer } from '../../components/common/ScreenContainer';

const logs = [
  {
    time: '09:42',
    title: 'BTCUSDT quedo en espera por confirmacion pendiente',
    body: 'Astra descarto entrada agresiva: la zona era util, pero el cierre aun no confirmaba continuidad suficiente.',
  },
  {
    time: '09:27',
    title: 'ETHUSDT activo plan de cierre parcial',
    body: 'La estructura mantuvo la idea viva, pero Astra rebajo conviccion y priorizo asegurar parte del recorrido.',
  },
  {
    time: '09:10',
    title: 'SOLUSDT invalido la idea inicial',
    body: 'La ruptura perdio orden y el riesgo/beneficio dejo de compensar. Astra sugirio no abrir por cambio de estructura.',
  },
];

export default function BotFuturesActivityScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Actividad reciente"
        subtitle="Timeline visual del comportamiento del sistema futures, con lenguaje claro y trazabilidad lista para crecer."
      />

      <AstraLivePanel
        stance="Astra documenta la lectura tecnica y la gestion sugerida de cada decision."
        action="Su foco aqui es explicar por que se espero, por que se redujo, por que una idea se invalido o cuando conviene salir."
        context="La actividad reciente se presenta como bitacora operativa: clara, auditada y alineada a una experiencia de trading seria."
        entryGuide="Cada evento conserva el razonamiento tactico: zona observada, confirmacion pendiente o invalidacion detectada."
        managementGuide="Cuando una operacion sigue viva, Astra comunica si conviene cerrar parcial, mover stop a break-even o mantener disciplina hasta nueva confirmacion."
      />

      <BotSectionTitle
        title="Logs recientes"
        subtitle="Eventos legibles y ordenados para que el usuario entienda como razona el sistema."
      />

      <View style={styles.list}>
        {logs.map((log) => (
          <BotActivityLogCard key={`${log.time}-${log.title}`} {...log} />
        ))}
      </View>

      <BotEmptyStateCard
        icon="time-outline"
        title="Sin actividad historica extra"
        body="La bitacora completa crecera cuando exista backend real. Por ahora, el modulo ya deja resuelto el lenguaje visual y la trazabilidad."
      />

      <BotControlBar
        primaryLabel="Abrir Historial"
        secondaryLabel="Volver al Overview"
        onPrimary={() => router.push('/bot-futures/history')}
        onSecondary={() => router.push('/bot-futures/overview')}
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
  list: {
    gap: 14,
  },
});
