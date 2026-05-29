import { Text, View } from 'react-native';

import { formatUsd, maskAddress } from './useWeb3WalletViewModel';
import { styles } from './web3WalletStyles';

interface Web3ExternalWalletCardProps {
  balanceUsd: number;
  externalAddress: string;
}

export function Web3ExternalWalletCard({ balanceUsd, externalAddress }: Web3ExternalWalletCardProps) {
  return (
    <View style={styles.walletStatusRow}>
      <Text style={styles.walletStatusLabel}>Wallet externa conectada</Text>
      <Text style={styles.walletStatusValue}>
        {externalAddress ? `${maskAddress(externalAddress)} · ${formatUsd(balanceUsd)}` : 'No conectada'}
      </Text>
    </View>
  );
}
