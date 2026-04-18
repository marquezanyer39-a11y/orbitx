import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  title?: string;
  body: string;
  onPress?: () => void;
}

export function EmergencyActionCard({
  title = 'Cerrar todo y detener',
  body,
  onPress,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.card, 0.98),
          borderColor: withOpacity(colors.warning, 0.22),
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: withOpacity(colors.warning, 0.12) }]}>
          <Ionicons name="warning-outline" size={18} color={colors.warning} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Emergency action</Text>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
      </View>
      <Text style={[styles.body, { color: colors.textSoft }]}>{body}</Text>
      <Pressable
        onPress={onPress}
        style={[
          styles.button,
          {
            backgroundColor: withOpacity(colors.warning, 0.1),
            borderColor: withOpacity(colors.warning, 0.22),
          },
        ]}
      >
        <Text style={[styles.buttonLabel, { color: colors.warning }]}>Cerrar todo y detener</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.xl,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
  button: {
    minHeight: 44,
    borderRadius: RADII.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
});
