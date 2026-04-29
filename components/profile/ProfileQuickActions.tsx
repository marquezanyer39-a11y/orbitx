import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PROFILE_THEME, withProfileAlpha } from './profileTheme';

export interface ProfileQuickActionItem {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface ProfileQuickActionsProps {
  items: ProfileQuickActionItem[];
  isSmallPhone: boolean;
}

export function ProfileQuickActions({ items, isSmallPhone }: ProfileQuickActionsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Acciones rápidas</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={16} color={PROFILE_THEME.colors.textPrimary} />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.cardTitle, isSmallPhone && styles.cardTitleSmall]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  title: {
    color: PROFILE_THEME.colors.textPrimary,
    fontFamily: PROFILE_THEME.typography.title,
    fontSize: 20,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    width: '48.6%',
    minWidth: 0,
    borderRadius: PROFILE_THEME.radius.secondary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceLow, 0.92),
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.outline, 0.42),
    minHeight: 98,
    gap: 10,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
  iconWrap: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceHigh, 0.88),
  },
  copy: {
    minWidth: 0,
    gap: 4,
  },
  cardTitle: {
    color: PROFILE_THEME.colors.textPrimary,
    fontFamily: PROFILE_THEME.typography.bodyStrong,
    fontSize: 15,
    lineHeight: 19,
  },
  cardTitleSmall: {
    fontSize: 14,
  },
  cardSubtitle: {
    color: PROFILE_THEME.colors.textSecondary,
    fontFamily: PROFILE_THEME.typography.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
