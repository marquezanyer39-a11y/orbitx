import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';

interface Props {
  label: string;
}

export function PoolCountdownPill({ label }: Props) {
  return (
    <LinearGradient
      colors={['rgba(23, 235, 255, 0.14)', 'rgba(13, 26, 42, 0.94)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pill}
    >
      <Ionicons name="trophy" size={11} color="#F0D29A" />
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: withOpacity('#22E8FF', 0.22),
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: '#E9FBFF',
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 14,
  },
});
