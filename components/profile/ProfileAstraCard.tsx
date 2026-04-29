import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PROFILE_THEME, withProfileAlpha } from './profileTheme';

interface ProfileAstraCardProps {
  onPress: () => void;
}

export function ProfileAstraCard({ onPress }: ProfileAstraCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <LinearGradient
        colors={[
          withProfileAlpha(PROFILE_THEME.colors.primary, 0.2),
          withProfileAlpha(PROFILE_THEME.colors.surfaceLow, 0.96),
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.left}>
          <View style={styles.iconWrap}>
            <Ionicons name="sparkles-outline" size={18} color={PROFILE_THEME.colors.primary} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>Astra</Text>
            <Text style={styles.body}>Soporte con IA 24/7</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={PROFILE_THEME.colors.textSecondary} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: PROFILE_THEME.radius.card,
    overflow: 'hidden',
  },
  gradient: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: PROFILE_THEME.radius.card,
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.outline, 0.42),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.986 }],
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
    flex: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceLowest, 0.88),
  },
  copy: {
    minWidth: 0,
    gap: 4,
    flex: 1,
  },
  title: {
    color: PROFILE_THEME.colors.textPrimary,
    fontFamily: PROFILE_THEME.typography.bodyStrong,
    fontSize: 18,
  },
  body: {
    color: PROFILE_THEME.colors.textSecondary,
    fontFamily: PROFILE_THEME.typography.body,
    fontSize: 14,
  },
});
