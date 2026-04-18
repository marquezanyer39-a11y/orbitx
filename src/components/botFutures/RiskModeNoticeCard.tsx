import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  label: string;
  title: string;
  body: string;
  active?: boolean;
  tone?: 'safe' | 'test' | 'real';
  onPress: () => void;
}

export function RiskModeNoticeCard({
  label,
  title,
  body,
  active = false,
  tone = 'safe',
  onPress,
}: Props) {
  const { colors } = useAppTheme();
  const accent =
    tone === 'real' ? colors.warning : tone === 'test' ? colors.primary : colors.profit;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(active ? accent : colors.borderStrong, active ? 0.32 : 0.18),
        },
      ]}
    >
      <View
        style={[
          styles.badge,
          {
            backgroundColor: withOpacity(accent, 0.12),
            borderColor: withOpacity(accent, 0.22),
          },
        ]}
      >
        <Text style={[styles.badgeLabel, { color: accent }]}>{label}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textSoft }]}>{body}</Text>
      {tone === 'real' ? (
        <Text style={[styles.realWarning, { color: colors.warning }]}>
          En modo real existe riesgo de perdidas reales y cambios de estructura que pueden dejar
          una idea sin validez operativa.
        </Text>
      ) : null}
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
  badge: {
    alignSelf: 'flex-start',
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  realWarning: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    lineHeight: 18,
  },
});
