import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PROFILE_THEME, withProfileAlpha } from './profileTheme';

interface ProfileSecurityCardProps {
  title: string;
  body: string;
  ctaLabel: string;
  loading?: boolean;
  onPress: () => void;
}

export function ProfileSecurityCard({
  title,
  body,
  ctaLabel,
  loading,
  onPress,
}: ProfileSecurityCardProps) {
  return (
    <LinearGradient
      colors={[
        withProfileAlpha(PROFILE_THEME.colors.secondary, 0.16),
        withProfileAlpha(PROFILE_THEME.colors.surfaceHigh, 0.96),
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="shield-checkmark-outline" size={18} color={PROFILE_THEME.colors.secondary} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>

      <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>{loading ? 'Enviando...' : ctaLabel}</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: PROFILE_THEME.radius.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.outline, 0.42),
    overflow: 'hidden',
    gap: 10,
  },
  iconWrap: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceLowest, 0.82),
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.secondary, 0.28),
  },
  copy: {
    gap: 6,
  },
  title: {
    color: PROFILE_THEME.colors.textPrimary,
    fontFamily: PROFILE_THEME.typography.title,
    fontSize: 20,
    lineHeight: 24,
  },
  body: {
    color: PROFILE_THEME.colors.textSecondary,
    fontFamily: PROFILE_THEME.typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    alignSelf: 'flex-start',
    minWidth: 110,
    height: 36,
    borderRadius: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PROFILE_THEME.colors.secondary,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
  buttonText: {
    color: PROFILE_THEME.colors.background,
    fontFamily: PROFILE_THEME.typography.bodyStrong,
    fontSize: 13,
  },
});
