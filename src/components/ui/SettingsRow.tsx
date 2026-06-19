import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../constants/theme';

const CYAN = '#00E5FF';
const AMBER = '#F5A623';
const RED = '#FF3B6B';
const TEXT = '#F8FBFF';
const MUTED = '#8A94A6';
const BORDER_INNER = '#1A2234';

type IconVariant = 'cyan' | 'amber' | 'red' | 'dim';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  badge?: string;
  iconVariant?: IconVariant;
  onPress?: () => void;
  disabled?: boolean;
  isLast?: boolean;
}

const ICON_BG: Record<IconVariant, string> = {
  cyan: 'rgba(0,229,255,0.10)',
  amber: 'rgba(245,166,35,0.12)',
  red: 'rgba(255,59,107,0.12)',
  dim: 'rgba(255,255,255,0.05)',
};

const ICON_COLOR: Record<IconVariant, string> = {
  cyan: CYAN,
  amber: AMBER,
  red: RED,
  dim: MUTED,
};

export function SettingsRow({
  icon,
  label,
  subtitle,
  badge,
  iconVariant = 'cyan',
  onPress,
  disabled = false,
  isLast = false,
}: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        disabled && styles.rowDisabled,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: ICON_BG[iconVariant] },
        ]}
      >
        <Ionicons name={icon} size={17} color={ICON_COLOR[iconVariant]} />
      </View>

      <View style={styles.content}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>

      <Ionicons name="chevron-forward" size={16} color={withOpacity(MUTED, 0.6)} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER_INNER,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: TEXT,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: MUTED,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: 'rgba(0,229,255,0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: FONT.bold,
    fontSize: 9,
    color: CYAN,
    letterSpacing: 0.5,
  },
});
