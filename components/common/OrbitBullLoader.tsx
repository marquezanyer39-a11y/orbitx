import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { OrbitLogo } from './OrbitLogo';
import { COLORS, FONT, RADII, SPACING, withOpacity } from '../../constants/theme';

interface OrbitBullLoaderProps {
  label?: string;
}

export function OrbitBullLoader({ label = 'Cargando OrbitX...' }: OrbitBullLoaderProps) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#040408', '#0B0B0F', '#040408']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[withOpacity(COLORS.primary, 0.22), withOpacity(COLORS.profit, 0.08), 'transparent']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.heroGlow}
      />

      <View style={styles.stage}>
        <View style={styles.heroShell}>
          <View style={styles.ring} />
          <View style={styles.ringInner} />
          <View style={styles.logoGlow} />
          <OrbitLogo size={126} animated />
          <Text style={styles.title}>OrbitX</Text>
          <Text style={styles.subtitle}>
            Acceso seguro, mercado sincronizado y experiencia lista para abrir.
          </Text>
        </View>

        <View style={styles.meta}>
          <View style={[styles.statusRow, { backgroundColor: withOpacity('#FFFFFF', 0.05) }]}>
            <ActivityIndicator color={COLORS.profit} />
            <Text style={styles.label}>{label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 420,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 22,
  },
  heroShell: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 320,
  },
  ring: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.primary, 0.22),
    transform: [{ rotate: '-12deg' }],
  },
  ringInner: {
    position: 'absolute',
    width: 214,
    height: 214,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withOpacity('#FFFFFF', 0.08),
    transform: [{ rotate: '16deg' }],
  },
  logoGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: withOpacity(COLORS.primary, 0.16),
  },
  title: {
    color: '#EAEAF0',
    fontFamily: FONT.bold,
    fontSize: 30,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 300,
    color: withOpacity('#EAEAF0', 0.74),
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  meta: {
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADII.pill,
  },
  label: {
    color: '#EAEAF0',
    fontFamily: FONT.medium,
    fontSize: 14,
  },
});
