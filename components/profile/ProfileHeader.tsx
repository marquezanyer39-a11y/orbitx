import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PROFILE_THEME, withProfileAlpha } from './profileTheme';

interface ProfileHeaderProps {
  onBack: () => void;
  onGrid: () => void;
  onSettings: () => void;
}

export function ProfileHeader({ onBack, onGrid, onSettings }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable onPress={onBack} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={20} color={PROFILE_THEME.colors.textPrimary} />
        </Pressable>

        <View style={styles.actions}>
          <Pressable onPress={onGrid} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Ionicons name="grid-outline" size={18} color={PROFILE_THEME.colors.textPrimary} />
          </Pressable>
          <Pressable
            onPress={onSettings}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="settings-outline" size={18} color={PROFILE_THEME.colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Personaliza tu experiencia en OrbitX</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceHigh, 0.9),
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.outline, 0.8),
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  copy: {
    gap: 4,
  },
  title: {
    color: PROFILE_THEME.colors.textPrimary,
    fontFamily: PROFILE_THEME.typography.title,
    fontSize: 28,
    lineHeight: 31,
  },
  subtitle: {
    color: PROFILE_THEME.colors.textSecondary,
    fontFamily: PROFILE_THEME.typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
