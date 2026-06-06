import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import { POOL_THEME } from './poolVisualTheme';

interface Props {
  label: string;
}

export function PoolCountdownPill({ label }: Props) {
  return (
    <View style={styles.pill}>
      <Ionicons name="timer-outline" size={13} color={POOL_THEME.colors.accentCyan} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    minHeight: 34,
    borderRadius: POOL_THEME.radius.chip,
    borderWidth: 1,
    borderColor: 'rgba(59,167,255,0.42)',
    backgroundColor: POOL_THEME.colors.cardSecondary,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    maxWidth: 210,
    color: POOL_THEME.colors.accentCyan,
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 16,
  },
});
