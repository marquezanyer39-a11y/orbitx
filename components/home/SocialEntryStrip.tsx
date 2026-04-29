import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../constants/theme';
import { CARD_RADIUS, ORBITX_THEME } from './orbitxTheme';

interface SocialEntryStripProps {
  isSmallPhone?: boolean;
  onPress: () => void;
}

export function SocialEntryStrip({ isSmallPhone = false, onPress }: SocialEntryStripProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        isSmallPhone ? styles.rootSmall : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.iconShell}>
        <Ionicons name="radio-outline" size={18} color={ORBITX_THEME.colors.primaryGreen} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>
          Social OrbitX
        </Text>
        <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
          Comunidad y transmisiones en vivo
        </Text>
      </View>

      <View style={styles.ctaRow}>
        <Text style={styles.cta} numberOfLines={1}>
          Explorar
        </Text>
        <Ionicons name="chevron-forward" size={15} color={ORBITX_THEME.colors.primaryGreen} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    minHeight: 72,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.border, 0.2),
    backgroundColor: withOpacity(ORBITX_THEME.colors.surfaceSoft, 0.82),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  rootSmall: {
    minHeight: 68,
    paddingHorizontal: 14,
    gap: 10,
  },
  iconShell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(ORBITX_THEME.colors.primaryGreen, 0.2),
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    color: ORBITX_THEME.colors.textPrimary,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  subtitle: {
    color: ORBITX_THEME.colors.textSecondary,
    fontFamily: FONT.regular,
    fontSize: 11.5,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cta: {
    color: ORBITX_THEME.colors.primaryGreen,
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.78,
  },
});
