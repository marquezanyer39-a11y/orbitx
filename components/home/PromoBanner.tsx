import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { ORBITX_THEME } from './orbitxTheme';

interface PromoBannerProps {
  isSmallPhone?: boolean;
  onPress: () => void;
}

export function PromoBanner({ isSmallPhone = false, onPress }: PromoBannerProps) {
  return (
    <LinearGradient
      colors={['#0D0E10', '#0F1A12']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, isSmallPhone ? styles.cardSmall : null]}
    >
      <View style={styles.copyColumn}>
        <Text
          style={[styles.title, isSmallPhone ? styles.titleSmall : null]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Invita y gana hasta 100 USDT
        </Text>
        <Text
          style={[styles.subtitle, isSmallPhone ? styles.subtitleSmall : null]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Comparte OrbitX y recibe recompensas
        </Text>
      </View>

      <View style={styles.rightColumn}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.ctaLabel} numberOfLines={1}>
            Ver mas
          </Text>
        </Pressable>

        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <View style={styles.giftHalo}>
        <Ionicons name="gift-outline" size={18} color={withOpacity('#FFFFFF', 0.82)} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.55),
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardSmall: {
    minHeight: 84,
    paddingHorizontal: 14,
  },
  copyColumn: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  title: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  titleSmall: {
    fontSize: 13,
  },
  subtitle: {
    marginTop: 3,
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  subtitleSmall: {
    fontSize: 10.5,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
  },
  ctaButton: {
    minHeight: 30,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: withOpacity('#FFFFFF', 0.08),
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: RADII.pill,
    backgroundColor: withOpacity('#FFFFFF', 0.18),
  },
  dotActive: {
    backgroundColor: ORBITX_THEME.colors.primaryGreen,
  },
  giftHalo: {
    position: 'absolute',
    right: 74,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.14),
  },
  pressed: {
    opacity: 0.78,
  },
});
