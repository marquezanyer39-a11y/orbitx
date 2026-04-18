import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { ExchangeAvailabilityPill } from './ExchangeAvailabilityPill';

type Availability = 'featured' | 'planned' | 'soon';

interface Props {
  name: string;
  marketLabel: string;
  description: string;
  availabilityLabel: string;
  availabilityTone?: Availability;
  highlights: string[];
  featured?: boolean;
  onPress?: () => void;
}

export function ExchangeOptionCard({
  name,
  marketLabel,
  description,
  availabilityLabel,
  availabilityTone = 'planned',
  highlights,
  featured = false,
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
            featured ? colors.primary : colors.borderStrong,
            featured ? 0.28 : 0.18,
          ),
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <View
            style={[
              styles.logoShell,
              {
                backgroundColor: withOpacity(
                  featured ? colors.primary : colors.surfaceElevated,
                  0.14,
                ),
                borderColor: withOpacity(
                  featured ? colors.primary : colors.borderStrong,
                  0.24,
                ),
              },
            ]}
          >
            <Text style={[styles.logoText, { color: featured ? colors.primary : colors.text }]}>
              {name.slice(0, 1)}
            </Text>
          </View>

          <View style={styles.copy}>
            <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
            <Text style={[styles.marketLabel, { color: colors.textMuted }]}>{marketLabel}</Text>
          </View>
        </View>

        <ExchangeAvailabilityPill
          label={availabilityLabel}
          tone={availabilityTone}
        />
      </View>

      <Text style={[styles.description, { color: colors.textSoft }]}>{description}</Text>

      <View style={styles.highlights}>
        {highlights.map((item) => (
          <View key={item} style={styles.highlightRow}>
            <Ionicons
              name="checkmark-circle-outline"
              size={15}
              color={featured ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.highlightText, { color: colors.textMuted }]}>{item}</Text>
          </View>
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
  identity: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  logoShell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: FONT.bold,
    fontSize: 17,
  },
  marketLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  highlights: {
    gap: 8,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 18,
  },
});
