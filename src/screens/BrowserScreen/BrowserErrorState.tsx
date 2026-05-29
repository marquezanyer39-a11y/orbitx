import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { COLORS, styles } from './browserStyles';

interface BrowserErrorStateProps {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}

export function BrowserErrorState({ actionLabel, body, onAction, title }: BrowserErrorStateProps) {
  return (
    <View style={[styles.webFallback, styles.webFallbackFullscreen]}>
      <Ionicons name="globe-outline" size={42} color={COLORS.purpleSoft} />
      <Text style={styles.webFallbackTitle}>{title}</Text>
      <Text style={styles.webFallbackBody}>{body}</Text>
      <Pressable onPress={onAction} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <Text style={styles.primaryButtonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}
