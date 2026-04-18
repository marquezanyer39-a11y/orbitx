import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  subtitle: string;
  onBack: () => void;
  onSettings: () => void;
}

export function BotFuturesCommandHeader({
  title,
  subtitle,
  onBack,
  onSettings,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        style={[
          styles.iconButton,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
            borderColor: withOpacity(colors.borderStrong, 0.22),
          },
        ]}
      >
        <Ionicons name="arrow-back" size={18} color={colors.text} />
      </Pressable>

      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onSettings}
        style={[
          styles.iconButton,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
            borderColor: withOpacity(colors.borderStrong, 0.22),
          },
        ]}
      >
        <Ionicons name="settings-outline" size={17} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 22,
    lineHeight: 26,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
