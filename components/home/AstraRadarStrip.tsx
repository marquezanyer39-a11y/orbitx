import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { ORBITX_THEME } from './orbitxTheme';

interface AstraRadarStripProps {
  insight: string;
  isSmallPhone?: boolean;
  onPress: () => void;
}

export function AstraRadarStrip({
  insight,
  isSmallPhone = false,
  onPress,
}: AstraRadarStripProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        isSmallPhone ? styles.rootSmall : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.leftRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="radio-outline" size={16} color={ORBITX_THEME.colors.primaryGreen} />
        </View>

        <View style={styles.copyColumn}>
          <Text style={styles.eyebrow} numberOfLines={1}>
            Radar Astra
          </Text>
          <Text
            style={[styles.insight, isSmallPhone ? styles.insightSmall : null]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {insight}
          </Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        <Text style={styles.cta}>Ver mas</Text>
        <Ionicons name="chevron-forward" size={14} color={ORBITX_THEME.colors.primaryGreen} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 82,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.6),
    backgroundColor: withOpacity(ORBITX_THEME.colors.surface, 0.72),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    gap: 12,
  },
  rootSmall: {
    minHeight: 76,
    paddingHorizontal: 12,
  },
  leftRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.15),
  },
  copyColumn: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  eyebrow: {
    color: withOpacity(ORBITX_THEME.colors.textSecondary, 0.9),
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  insight: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  insightSmall: {
    fontSize: 13,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cta: {
    color: ORBITX_THEME.colors.primaryGreen,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.78,
  },
});
