import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  subtitle: string;
}

export function BotFuturesHeader({ title, subtitle }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={[
          styles.backButton,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
            borderColor: withOpacity(colors.borderStrong, 0.28),
          },
        ]}
      >
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </Pressable>

      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 26,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 21,
  },
});
