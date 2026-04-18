import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  summary: string;
  bullets: string[];
  active?: boolean;
  onPress: () => void;
}

export function StrategyPresetCard({
  title,
  summary,
  bullets,
  active = false,
  onPress,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(active ? colors.primary : colors.borderStrong, active ? 0.3 : 0.18),
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.summary, { color: colors.textSoft }]}>{summary}</Text>

      <View style={styles.bullets}>
        {bullets.map((bullet) => (
          <Text key={bullet} style={[styles.bullet, { color: colors.textMuted }]}>
            - {bullet}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  summary: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  bullets: {
    gap: 6,
  },
  bullet: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 19,
  },
});
