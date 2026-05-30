import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../../constants/theme';

interface VIPBadgeProps {
  label?: string;
}

export const VIPBadge = memo(function VIPBadge({ label = 'VIP' }: VIPBadgeProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    minHeight: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#3FE56C',
    justifyContent: 'center',
  },
  label: {
    color: '#003912',
    fontFamily: FONT.bold,
    fontSize: 10,
    letterSpacing: 0.9,
  },
});
