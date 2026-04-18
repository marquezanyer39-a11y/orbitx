import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { BotFuturesConnectionStatus } from './useBotFuturesOnboarding';

interface Props {
  status: BotFuturesConnectionStatus;
  error?: string | null;
}

function getStatusCopy(status: BotFuturesConnectionStatus) {
  if (status === 'connected') {
    return 'Conectado';
  }

  if (status === 'validating') {
    return 'Validando';
  }

  if (status === 'error') {
    return 'Error';
  }

  return 'No validado';
}

export function ConnectionStatusCard({ status, error }: Props) {
  const { colors } = useAppTheme();
  const accent =
    status === 'connected'
      ? colors.profit
      : status === 'validating'
        ? colors.warning
        : status === 'error'
          ? colors.loss
          : colors.textMuted;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.86),
          borderColor: withOpacity(colors.borderStrong, 0.18),
        },
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.text }]}>Estado de conexion</Text>
        <Text style={[styles.statusLabel, { color: accent }]}>{getStatusCopy(status)}</Text>
      </View>

      <View style={styles.progressRow}>
        {(['idle', 'validating', 'connected', 'error'] as BotFuturesConnectionStatus[]).map(
          (step) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    step === status ? accent : withOpacity(colors.borderStrong, 0.2),
                },
              ]}
            />
          ),
        )}
      </View>

      <Text style={[styles.note, { color: error ? colors.loss : colors.textMuted }]}>
        {error
          ? error
          : status === 'connected'
            ? 'Las claves quedaron validadas visualmente y ya puedes continuar.'
            : status === 'validating'
              ? 'Revisando formato y consistencia local antes de continuar.'
              : 'Debes validar las claves antes de continuar.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 16,
    lineHeight: 20,
  },
  statusLabel: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 16,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
  },
  note: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
