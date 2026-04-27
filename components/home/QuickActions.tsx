import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';

interface QuickActionItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function QuickActions({ items }: { items: QuickActionItem[] }) {
  return (
    <View style={styles.shell}>
      {items.map((item, index) => (
        <Pressable key={item.key} onPress={item.onPress} style={styles.item}>
          <View style={styles.iconShell}>
            <Ionicons name={item.icon} size={18} color="#1EDC8B" />
          </View>
          <Text style={styles.label}>{item.label}</Text>
          {index < items.length - 1 ? <View style={styles.divider} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#11131A',
    borderWidth: 1,
    borderColor: '#232634',
    borderTopWidth: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    position: 'relative',
  },
  iconShell: {
    width: 34,
    height: 34,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: withOpacity('#1EDC8B', 0.2),
    backgroundColor: withOpacity('#1EDC8B', 0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#F5F7FA',
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  divider: {
    position: 'absolute',
    right: 0,
    top: 12,
    bottom: 12,
    width: 1,
    backgroundColor: '#232634',
  },
});
