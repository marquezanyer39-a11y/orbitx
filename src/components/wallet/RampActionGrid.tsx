import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface RampActionGridProps {
  buyLabel: string;
  sellLabel: string;
  convertLabel: string;
  payLabel: string;
  onBuy: () => void;
  onSell: () => void;
  onConvert: () => void;
  onPay: () => void;
}

interface CardProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

function ActionCard({ label, icon, onPress }: CardProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
          borderColor: withOpacity(colors.primary, 0.18),
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: withOpacity(colors.primary, 0.14),
            borderColor: withOpacity(colors.primary, 0.22),
          },
        ]}
      >
        <Ionicons name={icon} size={15} color={colors.primary} />
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function RampActionGrid({
  buyLabel,
  sellLabel,
  convertLabel,
  payLabel,
  onBuy,
  onSell,
  onConvert,
  onPay,
}: RampActionGridProps) {
  return (
    <View style={styles.grid}>
      <ActionCard label={buyLabel} icon="add-circle-outline" onPress={onBuy} />
      <ActionCard label={sellLabel} icon="remove-circle-outline" onPress={onSell} />
      <ActionCard label={convertLabel} icon="swap-horizontal-outline" onPress={onConvert} />
      <ActionCard label={payLabel} icon="card-outline" onPress={onPay} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    flexBasis: '48.4%',
    flexGrow: 1,
    minHeight: 108,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'space-between',
    gap: 18,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
});
