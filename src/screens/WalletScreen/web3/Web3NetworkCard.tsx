import { Pressable, Text, View } from 'react-native';

import { styles } from './web3WalletStyles';

interface Web3NetworkCardProps {
  chainId?: number | null;
  externalAddress: string;
  isRefreshing: boolean;
  isSwitchingNetwork: boolean;
  networkName: string;
  onRefresh: () => void;
  onShowSwitchHint: () => void;
}

export function Web3NetworkCard({
  chainId,
  externalAddress,
  isRefreshing,
  isSwitchingNetwork,
  networkName,
  onRefresh,
  onShowSwitchHint,
}: Web3NetworkCardProps) {
  return (
    <>
      <View style={styles.walletStatusRow}>
        <Text style={styles.walletStatusLabel}>Red actual</Text>
        <Text style={styles.walletStatusValue}>
          {chainId ? `${networkName} · Chain ID ${chainId}` : networkName}
        </Text>
      </View>
      <View style={styles.walletStatusActions}>
        <Pressable
          onPress={onRefresh}
          style={({ pressed }) => [styles.inlineActionButton, pressed && styles.pressed]}
        >
          <Text style={styles.inlineActionText}>
            {isRefreshing ? 'Actualizando...' : 'Actualizar saldo'}
          </Text>
        </Pressable>
        <Pressable
          disabled={!externalAddress}
          onPress={onShowSwitchHint}
          style={({ pressed }) => [
            styles.inlineActionButton,
            !externalAddress && styles.disabledAction,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.inlineActionText}>
            {isSwitchingNetwork ? 'Cambiando red...' : 'Cambiar red'}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
