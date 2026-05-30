import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

interface SocialProfileBottomNavProps {
  bottomInset: number;
  onHome: () => void;
  onSearch: () => void;
  onCreate: () => void;
  onNotifications: () => void;
  onInbox: () => void;
}

export function SocialProfileBottomNav({
  bottomInset,
  onHome,
  onSearch,
  onCreate,
  onNotifications,
  onInbox,
}: SocialProfileBottomNavProps) {
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(bottomInset, 14) }]}>
      <BlurView intensity={22} tint="dark" style={styles.nav}>
        <NavItem icon="home-outline" label="Home" onPress={onHome} />
        <NavItem icon="search-outline" label="Search" onPress={onSearch} />

        <Pressable onPress={onCreate} style={({ pressed }) => [styles.plusButton, pressed && styles.pressed]}>
          <Ionicons name="add" size={24} color="#003912" />
        </Pressable>

        <NavItem icon="notifications-outline" label="Notifications" onPress={onNotifications} />
        <NavItem icon="paper-plane-outline" label="Inbox" onPress={onInbox} />
      </BlurView>
    </View>
  );
}

function NavItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      <Ionicons name={icon} size={18} color="#FAFAFA" />
      <Text style={styles.itemLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
  },
  nav: {
    minHeight: 76,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,21,24,0.66)',
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.22),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  item: {
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  itemLabel: {
    color: '#FAFAFA',
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  plusButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3FE56C',
    shadowColor: '#00C853',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    marginTop: -18,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
});
