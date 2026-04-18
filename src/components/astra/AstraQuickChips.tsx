import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AstraAction } from '../../types/astra';
import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

export interface AstraQuickChipItem {
  id: string;
  label: string;
  tone?: 'primary' | 'secondary';
  action?: AstraAction;
}

interface Props {
  chips: AstraQuickChipItem[];
  onPress: (chip: AstraQuickChipItem) => void;
}

export function AstraQuickChips({ chips, onPress }: Props) {
  const { colors } = useAppTheme();

  if (!chips.length) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.wrap}
    >
      {chips.map((chip) => {
        const isPrimary = chip.tone === 'primary';
        return (
          <Pressable
            key={chip.id}
            onPress={() => onPress(chip)}
            style={[
              styles.chip,
              {
                backgroundColor: isPrimary
                  ? withOpacity(colors.profit, 0.12)
                  : withOpacity(colors.surfaceElevated, 0.96),
                borderColor: isPrimary
                  ? withOpacity(colors.profit, 0.26)
                  : withOpacity(colors.profit, 0.18),
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isPrimary ? colors.profit : colors.textSoft },
              ]}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={styles.trailingSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 4,
  },
  chip: {
    minHeight: 34,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  trailingSpace: {
    width: 2,
  },
});
