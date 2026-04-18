import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

export interface BotSegmentedOption {
  id: string;
  label: string;
}

interface Props {
  options: BotSegmentedOption[];
  value: string;
  onChange: (next: string) => void;
}

export function BotSegmentedModeTabs({ options, value, onChange }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.72),
          borderColor: withOpacity(colors.borderStrong, 0.18),
        },
      ]}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[
              styles.segment,
              {
                backgroundColor: active ? withOpacity(colors.primary, 0.14) : 'transparent',
                borderColor: active ? withOpacity(colors.primary, 0.24) : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: active ? colors.primary : colors.textMuted },
              ]}
            >
              {option.label}
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
    gap: 8,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 6,
  },
  segment: {
    flex: 1,
    minHeight: 42,
    borderRadius: RADII.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  segmentLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
