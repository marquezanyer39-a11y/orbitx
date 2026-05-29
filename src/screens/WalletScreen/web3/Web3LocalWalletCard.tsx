import { Text, View } from 'react-native';

import { formatUsd, maskAddress } from './useWeb3WalletViewModel';
import { styles } from './web3WalletStyles';

interface Web3LocalWalletCardProps {
  balanceUsd: number;
  localAddress: string;
}

export function Web3LocalWalletCard({ balanceUsd, localAddress }: Web3LocalWalletCardProps) {
  return (
    <View style={styles.walletStatusRow}>
      <Text style={styles.walletStatusLabel}>Wallet local QVEX</Text>
      <Text style={styles.walletStatusValue}>
        {localAddress ? `${maskAddress(localAddress)} · ${formatUsd(balanceUsd)}` : 'No disponible'}
      </Text>
    </View>
  );
}
