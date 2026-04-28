import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../constants/theme';
import { ORBITX_THEME } from './orbitxTheme';

interface QuickActionItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function QuickActions({
  items,
  isSmallPhone = false,
}: {
  items: QuickActionItem[];
  isSmallPhone?: boolean;
}) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.item,
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={[styles.iconWrap, isSmallPhone ? styles.iconWrapSmall : null]}>
            <Ionicons
              name={item.icon}
              size={isSmallPhone ? 21 : 22}
              color={ORBITX_THEME.colors.textPrimary}
            />
          </View>
          <Text
            style={[styles.label, isSmallPhone ? styles.labelSmall : null]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#162116',
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.8),
  },
  iconWrapSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  label: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 12,
    textAlign: 'center',
  },
  labelSmall: {
    fontSize: 11.5,
  },
  pressed: {
    opacity: 0.78,
  },
});
