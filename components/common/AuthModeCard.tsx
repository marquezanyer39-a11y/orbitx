import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from './GlassCard';
import { FONT, RADII, SPACING, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface AuthModeCardProps {
  title: string;
  body: string;
  live: boolean;
}

export function AuthModeCard({ title, body, live }: AuthModeCardProps) {
  const { colors } = useAppTheme();

  return (
    <GlassCard highlighted>
      <View style={styles.row}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: live ? colors.profitSoft : colors.primarySoft,
              borderColor: withOpacity(live ? colors.profit : colors.primary, 0.24),
            },
          ]}
        >
          <Ionicons
            name={live ? 'mail-open-outline' : 'hardware-chip-outline'}
            size={18}
            color={live ? colors.profit : colors.primary}
          />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.body, { color: colors.textSoft }]}>{body}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  body: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
});
