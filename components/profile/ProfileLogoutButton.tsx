import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PROFILE_THEME, withProfileAlpha } from './profileTheme';

interface ProfileLogoutButtonProps {
  loading?: boolean;
  onPress: () => void;
}

export function ProfileLogoutButton({ loading, onPress }: ProfileLogoutButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <View style={styles.content}>
        <Ionicons name="log-out-outline" size={18} color={PROFILE_THEME.colors.danger} />
        <Text style={styles.text}>{loading ? 'Cerrando sesión...' : 'Cerrar sesión'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    borderRadius: PROFILE_THEME.radius.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.danger, 0.1),
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.danger, 0.24),
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.986 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    color: PROFILE_THEME.colors.danger,
    fontFamily: PROFILE_THEME.typography.bodyStrong,
    fontSize: 16,
  },
});
