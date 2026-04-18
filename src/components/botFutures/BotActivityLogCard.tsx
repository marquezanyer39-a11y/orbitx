import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  time: string;
  title: string;
  body: string;
}

export function BotActivityLogCard({ time, title, body }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(colors.borderStrong, 0.18),
        },
      ]}
    >
      <Text style={[styles.time, { color: colors.textMuted }]}>{time}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textSoft }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  time: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
});
