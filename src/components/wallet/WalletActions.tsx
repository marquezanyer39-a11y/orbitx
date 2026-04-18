import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  onDeposit: () => void;
  onReceive: () => void;
  onSend: () => void;
  onWithdraw: () => void;
  onTrade: () => void;
}

const ACTIONS = [
  { key: 'deposit', label: 'Depositar', icon: 'add-circle-outline' as const },
  { key: 'receive', label: 'Recibir', icon: 'arrow-down-outline' as const },
  { key: 'send', label: 'Enviar', icon: 'paper-plane-outline' as const },
  { key: 'withdraw', label: 'Retirar', icon: 'arrow-up-outline' as const },
] as const;

export function WalletActions({
  onDeposit,
  onReceive,
  onSend,
  onWithdraw,
  onTrade,
}: Props) {
  const { colors } = useAppTheme();

  const handlers = {
    deposit: onDeposit,
    receive: onReceive,
    send: onSend,
    withdraw: onWithdraw,
  } as const;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.key}
            onPress={handlers[action.key]}
            style={[
              styles.actionButton,
              {
                backgroundColor: withOpacity(colors.surfaceElevated, 0.9),
                borderColor: withOpacity(colors.borderStrong, 0.72),
              },
            ]}
          >
            <Ionicons name={action.icon} size={15} color={withOpacity(colors.text, 0.78)} />
            <Text style={[styles.actionLabel, { color: colors.textSoft }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={onTrade}
        style={[
          styles.tradeButton,
          {
            backgroundColor: colors.primary,
            borderColor: withOpacity(colors.primary, 0.88),
          },
        ]}
      >
        <Text style={[styles.tradeLabel, { color: colors.background }]}>Operar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  tradeButton: {
    alignSelf: 'flex-start',
    minWidth: 108,
    minHeight: 46,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
});
