import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { COLORS, styles } from './web3WalletStyles';

interface Web3WalletHeaderProps {
  onBack: () => void;
  onHelp: () => void;
  onConnect: () => void;
}

export function Web3WalletHeader({ onBack, onHelp, onConnect }: Web3WalletHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </Pressable>

      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Billetera Web3</Text>
        <Text style={styles.headerSubtitle}>Activos on-chain bajo tu control</Text>
      </View>

      <View style={styles.headerActions}>
        <Pressable onPress={onHelp} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
          <Ionicons name="help-circle-outline" size={22} color={COLORS.textSecondary} />
        </Pressable>
        <Pressable onPress={onConnect} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
          <Ionicons name="code-working-outline" size={22} color={COLORS.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}
