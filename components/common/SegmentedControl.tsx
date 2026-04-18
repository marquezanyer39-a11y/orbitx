import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { FONT, RADII, SPACING } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

export interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.85}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              {
                backgroundColor: colors.fieldBackground,
                borderColor: colors.border,
              },
              active && {
                backgroundColor: colors.primarySoft,
                borderColor: colors.borderStrong,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.text : colors.textMuted },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADII.pill,
    borderWidth: 1,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
});
