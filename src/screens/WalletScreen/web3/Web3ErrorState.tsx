import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { COLORS, styles } from './web3WalletStyles';

interface Web3ErrorStateProps {
  message: string;
}

export function Web3ErrorState({ message }: Web3ErrorStateProps) {
  return (
    <View style={[styles.infoBanner, styles.infoBannerError]}>
      <Ionicons name="warning-outline" size={18} color={COLORS.warning} />
      <Text style={styles.infoText} numberOfLines={2}>{message}</Text>
    </View>
  );
}
