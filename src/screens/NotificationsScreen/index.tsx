import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useTradeStore } from '../../store/tradeStore';
import { useOrbitStore } from '../../../store/useOrbitStore';

export default function NotificationsScreen() {
  const { colors } = useAppTheme();
  const settings = useOrbitStore((state) => state.settings);
  const setNotificationsEnabled = useOrbitStore((state) => state.setNotificationsEnabled);
  const priceAlerts = useTradeStore((state) => state.priceAlerts);

  const pendingAlerts = priceAlerts.filter((alert) => !alert.triggeredAt);
  const triggeredAlerts = priceAlerts.filter((alert) => alert.triggeredAt);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SectionHeader
        title="Notificaciones"
        subtitle="Controla alertas de mercado y avisos importantes sin saturar tu experiencia."
      />

      <View style={[styles.card, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Avisos de OrbitX</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          {settings.notificationsEnabled
            ? 'Las notificaciones de cuenta y mercado estan activas.'
            : 'Las notificaciones estan pausadas. Puedes reactivarlas cuando quieras.'}
        </Text>
        <PrimaryButton
          label={settings.notificationsEnabled ? 'Pausar notificaciones' : 'Activar notificaciones'}
          tone="secondary"
          onPress={() => setNotificationsEnabled(!settings.notificationsEnabled)}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.fieldBackground, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Alertas de precio</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          {pendingAlerts.length
            ? `${pendingAlerts.length} alertas siguen activas y ${triggeredAlerts.length} ya se dispararon.`
            : 'Todavia no configuraste alertas de precio desde el grafico.'}
        </Text>
        {pendingAlerts.slice(0, 4).map((alert) => (
          <View key={alert.id} style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{alert.pairId.toUpperCase()}</Text>
            <Text style={[styles.rowValue, { color: colors.textMuted }]}>
              {alert.direction === 'above_or_equal' ? '>= ' : '<= '}
              {alert.targetPrice}
            </Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  rowValue: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
});
