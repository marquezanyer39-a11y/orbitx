import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotEmptyStateCard } from '../../components/botFutures/BotEmptyStateCard';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotHistoryCard } from '../../components/botFutures/BotHistoryCard';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { ScreenContainer } from '../../components/common/ScreenContainer';

const historyItems = [
  {
    date: 'Hoy - 09:42',
    tag: 'Wait',
    title: 'BTCUSDT quedo en lista de espera por confirmacion incompleta',
    body: 'La idea mantenia estructura util, pero el cierre no valido continuidad suficiente para una entrada disciplinada.',
  },
  {
    date: 'Hoy - 09:27',
    tag: 'Reduce',
    title: 'ETHUSDT activo cierre parcial por fatiga de recorrido',
    body: 'La posicion seguia viva, aunque el impulso perdio eficiencia. La lectura operativa priorizo asegurar parte del avance.',
  },
  {
    date: 'Hoy - 09:10',
    tag: 'Invalidated',
    title: 'SOLUSDT cambio estructura y la idea quedo descartada',
    body: 'Al perder el pivote de control, el setup dejo de ofrecer una relacion riesgo/beneficio suficiente para sostenerlo.',
  },
];

export default function BotFuturesHistoryScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Historial del Bot"
        subtitle="Bitacora operativa del modulo futures, presentada como registro serio y legible para futura auditoria."
      />

      <BotSectionTitle
        title="Bitacora reciente"
        subtitle="Los eventos se muestran con tono institucional y tecnico, no como conversacion ni chat."
      />

      <View style={styles.list}>
        {historyItems.map((item) => (
          <BotHistoryCard key={`${item.date}-${item.title}`} {...item} />
        ))}
      </View>

      <BotEmptyStateCard
        icon="document-text-outline"
        title="Sin historial archivado adicional"
        body="Cuando el backend real este conectado, aqui apareceran cierres historicos, resets de riesgo y secuencias completas del bot."
      />

      <BotControlBar
        primaryLabel="Ver Performance"
        secondaryLabel="Volver a Actividad"
        onPrimary={() => router.push('/bot-futures/performance')}
        onSecondary={() => router.push('/bot-futures/activity')}
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
    gap: 12,
  },
});
