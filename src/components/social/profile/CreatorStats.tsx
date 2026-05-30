import { BlurView } from 'expo-blur';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

export interface CreatorStatItem {
  label: string;
  value: string;
}

interface CreatorStatsProps {
  items: CreatorStatItem[];
}

export const CreatorStats = memo(function CreatorStats({ items }: CreatorStatsProps) {
  return (
    <BlurView intensity={18} tint="dark" style={styles.wrap}>
      <Text style={styles.demoLabel}>Metricas demo</Text>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </BlurView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(20,21,24,0.52)',
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.22),
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  demoLabel: {
    width: '100%',
    color: '#FFD76A',
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  item: {
    flex: 1,
    gap: 4,
  },
  value: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  label: {
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 10,
    letterSpacing: 0.9,
  },
});
