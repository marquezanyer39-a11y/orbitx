import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  body: string;
}

export function TradeManagementCard({ title, body }: Props) {
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
