import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  value: number | null;
  onSelect: (value: number) => void;
}

export function QuickPercentBar({ value, onSelect }: Props) {
  const { colors } = useAppTheme();
  const values = [25, 50, 75, 100];

  return (
    <View style={styles.row}>
      {values.map((item) => {
        const active = value === item;
        return (
          <Pressable
            key={item}
            onPress={() => onSelect(item)}
            style={[
              styles.tab,
              {
                backgroundColor: active ? colors.primarySoft : withOpacity(colors.fieldBackground, 0.9),
                borderColor: active ? colors.borderStrong : colors.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: active ? colors.text : colors.textMuted }]}>
              {item}%
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
  },
  tab: {
    flex: 1,
    minHeight: 22,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 9,
  },
});
