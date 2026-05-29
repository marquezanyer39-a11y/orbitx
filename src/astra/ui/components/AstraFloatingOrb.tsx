import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AstraFloatingOrbProps } from '../types/astraUi.types';
import { astraUiTheme } from '../theme/astraUiTheme';

export function AstraFloatingOrb({
  visible = true,
  unreadCount = 0,
  label = 'Astra',
  bottomOffset = 24,
  rightOffset = 20,
  onPress,
}: AstraFloatingOrbProps) {
  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: bottomOffset, right: rightOffset }]}>
      <View pointerEvents="none" style={styles.glow} />
      <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Ionicons name="sparkles" size={20} color={astraUiTheme.colors.background} />
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : `${unreadCount}`}</Text>
          </View>
        ) : null}
      </Pressable>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
  },
  glow: {
    position: 'absolute',
    top: -8,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: astraUiTheme.colors.accentSoft,
    ...astraUiTheme.shadow.accent,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: astraUiTheme.colors.accent,
    borderWidth: 1,
    borderColor: astraUiTheme.colors.borderStrong,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: astraUiTheme.colors.danger,
  },
  badgeText: {
    color: astraUiTheme.colors.white,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 10,
  },
  label: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
});
