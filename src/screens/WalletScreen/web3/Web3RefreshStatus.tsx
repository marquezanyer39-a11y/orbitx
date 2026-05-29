import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { COLORS, styles } from './web3WalletStyles';
import { Web3ErrorState } from './Web3ErrorState';

interface Web3RefreshStatusProps {
  isError?: boolean;
  message?: string;
}

export function Web3RefreshStatus({ isError = false, message }: Web3RefreshStatusProps) {
  if (!message) return null;
  if (isError) return <Web3ErrorState message={message} />;

  return (
    <View style={styles.infoBanner}>
      <Ionicons name="information-circle-outline" size={18} color={COLORS.web3Blue} />
      <Text style={styles.infoText} numberOfLines={2}>{message}</Text>
    </View>
  );
}
