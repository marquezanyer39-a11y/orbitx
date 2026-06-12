import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { AstraLocalInsight } from '../../services/astra/astraLocalInsights';

interface Props {
  insight: AstraLocalInsight;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
}

export function AstraLocalInsightCard({
  insight,
  onPrimaryPress,
  onSecondaryPress,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.fieldBackground, 0.82),
          borderColor: withOpacity(colors.primary, 0.26),
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.copyBlock}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>{insight.eyebrow}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{insight.title}</Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: withOpacity(colors.primary, 0.12),
              borderColor: withOpacity(colors.primary, 0.24),
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: colors.text }]}>Solo lectura</Text>
        </View>
      </View>

      <Text style={[styles.body, { color: colors.textMuted }]}>{insight.body}</Text>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={onPrimaryPress}
          style={({ pressed }) => [
            styles.primaryAction,
            {
              backgroundColor: withOpacity(colors.primary, 0.18),
              borderColor: withOpacity(colors.primary, 0.34),
            },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="sparkles-outline" size={14} color={colors.text} />
          <Text style={[styles.primaryActionText, { color: colors.text }]}>{insight.primaryLabel}</Text>
        </Pressable>

        <Pressable
          onPress={onSecondaryPress}
          style={({ pressed }) => [
            styles.secondaryAction,
            {
              backgroundColor: withOpacity(colors.fieldBackground, 0.9),
              borderColor: withOpacity(colors.border, 0.82),
            },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="analytics-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.secondaryActionText, { color: colors.textMuted }]}>
            {insight.secondaryLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  copyBlock: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  badge: {
    minHeight: 24,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: FONT.medium,
    fontSize: 10,
  },
  body: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryAction: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryAction: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryActionText: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  secondaryActionText: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.84,
  },
});
