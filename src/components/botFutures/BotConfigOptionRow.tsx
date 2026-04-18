import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  label: string;
  value: string;
  description?: string;
  active?: boolean;
  onPress: () => void;
}

export function BotConfigOptionRow({
  label,
  value,
  description,
  active = false,
  onPress,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(active ? colors.primary : colors.borderStrong, active ? 0.26 : 0.16),
        },
      ]}
    >
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
        ) : null}
      </View>
      <View
        style={[
          styles.valueShell,
          {
            backgroundColor: withOpacity(active ? colors.primary : colors.surfaceElevated, 0.12),
            borderColor: withOpacity(active ? colors.primary : colors.borderStrong, active ? 0.22 : 0.16),
          },
        ]}
      >
        <Text style={[styles.value, { color: active ? colors.primary : colors.textSoft }]}>{value}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 15,
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  valueShell: {
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  value: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
});
