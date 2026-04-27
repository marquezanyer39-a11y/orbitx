import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';

interface ShortcutItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function MainShortcuts({ items }: { items: ShortcutItem[] }) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <Pressable key={item.key} onPress={item.onPress} style={styles.tile}>
          <View style={styles.iconShell}>
            <Ionicons name={item.icon} size={20} color="#1EDC8B" />
          </View>
          <Text style={styles.label}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    minHeight: 84,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#11131A',
    borderWidth: 1,
    borderColor: '#232634',
  },
  iconShell: {
    width: 36,
    height: 36,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#1EDC8B', 0.08),
  },
  label: {
    color: '#F5F7FA',
    fontFamily: FONT.medium,
    fontSize: 14,
  },
});
