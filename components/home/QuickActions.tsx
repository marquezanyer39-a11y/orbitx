import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../constants/theme';
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
              size={isSmallPhone ? 19 : 20}
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
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 4,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 34,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  iconWrapSmall: {
    width: 32,
    height: 28,
    borderRadius: 8,
  },
  label: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 11.5,
    textAlign: 'center',
  },
  labelSmall: {
    fontSize: 11,
  },
  pressed: {
    opacity: 0.78,
  },
});
