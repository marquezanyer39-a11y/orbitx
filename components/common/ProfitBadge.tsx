import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface ProfitBadgeProps {
  value: string;
  positive?: boolean;
}

export function ProfitBadge({ value, positive = true }: ProfitBadgeProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: positive ? colors.profitSoft : colors.lossSoft,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: positive ? colors.profit : colors.loss,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
});
