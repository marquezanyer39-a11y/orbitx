import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { CARD_RADIUS, ORBITX_THEME } from './orbitxTheme';

interface PromoBannerProps {
  isSmallPhone?: boolean;
  onPress: () => void;
}

export function PromoBanner({ isSmallPhone = false, onPress }: PromoBannerProps) {
  return (
    <LinearGradient
      colors={['#0D0E10', '#102015']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, isSmallPhone ? styles.cardSmall : null]}
    >
      <View style={styles.copyColumn}>
        <Text
          style={[styles.title, isSmallPhone ? styles.titleSmall : null]}
          numberOfLines={isSmallPhone ? 2 : 1}
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
          style={({ pressed }) => [styles.ctaButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.ctaLabel} numberOfLines={1}>
            Ver más
          </Text>
        </Pressable>

        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <View style={styles.giftHalo}>
        <Ionicons name="gift-outline" size={16} color={withOpacity('#FFFFFF', 0.82)} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 76,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.12),
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardSmall: {
    minHeight: 74,
    paddingHorizontal: 12,
  },
  copyColumn: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  title: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 13.5,
    lineHeight: 17,
  },
  titleSmall: {
    fontSize: 12.8,
  },
  subtitle: {
    marginTop: 3,
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 10.6,
  },
  subtitleSmall: {
    fontSize: 10.2,
  },
  rightColumn: {
    minWidth: 78,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 7,
  },
  ctaButton: {
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 10.8,
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
    right: 78,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.06),
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.1),
  },
  pressed: {
    opacity: 0.78,
  },
});
