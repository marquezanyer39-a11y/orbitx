import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

type Accent = 'gold' | 'blue' | 'slate' | 'muted';

interface Props {
  title: string;
  status: string;
  description: string;
  shortName: string;
  accent: Accent;
  selected?: boolean;
  onPress: () => void;
}

function resolveAccent(accent: Accent, colors: ReturnType<typeof useAppTheme>['colors']) {
  if (accent === 'gold') {
    return '#E5B74B';
  }

  if (accent === 'blue') {
    return '#4E8DFF';
  }

  if (accent === 'slate') {
    return '#A8B4C0';
  }

  return colors.textMuted;
}

export function ExchangeSelectionCard({
  title,
  status,
  description,
  shortName,
  accent,
  selected = false,
  onPress,
}: Props) {
  const { colors } = useAppTheme();
  const accentColor = resolveAccent(accent, colors);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
          borderColor: withOpacity(accentColor, selected ? 0.54 : 0.2),
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.logoWrap, { backgroundColor: withOpacity(accentColor, 0.12) }]}>
          <Text style={[styles.logoText, { color: accentColor }]}>{shortName}</Text>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.status, { color: accentColor }]}>{status}</Text>
          <Text style={[styles.description, { color: colors.textSoft }]}>{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    lineHeight: 14,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 17,
    lineHeight: 20,
  },
  status: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    lineHeight: 16,
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 18,
  },
});
