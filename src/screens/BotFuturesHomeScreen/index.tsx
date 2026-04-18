import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { BotControlBar } from '../../components/botFutures/BotControlBar';
import { BotFuturesHeader } from '../../components/botFutures/BotFuturesHeader';
import { BotQuickSummaryCard } from '../../components/botFutures/BotQuickSummaryCard';
import { BotSectionTitle } from '../../components/botFutures/BotSectionTitle';
import { BotStatusCard } from '../../components/botFutures/BotStatusCard';
import { ExchangeOptionCard } from '../../components/botFutures/ExchangeOptionCard';
import { ScreenContainer } from '../../components/common/ScreenContainer';

const exchangePreview = [
  {
    name: 'Binance Futures',
    marketLabel: 'Principal · integración prioritaria',
    description:
      'Preparado como primer exchange para el bot futures, con estructura pensada para conexión oficial más adelante.',
    availabilityLabel: 'Primero',
    availabilityTone: 'featured' as const,
    highlights: [
      'USD-M Futures',
      'Preparado para permisos y modos',
      'Base ideal para la siguiente fase',
    ],
    featured: true,
  },
  {
    name: 'OKX',
    marketLabel: 'Próxima expansión',
    description:
      'Visible desde el inicio para que el módulo nazca multi-exchange y no quede amarrado a un solo proveedor.',
    availabilityLabel: 'Próximo',
    availabilityTone: 'planned' as const,
    highlights: [
      'Futuros preparados en UI',
      'Estructura escalable',
      'Sin lógica activa todavía',
    ],
  },
  {
    name: 'Bybit',
    marketLabel: 'Próxima expansión',
    description:
      'Diseñado para incorporarse como opción real sin rehacer la experiencia ni los componentes del módulo.',
    availabilityLabel: 'Próximo',
    availabilityTone: 'planned' as const,
    highlights: [
      'Mismo patrón operativo',
      'Cards reutilizables',
      'Flujo listo para crecer',
    ],
  },
];

export default function BotFuturesHomeScreen() {
  const { colors } = useAppTheme();

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <BotFuturesHeader
        title="Bot Futures"
        subtitle="Un módulo visual, limpio y listo para crecer a múltiples exchanges sin comprometer la estructura."
      />

      <BotStatusCard
        statusLabel="En espera"
        modeLabel="Simulado"
        exchangeLabel="Sin exchange conectado"
        summary="Esta primera fase deja listo el centro operativo del bot futures con una UI clara, profesional y preparada para Binance Futures, OKX, Bybit y futuras integraciones."
      />

      <View style={styles.summaryGrid}>
        <BotQuickSummaryCard
          label="Exchange"
          value="Multi-exchange"
          note="Binance Futures queda visible como la integración principal de la siguiente fase."
        />
        <BotQuickSummaryCard
          label="Modo activo"
          value="Simulado"
          note="También se muestran Testnet y Real, sin lógica todavía."
        />
        <BotQuickSummaryCard
          label="Estado del bot"
          value="Pausado"
          note="Controles visuales ya listos para activación posterior."
        />
        <BotQuickSummaryCard
          label="Seguridad"
          value="Sin claves"
          note="En esta fase no se piden API keys ni conexiones reales."
        />
      </View>

      <BotControlBar
        primaryLabel="Conectar Exchange"
        secondaryLabel="Modo del Bot"
        onPrimary={() => router.push('/bot-futures/connect-exchange')}
        onSecondary={() => router.push('/bot-futures/mode')}
      />

      <View
        style={[
          styles.infoShell,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.8),
            borderColor: withOpacity(colors.borderStrong, 0.18),
          },
        ]}
      >
        <BotSectionTitle
          title="Panel rápido"
          subtitle="La base del módulo ya separa estado, controles y exchanges compatibles para que el bot futures crezca con orden."
        />
      </View>

      <BotSectionTitle
        title="Exchanges visibles en esta fase"
        subtitle="La UI ya nace multi-exchange, con Binance Futures como primera integración pensada para la siguiente etapa."
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exchangeRow}
      >
        {exchangePreview.map((exchange) => (
          <View key={exchange.name} style={styles.exchangePreviewCard}>
            <ExchangeOptionCard
              name={exchange.name}
              marketLabel={exchange.marketLabel}
              description={exchange.description}
              availabilityLabel={exchange.availabilityLabel}
              availabilityTone={exchange.availabilityTone}
              highlights={exchange.highlights}
              featured={exchange.featured}
              onPress={() => router.push('/bot-futures/connect-exchange')}
            />
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 42,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoShell: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
  },
  exchangeRow: {
    gap: 12,
    paddingRight: 8,
  },
  exchangePreviewCard: {
    width: 304,
  },
});
