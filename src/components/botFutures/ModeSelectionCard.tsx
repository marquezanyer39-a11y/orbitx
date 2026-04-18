import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

type Accent = 'blue' | 'slate' | 'danger';

interface Props {
  title: string;
  description: string;
  riskLabel: string;
  accent: Accent;
  selected?: boolean;
  onPress: () => void;
}

function resolveAccent(accent: Accent, colors: ReturnType<typeof useAppTheme>['colors']) {
  if (accent === 'danger') {
    return colors.loss;
  }

  if (accent === 'slate') {
    return '#8CA0B3';
  }

  return '#39B8F2';
}

function resolveIcon(accent: Accent): keyof typeof Ionicons.glyphMap {
  if (accent === 'danger') {
    return 'warning-outline';
  }

  if (accent === 'slate') {
    return 'server-outline';
  }

  return 'checkmark-outline';
}

export function ModeSelectionCard({
  title,
  description,
  riskLabel,
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
          backgroundColor:
            accent === 'danger'
              ? withOpacity(accentColor, 0.16)
              : withOpacity(colors.surfaceElevated, 0.88),
          borderColor: withOpacity(accentColor, selected ? 0.56 : 0.28),
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: withOpacity(accentColor, 0.12) }]}>
          <Ionicons name={resolveIcon(accent)} size={18} color={accentColor} />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textSoft }]}>{description}</Text>
        </View>
      </View>

      <Text style={[styles.riskLabel, { color: accentColor }]}>{riskLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  riskLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 16,
  },
});
