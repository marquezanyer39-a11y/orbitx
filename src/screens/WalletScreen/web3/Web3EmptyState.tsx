import { Text, View } from 'react-native';

import { styles } from './web3WalletStyles';

export function Web3EmptyState() {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>No se encontraron activos</Text>
      <Text style={styles.emptyBody}>Cambia el filtro o actualiza tus saldos Web3.</Text>
    </View>
  );
}
