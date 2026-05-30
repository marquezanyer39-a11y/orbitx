import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

interface CreatorEarningsStripProps {
  items: Array<{ label: string; value: string }>;
}

export const CreatorEarningsStrip = memo(function CreatorEarningsStrip({
  items,
}: CreatorEarningsStripProps) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: withOpacity('#192219', 0.7),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    width: '47%',
    gap: 3,
  },
  value: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  label: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 11,
  },
});
