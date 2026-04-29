import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../constants/theme';
import { ORBITX_THEME } from './orbitxTheme';

interface ShortcutItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function MainShortcuts({
  items,
  isSmallPhone = false,
}: {
  items: ShortcutItem[];
  isSmallPhone?: boolean;
}) {
  return (
    <View style={styles.row}>
      {items.map((item) => {
        const splitCreateToken = item.key === 'crear-token';
        const iconColor =
          item.key === 'operar'
            ? ORBITX_THEME.colors.primaryGreen
            : ORBITX_THEME.colors.textPrimary;

        return (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.item,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={iconColor}
            />

            {splitCreateToken ? (
              <View style={styles.multiLineWrap}>
                <Text style={[styles.label, isSmallPhone ? styles.labelSmall : null]}>Crear</Text>
                <Text style={[styles.label, isSmallPhone ? styles.labelSmall : null]}>token</Text>
              </View>
            ) : (
              <Text
                style={[styles.label, isSmallPhone ? styles.labelSmall : null]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  item: {
    flex: 1,
    minWidth: 0,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'center',
  },
  labelSmall: {
    fontSize: 11.5,
    lineHeight: 13,
  },
  multiLineWrap: {
    minWidth: 0,
    alignItems: 'center',
    gap: 1,
  },
  pressed: {
    opacity: 0.78,
  },
});
