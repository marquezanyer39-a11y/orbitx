import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';

import { FONT } from '../../../../constants/theme';
import { POOL_THEME } from '../../../components/rewardsPool/poolVisualTheme';

interface Props {
  label: string;
  disabled: boolean;
  onPress: () => void;
}

export function PoolParticipateButton({ label, disabled, onPress }: Props) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <LinearGradient
        colors={
          disabled
            ? ['rgba(117,126,138,0.5)', 'rgba(52,60,74,0.8)']
            : [POOL_THEME.colors.accentCyan, '#42B8FF']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ctaButton: {
    minHeight: 52,
    borderRadius: POOL_THEME.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: POOL_THEME.colors.accentCyan,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontFamily: FONT.semibold,
    fontSize: 15,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
