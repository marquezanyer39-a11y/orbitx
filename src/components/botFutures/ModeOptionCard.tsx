import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  badge: string;
  description: string;
  details: string[];
  active?: boolean;
  onPress: () => void;
}

export function ModeOptionCard({
  title,
  badge,
  description,
  details,
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
          borderColor: withOpacity(
            active ? colors.primary : colors.borderStrong,
            active ? 0.32 : 0.18,
          ),
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textSoft }]}>{description}</Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: withOpacity(
                active ? colors.primary : colors.surfaceElevated,
                0.12,
              ),
              borderColor: withOpacity(
                active ? colors.primary : colors.borderStrong,
                active ? 0.24 : 0.2,
              ),
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: active ? colors.primary : colors.textMuted }]}>
            {badge}
          </Text>
        </View>
      </View>

      <View style={styles.detailList}>
        {details.map((item) => (
          <Text key={item} style={[styles.detailItem, { color: colors.textMuted }]}>
            • {item}
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
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailList: {
    gap: 8,
  },
  detailItem: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 19,
  },
});
