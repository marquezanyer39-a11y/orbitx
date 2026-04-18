import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { TradeSide } from '../../types';

interface Props {
  value: TradeSide;
  onChange: (value: TradeSide) => void;
}

export function BuySellToggle({ value, onChange }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: withOpacity(colors.fieldBackground, 0.92), borderColor: colors.border },
      ]}
    >
      {[
        { key: 'buy' as const, label: 'Comprar' },
        { key: 'sell' as const, label: 'Vender' },
      ].map((item) => {
        const active = value === item.key;
        const activeColor = item.key === 'buy' ? colors.profit : colors.loss;

        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[
              styles.tab,
              {
                backgroundColor: active ? withOpacity(activeColor, item.key === 'buy' ? 0.84 : 0.78) : 'transparent',
              },
            ]}
          >
            <Text style={[styles.label, { color: active ? colors.background : colors.textMuted }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
});
