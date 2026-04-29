import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PROFILE_THEME, withProfileAlpha } from './profileTheme';

export interface ProfileListItem {
  key: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface ProfilePreferencesListProps {
  items: ProfileListItem[];
}

export function ProfilePreferencesList({ items }: ProfilePreferencesListProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View style={styles.left}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={16} color={PROFILE_THEME.colors.textPrimary} />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
          </View>

          <View style={styles.right}>
            <Text style={styles.value} numberOfLines={1}>
              {item.value}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={PROFILE_THEME.colors.textMuted} />
          </View>

          {index < items.length - 1 ? <View style={styles.separator} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: PROFILE_THEME.radius.card,
    overflow: 'hidden',
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceLow, 0.92),
    borderWidth: 1,
    borderColor: withProfileAlpha(PROFILE_THEME.colors.outline, 0.36),
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  pressed: {
    opacity: 0.84,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    minWidth: 0,
  },
  iconWrap: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.surfaceHigh, 0.9),
  },
  label: {
    color: PROFILE_THEME.colors.textPrimary,
    fontFamily: PROFILE_THEME.typography.bodyMedium,
    fontSize: 15,
    flex: 1,
    minWidth: 0,
  },
  right: {
    flexShrink: 0,
    maxWidth: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
  },
  value: {
    color: PROFILE_THEME.colors.textSecondary,
    fontFamily: PROFILE_THEME.typography.body,
    fontSize: 12,
    textAlign: 'right',
    flexShrink: 1,
    minWidth: 0,
  },
  separator: {
    position: 'absolute',
    left: 56,
    right: 14,
    bottom: 0,
    height: 1,
    backgroundColor: withProfileAlpha(PROFILE_THEME.colors.outline, 0.28),
  },
});
