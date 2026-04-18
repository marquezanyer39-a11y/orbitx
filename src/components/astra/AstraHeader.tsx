import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { AstraAnimatedLogo } from './AstraAnimatedLogo';

interface Props {
  title: string;
  subtitle: string;
  statusLabel: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onClose: () => void;
}

export function AstraHeader({
  title,
  subtitle,
  statusLabel,
  menuOpen,
  onToggleMenu,
  onClose,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.header,
        {
          borderColor: withOpacity(colors.borderStrong, 0.52),
          backgroundColor: withOpacity(colors.surface, 0.92),
        },
      ]}
    >
      <View style={styles.identity}>
        <View
          style={[
            styles.logoShell,
            {
              borderColor: withOpacity(colors.profit, 0.28),
              backgroundColor: withOpacity(colors.surfaceElevated, 0.98),
              shadowColor: colors.profit,
            },
          ]}
        >
          <AstraAnimatedLogo size={28} emphasis="subtle" />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: withOpacity(colors.profit, 0.12),
                borderColor: withOpacity(colors.profit, 0.22),
              },
            ]}
          >
            <View style={[styles.badgeDot, { backgroundColor: colors.profit }]} />
            <Text style={[styles.badgeLabel, { color: colors.profit }]}>{statusLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onToggleMenu}
          style={[
            styles.iconButton,
            {
              borderColor: menuOpen
                ? withOpacity(colors.profit, 0.28)
                : withOpacity(colors.borderStrong, 0.5),
              backgroundColor: menuOpen
                ? withOpacity(colors.profit, 0.12)
                : withOpacity(colors.fieldBackground, 0.92),
            },
          ]}
        >
          <Ionicons name="menu-outline" size={18} color={menuOpen ? colors.profit : colors.textSoft} />
        </Pressable>

        <Pressable
          onPress={onClose}
          style={[
            styles.iconButton,
            {
              borderColor: withOpacity(colors.borderStrong, 0.5),
              backgroundColor: withOpacity(colors.fieldBackground, 0.92),
            },
          ]}
        >
          <Ionicons name="close" size={18} color={colors.textSoft} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    borderWidth: 1,
    borderRadius: RADII.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  logoShell: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 22,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    minHeight: 26,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
  },
  badgeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
