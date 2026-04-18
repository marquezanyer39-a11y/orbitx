import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';

import { RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { AstraAnimatedLogo } from './AstraAnimatedLogo';

interface Props {
  onPress: () => void;
  size?: number;
  label?: string;
  variant?: 'icon' | 'pill';
  accessibilityLabel?: string;
}

export function AstraEntryPoint({
  onPress,
  size = 42,
  label,
  variant = 'icon',
  accessibilityLabel = 'Astra',
}: Props) {
  const { colors } = useAppTheme();
  const isPill = variant === 'pill';
  const logoSize = isPill ? 22 : size >= 52 ? 40 : 24;

  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityLabel={accessibilityLabel}>
      <LinearGradient
        colors={[
          withOpacity(colors.surfaceElevated, 0.98),
          withOpacity(colors.primary, isPill ? 0.12 : 0.1),
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.base,
          isPill ? styles.pill : styles.iconShell,
          {
            width: isPill ? undefined : size,
            height: isPill ? undefined : size,
            borderRadius: isPill ? RADII.pill : size / 2,
            borderColor: withOpacity(colors.primary, isPill ? 0.22 : 0.2),
            shadowColor: colors.primary,
          },
        ]}
      >
        <AstraAnimatedLogo size={logoSize} emphasis={isPill ? 'subtle' : 'entry'} />
        {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  iconShell: {
    overflow: 'visible',
  },
  pill: {
    minHeight: 40,
    paddingHorizontal: 14,
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
