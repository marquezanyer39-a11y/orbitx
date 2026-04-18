import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title: string;
  value: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function BalanceCard({ title, value, body, icon }: Props) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
          borderColor: withOpacity(colors.borderStrong, 0.75),
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: withOpacity(colors.primary, 0.05),
              borderColor: withOpacity(colors.borderStrong, 0.58),
            },
          ]}
        >
          <Ionicons name={icon} size={15} color={colors.textMuted} />
        </View>
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    minHeight: 108,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  value: {
    fontFamily: FONT.bold,
    fontSize: 17,
    lineHeight: 22,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 'auto',
  },
});
