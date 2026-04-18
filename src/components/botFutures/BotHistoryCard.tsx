import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  date: string;
  title: string;
  body: string;
  tag: string;
}

export function BotHistoryCard({ date, title, body, tag }: Props) {
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
      <View style={styles.topRow}>
        <Text style={[styles.date, { color: colors.textMuted }]}>{date}</Text>
        <View
          style={[
            styles.tagShell,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.82),
              borderColor: withOpacity(colors.borderStrong, 0.16),
            },
          ]}
        >
          <Text style={[styles.tag, { color: colors.textSoft }]}>{tag}</Text>
        </View>
      </View>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  date: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tagShell: {
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tag: {
    fontFamily: FONT.medium,
    fontSize: 11,
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
