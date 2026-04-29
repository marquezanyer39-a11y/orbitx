import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PROFILE_THEME, withProfileAlpha } from './profileTheme';

interface ProfileCustomizationCardProps {
  summary: string;
  onPress: () => void;
}

export function ProfileCustomizationCard({
  summary,
  onPress,
}: ProfileCustomizationCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <LinearGradient
        colors={[
          withProfileAlpha(PROFILE_THEME.colors.primary, 0.14),
          withProfileAlpha(PROFILE_THEME.colors.surfaceHigh, 0.98),
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.left}>
          <View style={styles.iconWrap}>
            <Ionicons name="color-palette-outline" size={17} color={PROFILE_THEME.colors.textPrimary} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title} numberOfLines={2}>
              Colores, temas y movimiento
            </Text>
            <Text style={styles.body} numberOfLines={2}>
              Gestiona toda la personalización de OrbitX.
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.summary} numberOfLines={2}>
            {summary}
          </Text>
          <Ionicons name="chevron-forward" size={17} color={PROFILE_THEME.colors.textSecondary} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: PROFILE_THEME.radius.card,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
  gradient: {
    minHeight: 88,
    borderRadius: PROFILE_THEME.radius.card,
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.outline, 0.4),
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceLowest, 0.88),
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    color: PROFILE_THEME.colors.textPrimary,
    fontFamily: PROFILE_THEME.typography.bodyStrong,
    fontSize: 15,
    lineHeight: 19,
  },
  body: {
    color: PROFILE_THEME.colors.textSecondary,
    fontFamily: PROFILE_THEME.typography.body,
    fontSize: 12,
    lineHeight: 16,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
    maxWidth: 96,
    flexShrink: 0,
  },
  summary: {
    color: PROFILE_THEME.colors.textSecondary,
    fontFamily: PROFILE_THEME.typography.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
    flexShrink: 1,
  },
});
