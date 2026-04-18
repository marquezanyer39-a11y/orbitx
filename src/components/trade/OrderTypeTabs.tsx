import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { OrderType } from '../../types';

interface Props {
  value: OrderType;
  onChange: (value: OrderType) => void;
}

export function OrderTypeTabs({ value, onChange }: Props) {
  const { colors } = useAppTheme();
  const options: OrderType[] = ['market', 'limit', 'stop'];

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: withOpacity(colors.fieldBackground, 0.92), borderColor: colors.border },
      ]}
    >
      {options.map((item) => {
        const active = item === value;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={[
              styles.tab,
              {
                backgroundColor: active ? colors.primarySoft : 'transparent',
                borderColor: active ? colors.borderStrong : 'transparent',
              },
            ]}
          >
            <Text style={[styles.label, { color: active ? colors.text : colors.textMuted }]}>
              {item === 'market' ? 'Market' : item === 'limit' ? 'Limit' : 'Stop'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    borderWidth: 1,
    borderRadius: 11,
    padding: 3,
  },
  tab: {
    flex: 1,
    minHeight: 28,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 10,
  },
});
