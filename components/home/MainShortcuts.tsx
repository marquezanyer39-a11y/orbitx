import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../constants/theme';
import { CARD_RADIUS, ORBITX_THEME } from './orbitxTheme';

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
      {items.map((item, index) => {
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
              size={isSmallPhone ? 21 : 22}
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
            {index < items.length - 1 ? <View style={styles.divider} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.12),
    backgroundColor: withOpacity(ORBITX_THEME.colors.surfaceSoft, 0.5),
    overflow: 'hidden',
  },
  item: {
    flex: 1,
    minWidth: 0,
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    position: 'relative',
  },
  label: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 11.5,
    lineHeight: 13,
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
  divider: {
    position: 'absolute',
    right: 0,
    top: 16,
    bottom: 16,
    width: 1,
    backgroundColor: withOpacity(ORBITX_THEME.colors.border, 0.22),
  },
  pressed: {
    opacity: 0.78,
  },
});
