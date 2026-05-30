import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, View } from 'react-native';

import { withOpacity } from '../../../constants/theme';

interface SocialBottomNavProps {
  bottomInset: number;
  onHome: () => void;
  onSearch: () => void;
  onCreate: () => void;
  onNotifications: () => void;
  onInbox: () => void;
  onProfile?: () => void;
}

export function SocialBottomNav({
  bottomInset,
  onHome,
  onSearch,
  onCreate,
  onNotifications,
  onInbox,
  onProfile,
}: SocialBottomNavProps) {
  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: Math.max(bottomInset, 14) }]}>
      <BlurView intensity={26} tint="dark" style={styles.nav}>
        <NavIcon icon="compass" active onPress={onHome} />
        <NavIcon icon="search" onPress={onSearch} />
        <View style={styles.centerSlot}>
          <View pointerEvents="none" style={styles.plusGlow} />
          <Pressable onPress={onCreate} style={({ pressed }) => [styles.plusButton, pressed && styles.pressed]}>
            <Ionicons name="add" size={36} color="#001B09" />
          </Pressable>
        </View>
        <NavIcon icon="notifications-outline" hasDot onPress={onNotifications} />
        <NavIcon icon={onProfile ? 'person-circle-outline' : 'paper-plane-outline'} onPress={onProfile ?? onInbox} />
      </BlurView>
    </View>
  );
}

function NavIcon({
  icon,
  active = false,
  hasDot = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  hasDot?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.navIcon, pressed && styles.pressed]}>
      <Ionicons name={icon} size={29} color={active ? '#3FE56C' : 'rgba(255,255,255,0.46)'} />
      {hasDot ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 20,
  },
  nav: {
    height: 72,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(0,0,0,0.22)',
    overflow: 'visible',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  navIcon: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    width: 74,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -34,
  },
  plusGlow: {
    position: 'absolute',
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: withOpacity('#00C853', 0.18),
    shadowColor: '#00C853',
    shadowOpacity: 0.46,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
  },
  plusButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3FE56C',
    shadowColor: '#00C853',
    shadowOpacity: 0.42,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#3FE56C',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
});
